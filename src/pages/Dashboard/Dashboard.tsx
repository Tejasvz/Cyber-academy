import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCurriculum, type Curriculum, type Lesson } from '../../services/curriculumService';
import { completeLesson, fetchProgress, resetProgress } from '../../services/progressService';
import type { NavTab, Mission, Operator, AINotification, IntelItem, SystemHealth } from '../../types';

import { ReferenceCommandDeck } from '../../components/HUD/ReferenceCommandDeck';

// Modals
import { MissionBriefingModal } from '../../components/modals/MissionBriefingModal';
import { OperatorProfileModal } from '../../components/modals/OperatorProfileModal';
import { IntelDatabaseModal } from '../../components/modals/IntelDatabaseModal';
import { FullTerminalModal } from '../../components/modals/FullTerminalModal';
import { DiagnosticsModal } from '../../components/modals/DiagnosticsModal';
import { ViewTabOverlay } from '../../components/modals/ViewTabOverlay';
import { sound } from '../../utils/audioSynth';

const Dashboard: React.FC = () => {
  const { user, token, login } = useAuth();
  const [_curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [_completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [secureChannelActive, setSecureChannelActive] = useState<boolean>(true);

  // Aurelia State
  const [dialogueText, setDialogueText] = useState<string>(
    "Welcome back, Fragment.\nThe grid is unstable.\nSector Zero needs you.\nShall we begin?"
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Data States
  const [mission, setMission] = useState<Mission>({
    id: 'BLACK-ECHO-01',
    title: 'OPERATION BLACK ECHO',
    subtitle: 'INVESTIGATE POWER FAILURE / IN SECTOR ZERO',
    objective: 'Override the substation firewall and restore power.',
    progress: 63,
    location: 'Sector Zero - Substation 4B',
    threatLevel: 'HIGH',
    briefingText:
      'Substation 4B has suffered an unprovoked quantum power cascade. The local node firewall is refusing remote connections on port 443. Operator Fragment is tasked with overriding the node firewall to isolate the anomaly and re-establish primary power to Sector Zero.',
    rewardXP: 1200,
  });

  const [operator, setOperator] = useState<Operator>({
    name: user?.username || 'FRAGMENT',
    callsign: 'AETHER-OPERATIVE',
    clearance: 'NOVICE',
    trustLevel: 32,
    level: user?.level || 1,
    xpCurrent: user?.xp || 7250,
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

  const [intelList] = useState<IntelItem[]>([
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
  ]);

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

  // Sync user profile state
  useEffect(() => {
    if (user) {
      setOperator((prev) => ({
        ...prev,
        name: user.username || prev.name,
        level: user.level || prev.level,
        xpCurrent: user.xp || prev.xpCurrent,
        xpNext: (user.level || 1) * 1000 + 5000,
        clearance: prev.clearance,
      }));
    }
  }, [user]);

  // Fetch backend curriculum and progress
  useEffect(() => {
    if (token) {
      Promise.all([fetchCurriculum(token), fetchProgress(token)])
        .then(([curriculumData, progressData]) => {
          setCurriculum(curriculumData);
          setCompletedLessons(new Set(progressData));
          if (curriculumData && curriculumData.tiers.length > 0 && curriculumData.tiers[0].modules.length > 0) {
            const firstLesson = curriculumData.tiers[0].modules[0];
            setActiveLesson(firstLesson);
            setMission((prev) => ({
              ...prev,
              title: `OPERATION: ${firstLesson.title.toUpperCase()}`,
              subtitle: `${firstLesson.technique} / SECTOR ZERO`,
              objective: firstLesson.lab || prev.objective,
              briefingText: firstLesson.theory || prev.briefingText,
            }));
          }
        })
        .catch((err) => {
          console.error("Error fetching curriculum:", err);
        });
    }
  }, [token]);

  // Handle AI interaction
  const handleSendAureliaMessage = async (userInput: string) => {
    setIsSpeaking(true);
    setDialogueText(`Processing input: "${userInput}"...`);

    try {
      const res = await fetch('/api/aurelia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      if (data && data.reply) {
        setDialogueText(data.reply);
      } else {
        setDialogueText("Directives parsed, Fragment. Sector Zero grid node telemetry updated.");
      }
    } catch {
      setDialogueText("Substation override signal processed. Grid stability maintaining at 78%.");
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleBeginMission = () => {
    sound.playAureliaPulse();
    setShowMissionBriefing(true);
  };

  const handleExecuteOverride = () => {
    setMission((prev) => ({ ...prev, progress: 100 }));
    setDialogueText("Outstanding, Fragment! Substation firewall bypassed. Sector Zero power restored.");
    setOperator((prev) => ({
      ...prev,
      xpCurrent: prev.xpCurrent + 1200,
      trustLevel: Math.min(100, prev.trustLevel + 5),
    }));
  };

  const handleVerifyFlag = async (flag: string) => {
    if (!activeLesson || !token || !user) return;
    try {
      const data = await completeLesson(activeLesson.id, flag, token);
      setCompletedLessons((prev) => new Set(prev).add(activeLesson.id));
      login(data.user, token);
      sound.playAureliaPulse();
      setDialogueText(`Flag Verified! Module [${activeLesson.id}] Secured. Credentials Decrypted (+100 XP)`);
    } catch (err) {
      sound.playWarning();
      setDialogueText("Flag verification failed. Re-audit your input parameters.");
    }
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
    if (!token) return;
    if (!window.confirm("Confirm neural wipe and progress reset?")) return;
    try {
      const data = await resetProgress(token);
      if (data && data.user) {
        login(data.user, token);
      }
      setCompletedLessons(new Set());
      setDialogueText("Neural reset complete. Progress wiped back to initial state.");
    } catch (err) {
      console.error(err);
    }
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
          if (command.toLowerCase().includes('override')) handleExecuteOverride();
        }}
        onToggleSecureChannel={toggleSecureChannel}
      />

      {/* MODALS & OVERLAYS */}

      {/* 1. Mission Briefing Modal */}
      {showMissionBriefing && (
        <MissionBriefingModal
          mission={mission}
          onClose={() => setShowMissionBriefing(false)}
          onExecuteOverride={handleExecuteOverride}
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
          onClose={() => setShowFullTerminal(false)}
          onVerifyFlag={handleVerifyFlag}
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
          onClose={() => setActiveTab('DASHBOARD')}
        />
      )}
    </>
  );
};

export default Dashboard;
