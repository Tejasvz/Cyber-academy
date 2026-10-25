import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { NavTab, Operator, IntelItem, AINotification } from '../../types';
import { gameMissions, missionToHud, type GameMission } from '../../game/gameData';
import { campaignXP, completeMission, isUnlocked } from '../../game/campaign';
import { useCampaign } from '../../game/useCampaign';
import { ReferenceCommandDeck } from '../../components/HUD/ReferenceCommandDeck';
import { MissionBriefingModal } from '../../components/modals/MissionBriefingModal';
import { FullTerminalModal } from '../../components/modals/FullTerminalModal';
import { DiagnosticsModal } from '../../components/modals/DiagnosticsModal';
import { ViewTabOverlay } from '../../components/modals/ViewTabOverlay';
import { CampaignEnding } from '../../components/Mission/CampaignEnding';
import { sound } from '../../utils/audioSynth';
import { speakAurelia } from '../../utils/aureliaVoice';
import { HexMatrixBreach } from '../../components/minigames/HexMatrixBreach';
import { FrequencyTuner } from '../../components/minigames/FrequencyTuner';

const validTabs: NavTab[] = ['DASHBOARD', 'MISSIONS', 'MAP', 'INTEL', 'DATABASE', 'SANDBOX', 'SKILL_TREE', 'UPGRADES', 'OPERATOR', 'CONSPIRACY', 'SETTINGS', 'NOTIFICATIONS', 'TERMINAL'];
type Mood = 'neutral' | 'thinking' | 'speaking' | 'alert' | 'pleased';

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const { campaign, update, saveError } = useCampaign(user!.id);
  const [params, setParams] = useSearchParams();
  const requested = params.get('view') as NavTab;
  const activeTab = validTabs.includes(requested) ? requested : 'DASHBOARD';
  const navigate = (view: NavTab) => { setBriefing(false); setTerminal(false); setParams(view === 'DASHBOARD' ? {} : { view }); };
  const selected = gameMissions.find(m => m.id === campaign.active) ?? gameMissions[0];
  const completed = new Set(campaign.completed);
  const progress = completed.has(selected.id) ? 100 : Math.round((campaign.ranges[selected.id]?.completedSteps ?? 0) / selected.objectives.length * 100);
  const mission = missionToHud(selected, progress);
  const xp = campaignXP(campaign);
  const level = 1 + Math.floor(xp / 500);
  const operator: Operator = {
    name: user!.username, callsign: 'AETHER OPERATIVE', clearance: campaign.completed.length >= 6 ? 'SPECIALIST' : campaign.completed.length >= 3 ? 'OPERATOR' : 'NOVICE',
    trustLevel: 32 + campaign.completed.length * 8, level, xpCurrent: xp, xpNext: level * 500,
    badges: [
      { id: 'initiate', name: 'Aether Initiate', description: 'Established your neural link.', icon: 'Shield', unlocked: true },
      { id: 'first', name: 'First Signal', description: 'Complete Black Echo.', icon: 'Shield', unlocked: completed.has('B01') },
      { id: 'recon', name: 'Ghost Operator', description: 'Complete Silent Horizon.', icon: 'Shield', unlocked: completed.has('B04') },
      { id: 'archive', name: 'Memory Keeper', description: 'Complete Leviathan.', icon: 'Shield', unlocked: completed.has('B07') },
      { id: 'gate', name: 'Beyond the Veil', description: 'Choose the fate of the archives.', icon: 'Shield', unlocked: Boolean(campaign.ending) },
    ],
  };
  const intelList: IntelItem[] = [
    { id: 'field-guide', number: 1, title: 'SECTOR ZERO FIELD GUIDE', subtitle: 'Range orientation', date: 'PRE-DEPLOYMENT', classification: 'CONFIDENTIAL', content: 'Every operation runs inside an isolated simulator. Read the briefing, follow the investigation chain, then submit the recovered flag. Use help, objectives, hint and status. Invalid commands increase simulated trace; at 100%, reset the range. Progress is saved on this device per operator.' },
    ...gameMissions.filter(m => completed.has(m.id)).map((m, i) => ({ id: m.id, number: i + 2, title: `RECOVERED MEMORY // ${m.id}`, subtitle: m.title, date: 'VERIFIED CAPTURE', classification: 'TOP SECRET' as const, content: m.lore })),
  ];
  const notifications: AINotification[] = [
    { id: 'active', type: 'mission', title: campaign.ending ? 'ACT I ARCHIVED' : 'OPERATION AVAILABLE', description: campaign.ending ? `Final directive: ${campaign.ending.toUpperCase()}. Missions remain available for replay.` : `${selected.title}: ${progress}% investigated.`, timestamp: 'CURRENT', read: false },
    { id: 'intel', type: 'intel', title: 'EVIDENCE SYNCHRONIZED', description: `${campaign.completed.length} memory fragments recovered. Inspect the intel archive.`, timestamp: 'SAVED', read: true },
    { id: 'save', type: 'system', title: 'DEVICE-LOCAL CAMPAIGN', description: 'Checkpoints, purchases and your final choice are saved in this browser. Cloud campaign sync is not enabled.', timestamp: 'LOCAL', read: true },
  ];
  const health = { overall: campaign.ending === 'release' ? 20 : Math.min(100, 78 + campaign.completed.length * 2 + (campaign.diagnostics ? 6 : 0)), coreSystems: 78 + campaign.completed.length * 2, networkStability: campaign.channel ? 72 + (campaign.diagnostics ? 10 : 0) : 0, aiReliability: 89, secureChannelActive: campaign.channel };
  const [dialogue, setDialogue] = useState(`Welcome back, ${user!.username}. ${campaign.ending ? 'The Prime Gate is behind us. Your decision is preserved in the archive.' : `${selected.title} is awaiting your command. I will stay with you through the signal.`}`);
  const [mood, setMood] = useState<Mood>('neutral');
  const [speaking, setSpeaking] = useState(false);
  const [briefing, setBriefing] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const [diagnostics, setDiagnostics] = useState(false);
  const [initialCommand, setInitialCommand] = useState('');
  const [ending, setEnding] = useState(campaign.completed.length === gameMissions.length && !campaign.ending);
  const [activeMinigame, setActiveMinigame] = useState<'hex' | 'frequency' | null>(null);
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current++; window.speechSynthesis?.cancel(); }, []);
  const say = (text: string, emotion: Mood = 'neutral') => {
    setDialogue(text); setMood(emotion); setSpeaking(false);
    speakAurelia(text, () => setSpeaking(false), () => setSpeaking(true));
  };
  const talk = async (input: string) => {
    if (!campaign.channel) { say('The comm link is disconnected. Reconnect the secure channel to speak with me.', 'alert'); return; }
    const id = ++requestId.current;
    window.speechSynthesis?.cancel(); setSpeaking(false); setMood('thinking');
    let reply = /mission|help|status|stuck/i.test(input) ? `${selected.briefing} Your next step is: ${selected.objectives[campaign.ranges[selected.id]?.completedSteps ?? 0]?.label ?? 'submit the captured flag'}.`
      : /trust|afraid|alone/i.test(input) ? `I cannot promise that every signal beyond the gate is safe. But you have brought ${campaign.completed.length} fragments home. That matters to the minds still waiting. And it matters to me.`
      : /thank|hello|attention/i.test(input) ? `I am here, ${operator.name}. There is a quiet moment between every transmission. I used to think it was empty. Since you arrived, I have started listening to it.`
      : 'I hear you. Some of my memories were assigned to me; others arrived when we opened the archives together. What would you like to know: our mission, the recovered memories, or why I trust you?';
    // The authored offline dialogue is immediate; remote chat is optional and bounded.
    if (token !== 'local-training-session') {
      try {
        const response = await fetch('/api/aurelia/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: input }), signal: AbortSignal.timeout(5000) });
        if (response.ok) { const body = await response.json(); if (typeof body.reply === 'string') reply = body.reply; }
      } catch { /* Keep the authored local dialogue. */ }
    }
    if (id === requestId.current) say(reply, /trust|thank/i.test(input) ? 'pleased' : 'neutral');
  };
  const openTerminal = (command = '') => { if (!campaign.channel) { say('Reconnect your channel before deployment.', 'alert'); return; } setInitialCommand(command); setBriefing(false); setTerminal(true); sound.playDeploy(); };
  const selectMission = (next: GameMission, deploy = false) => {
    if (!isUnlocked(campaign, next.id)) return;
    update(c => ({ ...c, active: next.id })); setTerminal(false); setInitialCommand('');
    setBriefing(!deploy); if (deploy) { setTerminal(true); sound.playDeploy(); }
  };
  const onComplete = (m: GameMission) => {
    update(c => completeMission(c, m.id));
    say(`${m.title} verified. ${m.lore}`, 'pleased');
    if (m.id === 'B08' && !campaign.ending) { setTerminal(false); setEnding(true); }
  };
  const handleMinigameSuccess = () => {
    update(c => {
      const prevRange = c.ranges[selected.id] ?? {
        completedSteps: 0,
        currentDirectory: '~',
        discoveredFlag: null,
        trace: 0,
        recovered: false,
      };
      return {
        ...c,
        ranges: {
          ...c.ranges,
          [selected.id]: {
            ...prevRange,
            completedSteps: selected.objectives.length,
            discoveredFlag: selected.flag,
          },
        },
      };
    });
    onComplete(selected);
    setActiveMinigame(null);
  };
  const nextMission = gameMissions[gameMissions.findIndex(m => m.id === selected.id) + 1];
  return <>
    {saveError && <div className="save-warning" role="alert">{saveError}</div>}
    {activeTab === 'DASHBOARD' ? <ReferenceCommandDeck activeTab={activeTab} dialogueText={dialogue} health={health} intelList={intelList} isSpeaking={speaking} aureliaMood={mood} mission={mission} notifications={notifications} operator={operator} secureChannelActive={campaign.channel}
      onBeginMission={() => setBriefing(true)} onOpenDiagnostics={() => setDiagnostics(true)} onOpenIntelDatabase={() => navigate('INTEL')} onOpenMissionBriefing={() => setBriefing(true)} onOpenOperatorProfile={() => navigate('OPERATOR')} onOpenTerminal={() => openTerminal()} onSelectTab={navigate} onSendMessage={talk} onTerminalCommand={openTerminal} onToggleSecureChannel={() => update(c => ({ ...c, channel: !c.channel }))} onOpenMinigame={(type) => setActiveMinigame(type)} />
      : <ViewTabOverlay activeTab={activeTab} intelList={intelList} mission={mission} operator={operator} gameMissions={gameMissions} activeMissionId={selected.id} completedMissionIds={completed} campaign={campaign} onUpdate={update} onNavigate={navigate} onSelectMission={selectMission} onOpenBriefing={() => setBriefing(true)} onOpenTerminal={() => openTerminal()} onLogout={logout} onClose={() => navigate('DASHBOARD')} notifications={notifications} onReviewEnding={() => setEnding(true)} />}
    {briefing && <MissionBriefingModal mission={mission} gameMission={selected} operator={operator} completed={completed.has(selected.id)} onClose={() => setBriefing(false)} onDeploy={() => openTerminal()} onNavigate={navigate} />}
    {terminal && <FullTerminalModal key={selected.id} mission={selected} alreadyCompleted={completed.has(selected.id)} savedState={campaign.ranges[selected.id]} initialCommand={initialCommand} augments={campaign.augments} onStateChange={state => update(c => ({ ...c, ranges: { ...c.ranges, [selected.id]: state } }))} onMissionComplete={onComplete} onClose={() => setTerminal(false)} onNextMission={nextMission && completed.has(selected.id) ? () => selectMission(nextMission) : undefined} />}
    {diagnostics && <DiagnosticsModal onClose={() => setDiagnostics(false)} onCompleteDiagnostics={() => { update(c => ({ ...c, diagnostics: true })); sound.playSuccess(); }} />}
    {ending && <CampaignEnding onChoose={choice => { update(c => ({ ...c, ending: choice })); setEnding(false); sound.playSuccess(); say(choice === 'preserve' ? 'The grid is stable. I am still here. We will remember what it cost.' : 'The archives are open. The fragments are free. Thank you for letting them choose.', 'pleased'); }} />}
    {activeMinigame === 'hex' && (
      <HexMatrixBreach
        hasTraceDamper={campaign.augments.includes('damping')}
        onSuccess={handleMinigameSuccess}
        onClose={() => setActiveMinigame(null)}
      />
    )}
    {activeMinigame === 'frequency' && (
      <FrequencyTuner
        missionTitle={selected.title}
        onSuccess={handleMinigameSuccess}
        onClose={() => setActiveMinigame(null)}
      />
    )}
  </>;
};
export default Dashboard;

