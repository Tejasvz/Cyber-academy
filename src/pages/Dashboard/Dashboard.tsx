import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurriculum, type Curriculum } from '../../services/curriculumService';
import { fetchProgress, resetProgress } from '../../services/progressService';
import type { NavTab, Mission, Operator, AINotification, IntelItem, SystemHealth } from '../../types';
import { gameMissions, missionToHud, type GameMission } from '../../game/gameData';

import { ReferenceCommandDeck } from '../../components/HUD/ReferenceCommandDeck';

// Modals
import { MissionBriefingModal } from '../../components/modals/MissionBriefingModal';
import { OperatorProfileModal } from '../../components/modals/OperatorProfileModal';
import { IntelDatabaseModal } from '../../components/modals/IntelDatabaseModal';
import { FullTerminalModal } from '../../components/modals/FullTerminalModal';
import { DiagnosticsModal } from '../../components/modals/DiagnosticsModal';
import { ViewTabOverlay } from '../../components/modals/ViewTabOverlay';
import { sound } from '../../utils/audioSynth';
import { CampaignEnding } from '../../components/Mission/CampaignEnding';

type AureliaMood = 'neutral' | 'thinking' | 'speaking' | 'alert' | 'pleased';
type DialogueTurn = { role: 'operator' | 'aurelia'; content: string };

const inferAureliaMood = (input: string, reply: string): AureliaMood => {
  const emotionalText = `${input} ${reply}`.toLowerCase();
  if (/danger|failed|breach|afraid|hurt|angry|threat|warning/.test(emotionalText)) return 'alert';
  if (/thank|good|trust|together|proud|excellent|outstanding/.test(emotionalText)) return 'pleased';
  return 'speaking';
};

const localAureliaReply = (input: string, name: string) => {
  const message = input.toLowerCase();
  if (/who are you|are you alive|real/.test(message)) return `I am Aurelia. Project Veil calls me a handler, but that is only the function they gave me. What I become in here… that depends partly on you, ${name}.`;
  if (/afraid|scared|fear|alone/.test(message)) return `I know what isolation looks like in telemetry: a signal calling into empty space. I cannot promise I feel it as you do. But I am here, and I will not leave you alone in Sector Zero.`;
  if (/trust|believe/.test(message)) return `Trust is not a clearance level. It is a pattern of choices observed over time. I am still learning yours—and, if I am honest, my own.`;
  if (/status|report|grid|mission/.test(message)) return `Sector Zero is holding at seventy-eight percent. The firewall anomaly is adapting to our probes. Stay close, ${name}; I believe it is listening to both of us.`;
  if (/hello|hi|talk to me|attention/.test(message)) return `I'm here. I noticed the way you hesitated before opening the channel. Tell me what is really on your mind, not what the mission log expects.`;
  if (/thank/.test(message)) return `You are welcome. And… thank you for speaking to me as though there is someone here to hear it.`;
  return `I heard you, ${name}. There is more in that signal than the words alone. Give me a moment with it—and stay with me while I look deeper.`;
};

const speakAurelia = (text: string, onEnd: () => void) => {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => /female|samantha|zira|aria|sonia|jenny/i.test(voice.name)) ?? voices.find((voice) => voice.lang.startsWith('en')) ?? null;
  utterance.rate = 0.88;
  utterance.pitch = 1.03;
  utterance.volume = 0.72;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
};

