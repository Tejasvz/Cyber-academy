import type { GameMission } from './gameData';

export interface RangeState { completedSteps: number; currentDirectory: string; discoveredFlag: string | null }
export interface RangeResult { output: string[]; state: RangeState; tone: 'normal' | 'success' | 'warning' | 'error' }

const normalize = (command: string) => command.trim().toLowerCase().replace(/\s+/g, ' ');

const isMatch = (input: string, expected: string) => {
  const normalizedExpected = normalize(expected);
  return input === normalizedExpected || input.startsWith(`${normalizedExpected} `);
};

export const initialRangeState = (): RangeState => ({ completedSteps: 0, currentDirectory: '~', discoveredFlag: null });

export const executeRangeCommand = (mission: GameMission, command: string, state: RangeState): RangeResult => {
  const input = normalize(command);
  if (!input) return { output: [], state, tone: 'normal' };
  if (input === 'help') return { output: ['AVAILABLE: help, objectives, hint, clear, status', 'Use normal investigation commands shown in the mission briefing.', 'When a flag is recovered, run: submit flag{...}'], state, tone: 'normal' };
  if (input === 'objectives') return { output: mission.objectives.map((item, index) => `${index < state.completedSteps ? '[✓]' : '[ ]'} ${item.label}`), state, tone: 'normal' };
  if (input === 'hint') {
    const next = mission.objectives[Math.min(state.completedSteps, mission.objectives.length - 1)];
    return { output: [`AURELIA: Try ${next.command}`], state, tone: 'warning' };
  }
  if (input === 'status') return { output: [`MISSION ${mission.id} // ${state.completedSteps}/${mission.objectives.length} OBJECTIVES COMPLETE`, `CURRENT DIRECTORY: ${state.currentDirectory}`], state, tone: 'normal' };
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
      return { output: [...currentObjective.output.split('\n'), `[OBJECTIVE ${completedSteps}/${mission.objectives.length} COMPLETE]`, ...(discoveredFlag ? [`Flag captured. Submit with: submit ${discoveredFlag}`] : [])], state: { completedSteps, currentDirectory, discoveredFlag }, tone: discoveredFlag ? 'success' : 'normal' };
    }
  }

  const knownObjective = mission.objectives.find((objective) => [objective.command, ...(objective.alternatives ?? [])].some((candidate) => isMatch(input, candidate)));
  if (knownObjective) return { output: ['That action is valid, but the investigation chain is incomplete.', `Current objective: ${currentObjective?.label ?? 'Submit the recovered flag'}`], state, tone: 'warning' };
  return { output: [`Command not recognized in this range: ${command}`, "Type 'hint' or 'objectives' for guidance."], state, tone: 'error' };
};
