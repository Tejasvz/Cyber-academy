import type { GameMission } from './gameData';

export interface RangeState { completedSteps: number; currentDirectory: string; discoveredFlag: string | null; trace: number; recovered: boolean }
export interface RangeResult { output: string[]; state: RangeState; tone: 'normal' | 'success' | 'warning' | 'error' }

const normalize = (command: string) => command.trim().toLowerCase().replace(/\s+/g, ' ');

const isMatch = (input: string, expected: string) => {
  const normalizedExpected = normalize(expected);
  return input === normalizedExpected;
};

export const initialRangeState = (): RangeState => ({ completedSteps: 0, currentDirectory: '~', discoveredFlag: null, trace: 0, recovered: false });

export const executeRangeCommand = (mission: GameMission, command: string, state: RangeState, augments: string[] = []): RangeResult => {
  const input = normalize(command);
  if (!input) return { output: [], state, tone: 'normal' };
  if (input === 'help') return { output: ['AVAILABLE: help, objectives, hint, analysis, recover, clear, status', 'Use normal investigation commands shown in the mission briefing.', 'When a flag is recovered, run: submit flag{...}'], state, tone: 'normal' };
  if (input === 'objectives') return { output: mission.objectives.map((item, index) => `${index < state.completedSteps ? '[✓]' : '[ ]'} ${item.label}`), state, tone: 'normal' };
  if (input === 'hint' || input === 'analysis') {
    const next = mission.objectives[state.completedSteps];
    const hasAnalysis = augments.includes('analysis');
    return {
      output: [
        hasAnalysis ? 'ANALYSIS ASSIST [NEURAL PERK ONLINE]:' : 'AURELIA HANDLER HINT:',
        `Command: ${next?.command ?? `submit ${mission.flag}`}`,
        hasAnalysis && next ? `Objective: ${next.label}` : 'Execute command to advance range.',
      ].filter(Boolean) as string[],
      state,
      tone: 'warning',
    };
  }
  if (input === 'status') return { output: [`MISSION ${mission.id} // ${state.completedSteps}/${mission.objectives.length} OBJECTIVES COMPLETE`, `CURRENT DIRECTORY: ${state.currentDirectory}`, `TRACE LEVEL: ${state.trace}%`], state, tone: 'normal' };
  if (input.startsWith('submit ')) {
    const submitted = command.trim().slice(7).trim();
    if (submitted === mission.flag && state.discoveredFlag === mission.flag) return { output: ['FLAG VERIFIED.', 'MISSION OBJECTIVES COMPLETE.'], state, tone: 'success' };
    if (submitted === mission.flag) return { output: ['You know the key, but the range requires you to discover it through the objective chain first.'], state, tone: 'warning' };
    return { output: ['FLAG REJECTED. Check the captured evidence and try again.'], state, tone: 'error' };
  }
  if (input === 'clear') return { output: ['__CLEAR__'], state, tone: 'normal' };

  const currentObjective = mission.objectives[state.completedSteps];
  if (currentObjective) {
    const candidates = [currentObjective.command, ...(currentObjective.alternatives ?? [])];
    if (candidates.some((candidate) => isMatch(input, candidate))) {
      const completedSteps = state.completedSteps + 1;
      const discoveredFlag = currentObjective.output.includes(mission.flag) ? mission.flag : state.discoveredFlag;
      const currentDirectory = input.startsWith('cd ') ? `~/${input.slice(3).replace(/^\/+/, '')}` : state.currentDirectory;
      return { output: [...currentObjective.output.split('\n'), `[OBJECTIVE ${completedSteps}/${mission.objectives.length} COMPLETE]`, ...(discoveredFlag ? [`Flag captured. Submit with: submit ${discoveredFlag}`] : [])], state: { ...state, completedSteps, currentDirectory, discoveredFlag }, tone: discoveredFlag ? 'success' : 'normal' };
    }
  }

  const previous = mission.objectives.slice(0, state.completedSteps).find(objective => [objective.command, ...(objective.alternatives ?? [])].some(candidate => isMatch(input, candidate)));
  if (previous) return { output: previous.output.split('\n'), state, tone: 'normal' };
  const knownObjective = mission.objectives.find((objective) => [objective.command, ...(objective.alternatives ?? [])].some((candidate) => isMatch(input, candidate)));
  if (knownObjective) return { output: ['That action is valid, but the investigation chain is incomplete.', `Current objective: ${currentObjective?.label ?? 'Submit the recovered flag'}`], state, tone: 'warning' };
  return { output: [`Command not recognized in this range: ${command}`, "Type 'hint' or 'objectives' for guidance."], state, tone: 'error' };
};

export const getAutocompleteCandidates = (mission: GameMission, input: string): string[] => {
  const baseCommands = ['help', 'objectives', 'hint', 'analysis', 'clear', 'status', 'recover', 'ls', 'ls -a', 'crack', 'tune', `submit ${mission.flag}`];
  const objectiveCmds = mission.objectives.flatMap(o => [o.command, ...(o.alternatives ?? [])]);
  const allCandidates = Array.from(new Set([...baseCommands, ...objectiveCmds]));
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return [];
  return allCandidates.filter(c => c.toLowerCase().startsWith(trimmed) && c.toLowerCase() !== trimmed);
};


export const getVirtualTreeForMission = (mission: GameMission, completedSteps: number): Array<{ name: string; isDir: boolean; path: string; status: 'hidden' | 'visible' | 'discovered' }> => {
  const nodes = [
    { name: '~', isDir: true, path: `~/${mission.id}`, status: 'visible' as const },

    { name: 'traffic_dump.pcap', isDir: false, path: '~/traffic_dump.pcap', status: 'visible' as const },
    { name: 'archives', isDir: true, path: '~/archives', status: 'visible' as const },
    { name: '.flag.txt', isDir: false, path: '~/archives/.flag.txt', status: completedSteps >= 2 ? 'discovered' as const : 'hidden' as const },
    { name: 'hash.txt', isDir: false, path: '~/hash.txt', status: 'visible' as const },
    { name: 'emails.txt', isDir: false, path: '~/emails.txt', status: 'visible' as const },
  ];
  return nodes;
};