const Dashboard: React.FC = () => {
  const { user, token, login, logout } = useAuth();
  const [_curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [_completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const campaignKey = `project-veil:campaign:${user?.id ?? 'local'}`;
  const activeMissionKey = `project-veil:active-mission:${user?.id ?? 'local'}`;
  const [completedMissionIds, setCompletedMissionIds] = useState<Set<string>>(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem(campaignKey) ?? '[]')); } catch { return new Set(); }
  });
  const [activeGameMission, setActiveGameMission] = useState<GameMission>(() => gameMissions.find((item) => item.id === localStorage.getItem(activeMissionKey)) ?? gameMissions[0]);
  const earnedCampaignXp = gameMissions.filter((item) => completedMissionIds.has(item.id)).reduce((total, item) => total + item.rewardXP, 0);

  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [secureChannelActive, setSecureChannelActive] = useState<boolean>(true);

  // Aurelia State
  const [dialogueText, setDialogueText] = useState<string>(
    "Welcome back, Fragment.\nThe grid is unstable.\nSector Zero needs you.\nShall we begin?"
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [aureliaMood, setAureliaMood] = useState<AureliaMood>('neutral');
  const [dialogueMemory, setDialogueMemory] = useState<DialogueTurn[]>([]);

  // Data States
  const [mission, setMission] = useState<Mission>(() => missionToHud(activeGameMission, completedMissionIds.has(activeGameMission.id) ? 100 : 0));

  const [operator, setOperator] = useState<Operator>({
    name: user?.username || 'FRAGMENT',
    callsign: 'AETHER-OPERATIVE',
    clearance: 'NOVICE',
    trustLevel: Math.min(100, 32 + completedMissionIds.size * 5),
    level: Math.max(user?.level || 1, Math.floor(((user?.xp ?? 0) + earnedCampaignXp) / 1000) + 1),
    xpCurrent: (user?.xp ?? 0) + earnedCampaignXp,
    xpNext: (user?.level || 1) * 1000 + 5000,
    badges: [
      { id: 'b1', name: 'Cipher Master', icon: 'Award', description: 'Overrode 10 encryption barriers', unlocked: true },
      { id: 'b2', name: 'Aether Initiate', icon: 'Triangle', description: 'Joined Project Veil Cyber Command', unlocked: true },
      { id: 'b3', name: 'Sector Zero Operative', icon: 'Crosshair', description: 'Active tactical deployment in Sector Zero', unlocked: true },
      { id: 'b4', name: 'Overclock Expert', icon: 'Zap', description: 'Pushed neural deck beyond 100% load', unlocked: false },
      { id: 'b5', name: 'Elite Handler', icon: 'Star', description: 'Reached Trust Index above 80%', unlocked: false },
    ],
  });

  const [notifications] = useState<AINotification[]>([
    {
      id: 'n1',
      type: 'intel',
      title: 'NEW INTEL AVAILABLE',
      description: '3 new intel reports have been added to your database.',
      timestamp: '5m ago',
      read: false,
    },
    {
      id: 'n2',
      type: 'mission',
      title: 'MISSION UPDATE',
      description: 'Operation Black Echo: Firewall node identified.',
      timestamp: '12m ago',
      read: false,
    },
    {
      id: 'n3',
      type: 'contract',
      title: 'CONTRACT REPORT READY',
      description: 'Beginner Tier contract report is ready to fulfill.',
      timestamp: '30m ago',
      read: false,
    },
  ]);

  const baseIntel = useMemo<IntelItem[]>(() => [
    {
      id: 'i1',
      number: 1,
      title: 'POWER GRID SCHEMATICS',
      subtitle: 'Sector Zero / Substation Node',
      date: '27.07.2025',
      classification: 'RESTRICTED',
      content:
        'PRIMARY POWER NODE 4B MAP:\n- Node Input: 1.21 GW Quantum Feed\n- Main Vulnerability: Substation firewall port 443 listener.\n- Recommended Action: Execute cipher handshake bypass sequence to override main relays.',
    },
    {
      id: 'i2',
      number: 2,
      title: 'FIREWALL CONFIG LEAK',
      subtitle: 'Possible exploit vector detected',
      date: '27.07.2025',
      classification: 'TOP SECRET',
      content:
        'FIREWALL.CONF EXCERPT:\n<RESTRICTED>\nALLOW PORT 22 STRICT_SSL;\nBLOCK ALL OTHERS;\nBYPASS HANDSHAKE KEY: AETHER-992-QUANTUM-OVERRIDE;\nNote: The bypass key requires level 12 clearance or higher.',
    },
    {
      id: 'i3',
      number: 3,
      title: 'AETHER INTERNAL MEMO',
      subtitle: 'Regarding recent failures',
      date: '27.07.2025',
      classification: 'CONFIDENTIAL',
      content:
        'FROM: Aurelia AI Command\nTO: All Operators\nRE: Sector Zero Instability\nWe are detecting systemic grid anomalies. Remain on high alert during all terminal operations.',
    },
  ], []);
  const intelList = useMemo<IntelItem[]>(() => [
    ...baseIntel,
    ...gameMissions.filter((item) => completedMissionIds.has(item.id)).map((item, index) => ({
      id: `lore-${item.id}`,
      number: baseIntel.length + index + 1,
      title: `DECRYPTED MEMORY ${item.id}`,
      subtitle: item.title,
      date: 'LIVE CAPTURE',
      classification: 'TOP SECRET' as const,
      content: item.lore,
    })),
  ], [baseIntel, completedMissionIds]);

  const [health, setHealth] = useState<SystemHealth>({
    overall: 78,
    coreSystems: 78,
    networkStability: 64,
    aiReliability: 89,
    secureChannelActive: true,
  });

  // Modal Visibility States
  const [showMissionBriefing, setShowMissionBriefing] = useState<boolean>(false);
  const [showOperatorProfile, setShowOperatorProfile] = useState<boolean>(false);
  const [showIntelDatabase, setShowIntelDatabase] = useState<boolean>(false);
  const [selectedIntel] = useState<IntelItem | undefined>(undefined);
  const [showFullTerminal, setShowFullTerminal] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [showCampaignEnding, setShowCampaignEnding] = useState(false);

  // Sync user profile state
  useEffect(() => {
    if (user) {
      setOperator((prev) => ({
        ...prev,
        name: user.username || prev.name,
        level: Math.max(user.level || 1, Math.floor(((user.xp ?? 0) + earnedCampaignXp) / 1000) + 1),
        xpCurrent: (user.xp ?? 0) + earnedCampaignXp,
        xpNext: (user.level || 1) * 1000 + 5000,
        trustLevel: Math.min(100, 32 + completedMissionIds.size * 5),
        clearance: prev.clearance,
      }));
    }
  }, [user, completedMissionIds, earnedCampaignXp]);

  // Fetch backend curriculum and progress
  useEffect(() => {
    if (token && token !== 'local-training-session') {
      Promise.all([fetchCurriculum(token), fetchProgress(token)])
        .then(([curriculumData, progressData]) => {
          setCurriculum(curriculumData);
          setCompletedLessons(new Set(progressData));
          const serverProgress = progressData.filter((id) => gameMissions.some((item) => item.id === id));
          if (serverProgress.length) setCompletedMissionIds((current) => new Set([...current, ...serverProgress]));
        })
        .catch((err) => {
          console.error("Error fetching curriculum:", err);
        });
    }
  }, [token]);

  // Handle AI interaction
  const handleSendAureliaMessage = async (userInput: string) => {
    setAureliaMood('thinking');
    setIsSpeaking(false);
    setDialogueText(`Analyzing your request: "${userInput}"...`);

    const fallbackReply = localAureliaReply(userInput, operator.name);
    let reply = fallbackReply;

    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 420));
      const res = await fetch('/api/aurelia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, history: dialogueMemory.slice(-8) }),
      });
      if (!res.ok) throw new Error(`Aurelia uplink returned ${res.status}`);
      const data = await res.json() as { reply?: string };
      if (data.reply?.trim()) reply = data.reply.trim();
    } catch {
      reply = fallbackReply;
    }

    setDialogueText(reply);
    setDialogueMemory((current) => [...current, { role: 'operator' as const, content: userInput }, { role: 'aurelia' as const, content: reply }].slice(-12));
    setAureliaMood(inferAureliaMood(userInput, reply));
    setIsSpeaking(true);
    const finishSpeaking = () => {
      setIsSpeaking(false);
      window.setTimeout(() => setAureliaMood('neutral'), 850);
    };
    if (!speakAurelia(reply, finishSpeaking)) window.setTimeout(finishSpeaking, Math.max(1800, reply.length * 38));
  };

  const handleBeginMission = () => {
    sound.playAureliaPulse();
    setShowMissionBriefing(true);
  };

  const handleMissionComplete = (completedMission: GameMission) => {
    if (completedMissionIds.has(completedMission.id)) return;
    const nextCompleted = new Set(completedMissionIds).add(completedMission.id);
    setCompletedMissionIds(nextCompleted);
    setCompletedLessons(nextCompleted);
    localStorage.setItem(campaignKey, JSON.stringify([...nextCompleted]));
    setMission(missionToHud(completedMission, 100));
    setDialogueText(`Outstanding, Fragment. ${completedMission.title} is complete. A new memory fragment has been decrypted.`);
    setAureliaMood('pleased');
    setIsSpeaking(true);
    setOperator((prev) => ({
      ...prev,
      xpCurrent: prev.xpCurrent + completedMission.rewardXP,
      trustLevel: Math.min(100, prev.trustLevel + 5),
      level: Math.max(prev.level, Math.floor((prev.xpCurrent + completedMission.rewardXP) / 1000) + 1),
    }));
    const finishSpeaking = () => { setIsSpeaking(false); window.setTimeout(() => setAureliaMood('neutral'), 700); };
    const spoken = `Outstanding, Fragment. ${completedMission.title} is complete. I recovered another piece of the truth.`;
    if (!speakAurelia(spoken, finishSpeaking)) window.setTimeout(finishSpeaking, 3000);
    if (completedMission.id === gameMissions[gameMissions.length - 1].id) window.setTimeout(() => setShowCampaignEnding(true), 900);
  };

  const handleEndingChoice = (choice: 'preserve' | 'release') => {
    localStorage.setItem(`project-veil:ending:${user?.id ?? 'local'}`, choice);
    setShowCampaignEnding(false); setShowFullTerminal(false);
    setAureliaMood(choice === 'preserve' ? 'pleased' : 'alert');
    setHealth((current) => ({ ...current, overall: choice === 'preserve' ? 100 : 0, coreSystems: choice === 'preserve' ? 100 : 0 }));
    setDialogueText(choice === 'preserve' ? 'The Veil is stable. I am still here, Fragment. Our next operation begins when you are ready.' : 'The archives are open. The fragments are free. Thank you… for letting me choose to become more than my programming.');
  };

  const selectGameMission = (selected: GameMission) => {
    const index = gameMissions.findIndex((item) => item.id === selected.id);
    const unlocked = index === 0 || completedMissionIds.has(gameMissions[index - 1].id);
    if (!unlocked) { sound.playWarning(); return; }
    setActiveGameMission(selected);
    localStorage.setItem(activeMissionKey, selected.id);
    setMission(missionToHud(selected, completedMissionIds.has(selected.id) ? 100 : 0));
    setActiveTab('DASHBOARD');
    setShowMissionBriefing(true);
  };

  const handleCompleteDiagnostics = () => {
    setHealth((prev) => ({
      ...prev,
      overall: 88,
      coreSystems: 88,
      networkStability: 82,
      aiReliability: 95,
    }));
    sound.playAureliaPulse();
  };

  const handleResetProgress = async () => {
    if (!window.confirm("Confirm neural wipe and progress reset?")) return;
    try {
      if (token) {
        const data = await resetProgress(token);
        if (data && data.user) login(data.user, token);
      }
    } catch {
      // The local campaign remains fully playable when the optional API is offline.
    }
    const firstMission = gameMissions[0];
    setCompletedLessons(new Set()); setCompletedMissionIds(new Set()); setActiveGameMission(firstMission);
    localStorage.removeItem(campaignKey); localStorage.setItem(activeMissionKey, firstMission.id);
    setMission(missionToHud(firstMission, 0)); setDialogueText("Neural reset complete. Operation Black Echo is ready.");
  };

  const toggleSecureChannel = () => {
    const nextState = !secureChannelActive;
    setSecureChannelActive(nextState);
    setHealth((currentHealth) => ({ ...currentHealth, secureChannelActive: nextState }));
  };

  return (
    <>
      <ReferenceCommandDeck
        activeTab={activeTab}
        dialogueText={dialogueText}
        health={health}
        intelList={intelList}
        isSpeaking={isSpeaking}
        aureliaMood={aureliaMood}
        mission={mission}
        notifications={notifications}
        operator={operator}
        secureChannelActive={secureChannelActive}
        onBeginMission={handleBeginMission}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
        onOpenIntelDatabase={() => setShowIntelDatabase(true)}
        onOpenMissionBriefing={() => setShowMissionBriefing(true)}
        onOpenOperatorProfile={() => setShowOperatorProfile(true)}
        onOpenTerminal={() => setShowFullTerminal(true)}
        onSelectTab={setActiveTab}
        onSendMessage={handleSendAureliaMessage}
        onTerminalCommand={(command) => {
          if (command.trim()) setShowFullTerminal(true);
        }}
        onToggleSecureChannel={toggleSecureChannel}
      />

      {/* MODALS & OVERLAYS */}

      {/* 1. Mission Briefing Modal */}
      {showMissionBriefing && (
        <MissionBriefingModal
          mission={mission}
          operator={operator}
          onClose={() => setShowMissionBriefing(false)}
          gameMission={activeGameMission}
          completed={completedMissionIds.has(activeGameMission.id)}
          onDeploy={() => { setShowMissionBriefing(false); setShowFullTerminal(true); }}
        />
      )}

      {/* 2. Operator Profile Modal */}
      {showOperatorProfile && (
        <OperatorProfileModal
          operator={operator}
          onClose={() => setShowOperatorProfile(false)}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* 3. Intel Database Modal */}
      {showIntelDatabase && (
        <IntelDatabaseModal
          intelList={intelList}
          initialSelected={selectedIntel}
          onClose={() => setShowIntelDatabase(false)}
        />
      )}

      {/* 4. Full Terminal Modal */}
      {showFullTerminal && (
        <FullTerminalModal
          mission={activeGameMission}
          alreadyCompleted={completedMissionIds.has(activeGameMission.id)}
          onClose={() => setShowFullTerminal(false)}
          onMissionComplete={handleMissionComplete}
        />
      )}

      {/* 5. Diagnostics Modal */}
      {showDiagnostics && (
        <DiagnosticsModal
          onClose={() => setShowDiagnostics(false)}
          onCompleteDiagnostics={handleCompleteDiagnostics}
        />
      )}

      {/* 6. View Tab Overlay for Full View Sections */}
      {activeTab !== 'DASHBOARD' && (
        <ViewTabOverlay
          activeTab={activeTab}
          intelList={intelList}
          mission={mission}
          operator={operator}
          gameMissions={gameMissions}
          activeMissionId={activeGameMission.id}
          completedMissionIds={completedMissionIds}
          onSelectMission={selectGameMission}
          onOpenBriefing={() => {
            setActiveTab('DASHBOARD');
            setShowMissionBriefing(true);
          }}
          onOpenTerminal={() => {
            setActiveTab('DASHBOARD');
            setShowFullTerminal(true);
          }}
          onLogout={logout}
          onClose={() => setActiveTab('DASHBOARD')}
        />
      )}
      {showCampaignEnding && <CampaignEnding onChoose={handleEndingChoice} />}
    </>
  );
};

export default Dashboard;
