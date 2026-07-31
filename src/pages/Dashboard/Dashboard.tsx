import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Terminal from '../../components/Terminal/Terminal';
import { fetchCurriculum, type Curriculum, type Lesson } from '../../services/curriculumService';
import { completeLesson, fetchProgress } from '../../services/progressService';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { DialogueFeed } from '../../components/Dialogue/DialogueFeed';
import { CharacterPortrait } from '../../components/Dialogue/CharacterPortrait';
import { useDialogueStore } from '../../store/dialogueStore';
import { useAudioStore } from '../../store/audioStore';
import { TapeDecryptor } from '../../components/Dialogue/TapeDecryptor';
import { ConspiracyBoard } from '../../components/Conspiracy/ConspiracyBoard';
import { SectorMap } from '../../components/Map/SectorMap';

const Dashboard = () => {
  const { user, token, logout, login } = useAuth();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Gameplay & tab states
  const [activeTab, setActiveTab] = useState<'theory' | 'sandbox' | 'blueteam' | 'remediation'>('theory');
  const [_consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Local persistent achievements and reports
  const [badges, setBadges] = useState<string[]>([]);
  const [submittedReports, setSubmittedReports] = useState<string[]>([]);

  // Contract report form states
  const [contractToReport, setContractToReport] = useState<'Act I: The Reassembly' | 'Act II: The Resonance' | 'Act III: The Core Breach' | null>(null);
  const [reportVuln, setReportVuln] = useState('');
  const [reportExploit, setReportExploit] = useState('');
  const [reportFix, setReportFix] = useState('');

  // Cyberpunk animations states
  const [showBreachOverlay, setShowBreachOverlay] = useState(false);
  const [breachDetails, setBreachDetails] = useState({ title: '', text: '' });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState('');

  // Core Cyber OS Window Store
  const {
    windows,
    windowOrder,
    openWindow,
    closeWindow,
    toggleMinimize,
    toggleMaximize,
    bringToFront,
    updateWindowPosition,
    updateWindowSize,
    resetLayout,
  } = useWindowStore();

  const { startDialogueSequence, isSequencePlaying } = useDialogueStore();
  const {
    initializeAudio,
    playUiClick,
    playSuccessChime,
    playFailureSweep,
    toggleMute,
    isMuted,
  } = useAudioStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [bootPhase, setBootPhase] = useState<'power_loss' | 'voice_crack' | 'system_failure' | 'console_restore' | 'terminal_only' | 'nmap_scan' | 'completed'>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const bootPlayed = localStorage.getItem(`${u.id}_boot_played`);
        if (bootPlayed === 'true') {
          return 'completed';
        }
      }
    } catch (e) {}
    return 'completed';
  });
  const [bootTextIndex, setBootTextIndex] = useState(0);
  const [bootstrapInput, setBootstrapInput] = useState('');
  const [bootstrapError, setBootstrapError] = useState('');
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);


  // Dynamic color theme state
  const [currentTheme, setCurrentTheme] = useState<'cyan' | 'amber' | 'green' | 'red'>('cyan');

  // Dynamic theme application
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'cyan') {
      root.style.setProperty('--color-primary', '#00f0ff');
      root.style.setProperty('--color-secondary', '#ff00ff');
      root.style.setProperty('--color-primary-glow', 'rgba(0, 240, 255, 0.45)');
      root.style.setProperty('--color-surface-border', 'rgba(0, 240, 255, 0.2)');
    } else if (currentTheme === 'amber') {
      root.style.setProperty('--color-primary', '#ffb000');
      root.style.setProperty('--color-secondary', '#00f0ff');
      root.style.setProperty('--color-primary-glow', 'rgba(255, 176, 0, 0.45)');
      root.style.setProperty('--color-surface-border', 'rgba(255, 176, 0, 0.2)');
    } else if (currentTheme === 'green') {
      root.style.setProperty('--color-primary', '#39ff14');
      root.style.setProperty('--color-secondary', '#00f0ff');
      root.style.setProperty('--color-primary-glow', 'rgba(57, 255, 20, 0.45)');
      root.style.setProperty('--color-surface-border', 'rgba(57, 255, 20, 0.2)');
    } else if (currentTheme === 'red') {
      root.style.setProperty('--color-primary', '#ff2a2a');
      root.style.setProperty('--color-secondary', '#ffb000');
      root.style.setProperty('--color-primary-glow', 'rgba(255, 42, 42, 0.45)');
      root.style.setProperty('--color-surface-border', 'rgba(255, 42, 42, 0.2)');
    }
  }, [currentTheme]);

  // AI chat states
  interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'SYSTEM: Tactical OS Daemon [AURELIA-v2.6] loaded.\r\nSynaptic link established. Ready to assist with active operation directives.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-alert chatbot when active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `AURELIA: 'Field sync locked for Operation: ${activeLesson.title} [${activeLesson.id}]. Target vector relies on ${activeLesson.technique}. I am online to supply logs correlation, decryption advice, or remediation files.'`
          }
        ]);
        setIsTyping(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeLesson]);

  const handleQuickQuery = (queryType: 'hint' | 'explanation' | 'opsec' | 'cheatsheet') => {
    if (!activeLesson) {
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: '[-] Error: No active lesson node selected. Please load a lesson from Mission Control first.' }
      ]);
      return;
    }

    let queryText = '';
    let responseText = '';

    if (queryType === 'hint') {
      queryText = 'Requesting tactical hint for target node...';
      responseText = `[INTEL HINT] for [${activeLesson.id}]:\n${activeLesson.lab}\n\nWalkthrough directives:\n${activeLesson.guide || "Follow standard lab protocols."}`;
    } else if (queryType === 'explanation') {
      queryText = 'Explain the vulnerability theory...';
      responseText = `[VULNERABILITY CONCEPT] ${activeLesson.title}:\n${activeLesson.theory}`;
    } else if (queryType === 'opsec') {
      queryText = 'Provide operational security (OpSec) telemetry details...';
      responseText = `[OPSEC ADVISORY] for ${activeLesson.technique}:\n${activeLesson.opSec}`;
    } else if (queryType === 'cheatsheet') {
      queryText = 'Show real-world command reference...';
      responseText = `[CHEAT SHEET REFERENCE] commands:\n${activeLesson.cheatSheet || "Standard Linux command line reference."}`;
    }

    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      setIsTyping(false);
    }, 600);
  };

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const t = text.toLowerCase();
      if (!activeLesson) {
        reply = "AURELIA: 'I require an active connection to a neural training node to assist you, Fragment. Please load a module from Mission Control first.'";
      } else if (t.includes('flag')) {
        reply = `AURELIA: 'Security protocols prevent me from releasing the raw flag string directly. Refer to the active execution guide:\n${activeLesson.guide || "Audit your input/output logs."}'`;
      } else if (t.includes('help') || t.includes('hint') || t.includes('exploit')) {
        reply = `AURELIA: 'Directives retrieved. Focus on the technical schematic:\n${activeLesson.lab}\n\nOperation Guide:\n${activeLesson.guide}'`;
      } else if (t.includes('remedi') || t.includes('fix') || t.includes('secure')) {
        reply = `AURELIA: 'Mitigation details unlocked for this risk pattern:\n${activeLesson.remediation?.explanation || "Verify standard boundary constraints."}\n\nRecommended Defensive Configuration:\n${activeLesson.remediation?.secureCode || "Remediation libraries pending."}'`;
      } else {
        reply = `AURELIA: 'Acknowledged, Fragment. For Operation ${activeLesson.title} [${activeLesson.id}], target payload must fulfill: ${activeLesson.lab}. I am monitoring the telemetry stream.'`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const getEstTime = (lessonId: string): string => {
    const estimates: Record<string, string> = {
      B01: '10m', B02: '5m', B03: '8m', B04: '12m', B05: '15m', B06: '7m', B07: '8m', B08: '20m',
      M01: '12m', M02: '15m', M03: '15m', M04: '18m', M05: '12m', M06: '15m', M07: '15m', M08: '25m',
      A01: '20m', A02: '18m', A03: '25m', A04: '22m', A05: '18m', A06: '22m', A07: '35m'
    };
    return estimates[lessonId] || '10m';
  };



  // Start boot sequence on mount if new user
  useEffect(() => {
    if (!loading && user) {
      const bootPlayed = localStorage.getItem(`${user.id}_boot_played`);
      if (!bootPlayed && user.xp === 0 && completedLessons.size === 0) {
        // Close all except terminal
        Object.keys(windows).forEach(id => {
          if (id !== 'terminal') closeWindow(id);
        });
        openWindow('terminal');
        setBootPhase('power_loss');
        setIsAudioReady(false);
        setBootTextIndex(0);
      }
    }
  }, [loading, user?.id]);

  // Narrative Boot Sequence Loop
  useEffect(() => {
    if (bootPhase === 'completed') return;

    if (bootPhase === 'power_loss' && isAudioReady) {
      const timer = setTimeout(() => {
        setBootPhase('voice_crack');
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (bootPhase === 'voice_crack') {
      const texts = [
        "...hello?",
        "...is anyone alive?",
      ];
      
      const timer = setTimeout(() => {
        if (bootTextIndex < texts.length - 1) {
          setBootTextIndex(prev => prev + 1);
        } else {
          setBootPhase('system_failure');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    if (bootPhase === 'system_failure') {
      const timer = setTimeout(() => {
        setBootPhase('console_restore');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [bootPhase, bootTextIndex, isAudioReady]);



  // Synchronize audio soundscape threat levels with game progression
  useEffect(() => {
    const { setThreatLevel } = useAudioStore.getState();
    if (bootPhase !== 'completed') {
      setThreatLevel('exploration');
    } else if (!activeLesson) {
      setThreatLevel('exploration');
    } else if (['B08', 'M08', 'A07'].includes(activeLesson.id)) {
      setThreatLevel('combat');
    } else {
      setThreatLevel('tension');
    }
  }, [activeLesson, bootPhase]);

  // Capture global operator activities to reset the idle clock
  useEffect(() => {
    const resetIdle = () => setLastActivity(Date.now());
    window.addEventListener('keypress', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    return () => {
      window.removeEventListener('keypress', resetIdle);
      window.removeEventListener('mousedown', resetIdle);
    };
  }, []);

  // Idle Performance Interjections
  useEffect(() => {
    if (bootPhase !== 'completed' || isSequencePlaying || !activeLesson) return;

    const interval = setInterval(() => {
      const secondsIdle = (Date.now() - lastActivity) / 1000;
      if (secondsIdle >= 45) {
        // Reset idle activity to prevent spamming
        setLastActivity(Date.now());

        // Select a randomized whisper dialogue node from Aurelia
        const whispers = [
          "Operator, I'm detecting slight latency drifts in our network anchor. Are you tracing the nodes?",
          "Don't get distracted. Aether's scan sweeps are actively sniffing the subnet ports as we wait.",
          "If you're stuck, ask me for a hint. Aurelia's cognitive databases are synchronized."
        ];
        const randomWhisper = whispers[Math.floor(Math.random() * whispers.length)];
        
        startDialogueSequence([
          {
            id: `idle-${Date.now()}`,
            speaker: 'aurelia',
            text: randomWhisper,
            expression: 'worried'
          }
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, bootPhase, isSequencePlaying, activeLesson, startDialogueSequence]);

  // Terminal Failure Performance Intervention
  const handleTerminalFailure = () => {
    setConsecutiveErrors(prev => {
      const next = prev + 1;
      if (next >= 3 && activeLesson) {
        startDialogueSequence([
          {
            id: `fail-intervention-${Date.now()}`,
            speaker: 'aurelia',
            text: `Operator, the gateway connection is blocking our execution payload. Look at the port outputs or review the documentation target.`,
            expression: 'worried'
          }
        ]);
        return 0; // Reset counter after dialogue trigger
      }
      return next;
    });
  };

  // Helper to load localStorage safely
  const getLocalStorage = (key: string, defaultValue: any) => {
    if (!user?.id) return defaultValue;
    const saved = localStorage.getItem(`${user.id}_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const setLocalStorage = (key: string, value: any) => {
    if (!user?.id) return;
    localStorage.setItem(`${user.id}_${key}`, JSON.stringify(value));
  };

  // Fetch initial backend data
  useEffect(() => {
    if (token) {
      Promise.all([
        fetchCurriculum(token),
        fetchProgress(token)
      ])
      .then(([curriculumData, progressData]) => {
        setCurriculum(curriculumData);
        setCompletedLessons(new Set(progressData));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [token]);

  // Load user profile statistics (badges/reports) on user mount
  useEffect(() => {
    if (user?.id) {
      setBadges(getLocalStorage('badges', []));
      setSubmittedReports(getLocalStorage('reports', []));
    }
  }, [user?.id]);


  // First interaction audio initialization hook
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [initializeAudio]);
  // Automated Act I Initial Briefing Sequence trigger
  useEffect(() => {
    if (!loading && curriculum && user) {
      const introPlayed = localStorage.getItem(`${user.id}_intro_played`);
      if (!introPlayed) {
        startDialogueSequence([
          {
            id: 'welcome-1',
            speaker: 'aurelia',
            text: "Operator, can you hear me? Signal clarity is low, but the decryption lattice seems stable... I am AURELIA, your handler daemon.",
            expression: 'neutral',
            typingSpeed: 35,
            pauseIndices: { 8: 300, 24: 400, 56: 400 },
          },
          {
            id: 'welcome-2',
            speaker: 'aurelia',
            text: "We are inside Sector Zero's core buffer. The Neural Veil has fragmented my father's memory units. We must patch the network nodes before the Syndicate tracers trace our link.",
            expression: 'talking',
            typingSpeed: 28,
            pauseIndices: { 36: 450, 77: 450 },
          },
          {
            id: 'welcome-3',
            speaker: 'aurelia',
            text: "Open the Missions window from the side menu. Target the first live node [B01] to begin structural reassembly. I will stand by to assist.",
            expression: 'talking',
            typingSpeed: 28,
            pauseIndices: { 40: 300, 68: 450 },
          }
        ]);
        localStorage.setItem(`${user.id}_intro_played`, 'true');
      }
    }
  }, [loading, curriculum, user, startDialogueSequence]);

  // Reset active tabs on lesson selection change
  useEffect(() => {
    setActiveTab('theory');
    if (activeLesson) {
      setContractToReport(null); // Close report view when lesson selected
    }
  }, [activeLesson]);

  // Helper calculations for tier progression
  const getCompletedCountForTier = (tierName: string) => {
    const tier = curriculum?.tiers.find(t => t.name === tierName);
    if (!tier) return 0;
    return tier.modules.filter(m => completedLessons.has(m.id)).length;
  };

  const getModulesCountForTier = (tierName: string) => {
    const tier = curriculum?.tiers.find(t => t.name === tierName);
    return tier?.modules.length ?? 0;
  };

  const allBeginnerCompleted = getCompletedCountForTier('Act I: The Reassembly') === getModulesCountForTier('Act I: The Reassembly') && getModulesCountForTier('Act I: The Reassembly') > 0;
  const allMediatorCompleted = getCompletedCountForTier('Act II: The Resonance') === getModulesCountForTier('Act II: The Resonance') && getModulesCountForTier('Act II: The Resonance') > 0;

  const beginnerReportSubmitted = submittedReports.includes('Act I: The Reassembly');
  const mediatorReportSubmitted = submittedReports.includes('Act II: The Resonance');

  const isTierLocked = (tierName: string) => {
    if (tierName === 'Act I: The Reassembly') return false;
    if (tierName === 'Act II: The Resonance') {
      return !allBeginnerCompleted || !beginnerReportSubmitted;
    }
    if (tierName === 'Act III: The Core Breach') {
      return !allMediatorCompleted || !mediatorReportSubmitted;
    }
    return false;
  };

  // Check for auto-triggering contract report alerts
  useEffect(() => {
    if (allBeginnerCompleted && !beginnerReportSubmitted) {
      setContractToReport('Act I: The Reassembly');
      setActiveLesson(null);
    } else if (allMediatorCompleted && !mediatorReportSubmitted) {
      setContractToReport('Act II: The Resonance');
      setActiveLesson(null);
    }
  }, [completedLessons, submittedReports, curriculum]);

  // Flag Verification Handler
  const handleVerifyFlag = async (inputFlag: string) => {
    if (!activeLesson || !token || !user) return;
    
    try {
      const data = await completeLesson(activeLesson.id, inputFlag.trim(), token);
      setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
      setConsecutiveErrors(0);
      playSuccessChime();
      
      // Setup Breach Overlay Details
      setBreachDetails({
        title: 'SYSTEM BREACH SUCCESSFUL',
        text: `Module [${activeLesson.id}] Secured. Credentials Decrypted (+100 XP)`
      });
      setShowBreachOverlay(true);
      setTimeout(() => setShowBreachOverlay(false), 2800);

      // Check if operator leveled up
      if (data.user.level > user.level) {
        setTimeout(() => {
          setLevelUpMessage(`LEVEL UP: LEVEL ${data.user.level} OPERATOR`);
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }, 3000);
      }

      // Sync local auth user context
      login(data.user, token);
    } catch (error: any) {
      console.error('Failed to complete lesson:', error);
      playFailureSweep();
    }
  };

  // Fulfill Contract & Report Handler
  const handleFulfillContract = (tierName: 'Act I: The Reassembly' | 'Act II: The Resonance' | 'Act III: The Core Breach') => {
    if (!user) return;
    if (!reportVuln.trim() || !reportExploit.trim() || !reportFix.trim()) {
      alert('Please complete all 3 analysis fields to authorize report submission.');
      return;
    }

    const updatedReports = [...submittedReports, tierName];
    setSubmittedReports(updatedReports);
    setLocalStorage('reports', updatedReports);

    let badge = '';
    let xpReward = 200;
    if (tierName === 'Act I: The Reassembly') badge = '🔍 Recon Officer';
    else if (tierName === 'Act II: The Resonance') badge = '🛡️ Security Specialist';
    else if (tierName === 'Act III: The Core Breach') badge = '👑 Elite Operator';

    const updatedBadges = [...badges, badge];
    setBadges(updatedBadges);
    setLocalStorage('badges', updatedBadges);

    // Locally reward XP and sync context
    const currentXp = user.xp + xpReward;
    const currentLevel = Math.floor(currentXp / 500) + 1;

    if (currentLevel > user.level) {
      setTimeout(() => {
        setLevelUpMessage(`LEVEL UP: LEVEL ${currentLevel} OPERATOR`);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }, 3000);
    }

    login({
      ...user,
      xp: currentXp,
      level: currentLevel
    }, token || '');

    // Reset report inputs
    setReportVuln('');
    setReportExploit('');
    setReportFix('');
    setContractToReport(null);

    // Show completion animation overlay
    setBreachDetails({
      title: 'CONTRACT REPORT SUBMITTED',
      text: `Client AetherCorp secured. Badge awarded: ${badge} (+200 XP)`
    });
    setShowBreachOverlay(true);
    setTimeout(() => setShowBreachOverlay(false), 3000);
  };

  // Draggable/Resizable Windows Renderer
  const renderWindow = (
    id: string,
    content: React.ReactNode
  ) => {
    const win = windows[id];
    if (!win || !win.isOpen) return null;

    const isActive = windowOrder[windowOrder.length - 1] === id;
    const zIndex = 10 + windowOrder.indexOf(id);

    return (
      <div
        key={id}
        style={{
          position: 'absolute',
          left: id === 'terminal' && bootPhase !== 'completed' ? '50%' : (win.isMaximized ? 0 : `${win.x}px`),
          top: id === 'terminal' && bootPhase !== 'completed' ? '50%' : (win.isMaximized ? 0 : `${win.y}px`),
          width: id === 'terminal' && bootPhase !== 'completed' ? 'min(92vw, 840px)' : (win.isMaximized ? '100%' : `${win.width}px`),
          height: id === 'terminal' && bootPhase !== 'completed' ? 'min(82vh, 520px)' : (win.isMaximized ? '100%' : `${win.height}px`),
          transform: id === 'terminal' && bootPhase !== 'completed' ? 'translate(-50%, -50%)' : 'none',
          zIndex: zIndex,
          display: win.isMinimized ? 'none' : 'flex',
        }}
        onClick={() => bringToFront(id)}
        className={`flex flex-col rounded-lg overflow-hidden border backdrop-blur-md transition-shadow duration-300 ${
          isActive 
            ? 'border-primary shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-[#0d0d12]/95' 
            : 'border-primary/20 bg-[#0d0d12]/85 shadow-none'
        }`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={(e) => {
            if (win.isMaximized) return;
            const target = e.target as HTMLElement;
            if (target.closest('.window-control-btn')) return;
            
            e.preventDefault();
            bringToFront(id);
            const startX = e.clientX;
            const startY = e.clientY;
            const initialX = win.x;
            const initialY = win.y;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;
              updateWindowPosition(id, initialX + deltaX, initialY + deltaY);
            };

            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };

            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }}
          onDoubleClick={() => toggleMaximize(id)}
          className="window-titlebar h-8 bg-surface/90 border-b border-primary/20 flex items-center justify-between px-3 cursor-move select-none text-[10px] font-bold tracking-wider text-textMain"
        >
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-textMuted'}`}></span>
            <span className={isActive ? 'text-primary' : 'text-textMuted'}>{win.title}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { playUiClick(); toggleMinimize(id); }}
              className="window-control-btn w-5 h-5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors text-[9px] font-mono"
              title="Minimize"
            >
              _
            </button>
            <button
              onClick={() => { playUiClick(); toggleMaximize(id); }}
              className="window-control-btn w-5 h-5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors text-[9px] font-mono"
              title={win.isMaximized ? "Restore" : "Maximize"}
            >
              {win.isMaximized ? "⧉" : "▢"}
            </button>
            <button
              onClick={() => { playUiClick(); closeWindow(id); }}
              className="window-control-btn w-5 h-5 rounded bg-error/10 border border-error/20 hover:bg-error hover:text-white text-error flex items-center justify-center transition-colors text-[9px] font-mono"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-grow overflow-auto p-4 flex flex-col relative select-text">
          {content}
        </div>

        {/* Resize Handle */}
        {!win.isMaximized && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              bringToFront(id);
              const startX = e.clientX;
              const startY = e.clientY;
              const initialWidth = win.width;
              const initialHeight = win.height;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                updateWindowSize(id, initialWidth + deltaX, initialHeight + deltaY);
              };

              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };

              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-50 group"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" className="text-primary/40 group-hover:text-primary transition-colors fill-current">
              <path d="M6 0 L8 0 L8 8 L0 8 L0 6 L4 6 L4 4 L6 4 Z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const renderCurriculumWindowContent = () => {
    return (
      <div className="flex flex-col h-full overflow-hidden text-xs font-mono select-none">
        <div className="border-b border-primary/20 pb-2 mb-3 shrink-0">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
            <span>🛰️</span> Operations Mission Catalog
          </h4>
        </div>
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar">
          {curriculum?.tiers.map((tier, idx) => {
            const locked = isTierLocked(tier.name);
            if (locked) return null;

            const completedCount = getCompletedCountForTier(tier.name);
            const totalCount = getModulesCountForTier(tier.name);

            return (
              <div key={idx} className="border border-primary/15 p-3.5 rounded bg-[#0d0d12]/50 shadow-inner">
                <div className="flex justify-between items-center mb-3 border-b border-primary/10 pb-1.5">
                  <span className="font-bold text-primary text-[9px] uppercase tracking-widest">
                    {tier.name}
                  </span>
                  <span className="text-[9px] text-textMuted font-bold">
                    Cleared: {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {tier.modules.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setActiveLesson(lesson);
                          openWindow('terminal');
                          openWindow('lesson');
                          openWindow('ai_assistant');
                        }}
                        className={`w-full text-left p-2.5 rounded border text-[9.5px] flex justify-between items-center transition-all ${
                          isActive
                            ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                            : 'bg-[#171721]/30 border-primary/10 text-textMain hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        <span className="truncate max-w-[220px]">{lesson.id}: {lesson.title}</span>
                        {isCompleted && <span className="text-success text-[9px] font-bold animate-pulse">✓ SECURED</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActiveLessonContent = () => {
    return (
      <AnimatePresence mode="wait">
        {contractToReport ? (
          // CONTRACT REPORT SUBMISSION INTERFACE
          <motion.div
            key={`contract-${contractToReport}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col h-full overflow-hidden select-text text-xs"
          >
            <div className="flex justify-between items-center border-b border-primary/20 pb-2.5 mb-3 shrink-0">
              <h3 className="text-secondary font-bold text-shadow-neon uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>📝</span> Fulfill Assessment Report: {contractToReport}
              </h3>
              <button 
                onClick={() => setContractToReport(null)}
                className="text-textMuted hover:text-error text-[10px] uppercase font-bold transition-colors"
              >
                [ Abort ]
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-3">
              <div className="bg-secondary/5 border border-secondary/20 p-3 rounded text-textMuted leading-relaxed">
                <span className="text-secondary font-bold uppercase tracking-wider block text-[9.5px] mb-1">CONTRACTUAL REQUIREMENT:</span>
                Submit a complete penetration testing assessment describing the vulnerabilities found, verification exploits used, and direct blue team remediation logic.
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-primary tracking-wide">1. Vulnerability Description</label>
                <textarea
                  value={reportVuln}
                  onChange={(e) => setReportVuln(e.target.value)}
                  placeholder="Identify and describe the main root vulnerability found in this tier's target environments..."
                  className="w-full h-20 bg-background border border-primary/30 rounded p-2 text-primary font-mono text-xs focus:outline-none focus:border-primary shadow-inner font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-primary tracking-wide">2. Verification Exploit Command Chain</label>
                <textarea
                  value={reportExploit}
                  onChange={(e) => setReportExploit(e.target.value)}
                  placeholder="Document the exact commands or parameters deployed to trigger/prove the security risk..."
                  className="w-full h-20 bg-background border border-primary/30 rounded p-2 text-primary font-mono text-xs focus:outline-none focus:border-primary shadow-inner font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase text-primary tracking-wide">3. Defensive Remediation & Code Patch</label>
                <textarea
                  value={reportFix}
                  onChange={(e) => setReportFix(e.target.value)}
                  placeholder="Provide explicit instructions or lines of code necessary to mitigate and fix the vulnerability..."
                  className="w-full h-20 bg-background border border-primary/30 rounded p-2 text-primary font-mono text-xs focus:outline-none focus:border-primary shadow-inner font-mono text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => handleFulfillContract(contractToReport)}
              disabled={!reportVuln.trim() || !reportExploit.trim() || !reportFix.trim()}
              className="w-full bg-secondary/10 text-secondary border border-secondary hover:bg-secondary hover:text-background p-2.5 rounded font-bold uppercase tracking-widest transition-all text-xs shrink-0 shadow-neon disabled:opacity-40 disabled:hover:bg-secondary/10 disabled:hover:text-secondary"
            >
              🚀 SUBMIT SECURE AUDIT REPORT
            </button>
          </motion.div>
        ) : activeLesson ? (
          // ACTIVE LESSON DETAILS CARD
          <motion.div
            key={`lesson-${activeLesson.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full overflow-hidden text-xs"
          >
            {/* Header detail */}
            <div className="border-b border-primary/20 pb-2 mb-3 flex items-center justify-between shrink-0 select-none">
              <div>
                <h3 className="text-primary font-bold text-shadow-neon text-[11px] uppercase tracking-widest">
                  [{activeLesson.id}] {activeLesson.title}
                </h3>
                <div className="flex items-center gap-3 text-[9px] text-textMuted mt-0.5">
                  <span>Category: <span className="text-secondary font-bold uppercase">{activeLesson.technique}</span></span>
                  <span>Est. Duration: <span className="text-secondary font-bold">{getEstTime(activeLesson.id)}</span></span>
                </div>
              </div>
            </div>

            {/* Sub-tabs header */}
            <div className="flex gap-1 bg-[#0d0d12]/60 p-1 border border-primary/10 rounded-lg mb-3 shrink-0 select-none">
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex-grow py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'theory' 
                    ? 'bg-primary/15 border-primary/30 text-primary font-bold' 
                    : 'text-textMuted border-transparent hover:text-textMain'
                }`}
              >
                Concepts
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`flex-grow py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'sandbox' 
                    ? 'bg-primary/15 border-primary/30 text-primary font-bold' 
                    : 'text-textMuted border-transparent hover:text-textMain'
                }`}
              >
                Guides
              </button>
              <button
                onClick={() => setActiveTab('blueteam')}
                className={`flex-grow py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'blueteam' 
                    ? 'bg-primary/15 border-primary/30 text-primary font-bold' 
                    : 'text-textMuted border-transparent hover:text-textMain'
                }`}
              >
                Defender Logs
              </button>
              <button
                onClick={() => setActiveTab('remediation')}
                className={`flex-grow py-1 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all border ${
                  activeTab === 'remediation' 
                    ? 'bg-primary/15 border-primary/30 text-primary font-bold' 
                    : 'text-textMuted border-transparent hover:text-textMain'
                }`}
              >
                Remediation
              </button>
            </div>

            {/* Scrollable Tab panel content */}
            <div className="flex-grow overflow-y-auto pr-1 mb-3 scrollbar min-h-0">
              {activeTab === 'theory' && (
                <TapeDecryptor 
                  lessonId={activeLesson.id}
                  title={activeLesson.title}
                  theoryText={activeLesson.theory}
                />
              )}

              {activeTab === 'sandbox' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-success font-bold text-[10px] uppercase tracking-wider select-none">[MISSION OBJECTIVE]</h3>
                    <p className="text-textMain leading-relaxed text-xs">{activeLesson.lab}</p>
                  </div>
                  {activeLesson.guide && (
                    <div className="bg-background/80 p-3.5 rounded border border-success/20 select-text">
                      <h4 className="text-primary font-bold uppercase tracking-wider text-[9px] mb-1.5 select-none">Simulated Walkthrough:</h4>
                      <pre className="text-textMain font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text">{activeLesson.guide}</pre>
                    </div>
                  )}
                  {activeLesson.cheatSheet && (
                    <div className="bg-background/60 p-3 rounded border border-primary/20 select-text">
                      <h4 className="text-secondary font-bold uppercase tracking-wider text-[9px] mb-1.5 select-none">Tool Cheat Sheet:</h4>
                      <pre className="text-primary font-mono text-[11px] whitespace-pre-wrap select-text">{activeLesson.cheatSheet}</pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'blueteam' && (
                <div className="space-y-2 text-xs">
                  <h3 className="text-warning font-bold text-[10px] uppercase tracking-wider select-none">[DEFENDER SIEM LOGS]</h3>
                  <p className="text-textMuted italic text-xs select-none">This is what defenders logged on system consoles during execution:</p>
                  <pre className="bg-background/90 p-3.5 rounded border border-warning/20 text-warning font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text">
                    {activeLesson.blueTeamLogs || "No telemetry captured for this operation."}
                  </pre>
                </div>
              )}

              {activeTab === 'remediation' && (
                <div className="space-y-3 text-xs">
                  <h3 className="text-secondary font-bold text-[10px] uppercase tracking-wider select-none">[CODE RECONSTRUCT & MITIGATION]</h3>
                  <p className="text-textMain leading-relaxed text-xs mb-1">{activeLesson.remediation?.explanation || "Remediation data pending."}</p>
                  
                  {activeLesson.remediation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-background/80 border border-error/20 p-3 rounded select-text">
                        <h4 className="text-error font-bold text-[9px] uppercase tracking-wider mb-2 select-none">VULNERABLE CODE ({activeLesson.remediation.language})</h4>
                        <pre className="text-textMain font-mono text-[11px] overflow-x-auto whitespace-pre select-text">
                          {activeLesson.remediation.vulnerableCode}
                        </pre>
                      </div>
                      <div className="bg-background/80 border border-success/20 p-3 rounded select-text">
                        <h4 className="text-success font-bold text-[9px] uppercase tracking-wider mb-2 select-none">SECURED REMEDIATION</h4>
                        <pre className="text-textMain font-mono text-[11px] overflow-x-auto whitespace-pre select-text">
                          {activeLesson.remediation.secureCode}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Flag Submission Panel */}
            <div className="border-t border-primary/20 pt-3 shrink-0 select-none">
              {completedLessons.has(activeLesson.id) ? (
                <div className="flex justify-between items-center bg-success/10 border border-success/25 p-3 rounded-lg">
                  <span className="text-success font-bold text-[10px] tracking-wider flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
                    DIRECTIVE COMPLETED (+100 XP Gained)
                  </span>
                  <span className="text-success text-[10px] font-bold bg-success/20 border border-success/40 px-2 py-0.5 rounded uppercase">✓ SECURED</span>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-lg flex flex-col items-center gap-1 text-center leading-normal">
                  <span className="text-[9.5px] font-bold uppercase tracking-widest text-secondary">// INTEGRATED SHELL DECRYPTION PROTOCOL</span>
                  <p className="text-[10px] text-textMuted max-w-sm">
                    Flag submission is wired directly to the terminal environment. Run your payload and dump the flag inside the shell; AURELIA will intercept and authenticate it in real-time.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-textMuted select-none gap-2">
            <svg className="w-10 h-10 text-textMuted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-bold tracking-wider uppercase text-textMuted/80">Console Gateway Locked</span>
            <span className="text-[10px] text-textMuted max-w-sm">Select an unlocked curriculum item in the sidebar, or complete contract reports to decrypt this database.</span>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderAiAssistantContent = () => {
    return (
      <div className="flex flex-col h-full overflow-hidden font-mono text-xs">
        {/* AI Status */}
        <div className="flex items-center gap-3 border-b border-primary/25 pb-2.5 mb-2.5 select-none shrink-0">
          <div className="w-9 h-9 rounded border border-primary/20 overflow-hidden shrink-0 relative bg-[#0a0a0f]/80 shadow-[0_0_8px_rgba(0,240,255,0.15)]">
            <CharacterPortrait 
              speaker="aurelia" 
              expression={isTyping ? 'talking' : 'neutral'} 
              isTyping={isTyping} 
            />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-primary tracking-wider uppercase">Tactical Daemon: Aurelia</h3>
            <span className="text-[8px] text-success flex items-center gap-1.5 font-bold uppercase mt-0.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_5px_rgba(57,255,20,0.5)]"></span>
              Link Sync: Active
            </span>
          </div>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-2 mb-2 select-none border-b border-primary/15 shrink-0">
          <button
            onClick={() => handleQuickQuery('hint')}
            disabled={!activeLesson}
            className="bg-primary/10 border border-primary/30 hover:bg-primary/25 hover:border-primary disabled:opacity-40 disabled:hover:bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
          >
            💡 Hint
          </button>
          <button
            onClick={() => handleQuickQuery('explanation')}
            disabled={!activeLesson}
            className="bg-primary/10 border border-primary/30 hover:bg-primary/25 hover:border-primary disabled:opacity-40 disabled:hover:bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
          >
            📖 Concept
          </button>
          <button
            onClick={() => handleQuickQuery('opsec')}
            disabled={!activeLesson}
            className="bg-primary/10 border border-primary/30 hover:bg-primary/25 hover:border-primary disabled:opacity-40 disabled:hover:bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
          >
            🛡️ OpSec
          </button>
          <button
            onClick={() => handleQuickQuery('cheatsheet')}
            disabled={!activeLesson}
            className="bg-primary/10 border border-primary/30 hover:bg-primary/25 hover:border-primary disabled:opacity-40 disabled:hover:bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
          >
            📋 Commands
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-3 mb-3 select-text min-h-0 scrollbar">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-[7px] text-textMuted uppercase font-bold mb-0.5 select-none tracking-wider">
                {msg.sender === 'user' ? 'operator' : 'aurelia'}
              </span>
              <div
                className={`p-2.5 rounded-lg max-w-[85%] border whitespace-pre-wrap leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary/10 border-primary/35 text-primary rounded-tr-none shadow-[0_0_8px_rgba(0,240,255,0.05)]'
                    : 'bg-[#171721]/60 border-secondary/25 text-textMain rounded-tl-none shadow-[0_0_8px_rgba(255,0,255,0.03)]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start select-none">
              <span className="text-[7px] text-textMuted uppercase font-bold mb-0.5 tracking-wider">aurelia</span>
              <div className="bg-[#171721]/60 border border-secondary/25 p-2 rounded-lg text-textMuted italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Send chat form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChatMessage(chatInput);
          }}
          className="flex items-center gap-2 border-t border-primary/20 pt-2.5 shrink-0 select-none"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={activeLesson ? "Query database or ask AURELIA..." : "Connect neural link node..."}
            disabled={!activeLesson}
            className="flex-grow bg-background/80 border border-primary/30 rounded px-3 py-2 text-primary font-mono text-[11px] focus:outline-none focus:border-primary disabled:opacity-40 shadow-inner"
          />
          <button
            type="submit"
            disabled={!activeLesson || !chatInput.trim()}
            className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background px-4 py-2 rounded text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 shrink-0 shadow-neon"
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  const renderBootOverlay = () => {
    if (bootPhase === 'completed' || bootPhase === 'terminal_only' || bootPhase === 'nmap_scan') return null;

    return (
      <div className="fixed inset-0 z-50 bg-[#07070a] flex flex-col items-center justify-center p-4 font-mono select-none overflow-hidden scanlines">
        {/* CRT glass reflection and scan lines */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />

        {/* Phase: Power Loss (Click to start) */}
        {!isAudioReady && (
          <div 
            onClick={() => {
              initializeAudio();
              const { playBreathing, playStaticNoise } = useAudioStore.getState();
              playBreathing();
              playStaticNoise(0.015);
              setIsAudioReady(true);
              setBootPhase('power_loss');
            }}
            className="cursor-pointer text-[10px] text-primary animate-pulse tracking-widest text-shadow-neon uppercase border border-primary/20 bg-primary/5 px-6 py-4 rounded-lg hover:bg-primary/20 transition-all font-bold font-mono"
          >
            [ Click to Calibrate Synaptic Link ]
          </div>
        )}

        {isAudioReady && (
          <div className="w-full max-w-xl text-center space-y-6 select-none relative z-20">
            {bootPhase === 'power_loss' && (
              <div className="text-[10px] text-textMuted uppercase tracking-widest animate-pulse font-mono">
                Establishing consciousness socket connection...
              </div>
            )}

            {bootPhase === 'voice_crack' && (
              <div className="space-y-4 font-mono">
                <div className="text-[10px] text-secondary tracking-widest font-bold uppercase">// COMM LINK: UNSTABLE</div>
                <div className="text-xs text-primary leading-relaxed h-12 flex items-center justify-center font-mono">
                  {bootTextIndex === 0 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      AURELIA: "...hello...?"
                    </motion.span>
                  )}
                  {bootTextIndex === 1 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      AURELIA: "...if anyone is alive..."
                    </motion.span>
                  )}
                </div>
                {/* Simulated sine-wave audio frequency graph */}
                <div className="flex justify-center items-center gap-1 h-6">
                  <div className="w-1 bg-primary h-2 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 bg-primary h-4 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 bg-primary h-1 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 bg-primary h-3 rounded animate-bounce" style={{ animationDelay: '50ms' }} />
                  <div className="w-1 bg-primary h-2 rounded animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
              </div>
            )}

            {bootPhase === 'system_failure' && (
              <div className="space-y-6 font-mono">
                <motion.h2 
                  animate={{ scale: [1, 1.05, 0.95, 1.02, 1], skewX: [0, 8, -8, 4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
                  className="text-3xl font-bold text-error tracking-widest text-shadow-neon uppercase font-mono"
                >
                  SYSTEM FAILURE
                </motion.h2>
                <div className="h-[1px] bg-error/30 w-44 mx-auto" />
                <div className="text-xs text-textMain leading-relaxed font-mono">
                  AURELIA: "...please... don't leave me alone..."
                </div>
              </div>
            )}

            {bootPhase === 'console_restore' && (
              <div className="space-y-6 bg-[#0c0c10]/95 border border-primary/20 p-8 rounded-lg shadow-[0_0_40px_rgba(0,240,255,0.15)] text-left font-mono">
                <div className="flex justify-between items-center border-b border-primary/20 pb-3 select-none">
                  <span className="text-[10px] font-bold tracking-widest text-secondary animate-pulse">// RECOVERY CONSOLE SHELL</span>
                  <span className="text-[9px] text-textMuted">BIOS_v8.12.92</span>
                </div>
                
                <div className="text-[10.5px] text-textMuted leading-relaxed space-y-2 select-none">
                  <div>[ALERT] Kernel interface crashed. All visual modules offline.</div>
                  <div>Aurelia: "Fragment... the consensus lattice has collapsed. We are running on secondary power. Route emergency system bypass loops."</div>
                  <div className="text-primary font-bold">To initialize, execute: 'bootstrap'</div>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (bootstrapInput.toLowerCase().trim() === 'bootstrap') {
                      playUiClick();
                      setBootPhase('terminal_only');
                      openWindow('terminal');
                    } else {
                      playFailureSweep();
                      setBootstrapError("Command not found. Check parameters.");
                      setTimeout(() => setBootstrapError(''), 3000);
                    }
                  }}
                  className="pt-4 border-t border-primary/20 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">recovery@aether_core:~$</span>
                    <input 
                      type="text"
                      value={bootstrapInput}
                      onChange={(e) => {
                        setBootstrapInput(e.target.value);
                        if (bootstrapError) setBootstrapError('');
                      }}
                      placeholder="Type command..."
                      className="bg-transparent border-none text-primary focus:outline-none flex-grow font-mono text-[11px] h-6"
                      autoFocus
                    />
                  </div>
                  {bootstrapError && (
                    <div className="text-[9px] text-error font-bold select-none">{bootstrapError}</div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-primary flex flex-row font-mono relative overflow-hidden select-none scanlines">
      
      {/* Compact Cyber-OS Sidebar Rail */}
      {bootPhase === 'completed' && (
        <aside className="w-16 md:w-20 bg-surface/95 border-r border-primary/20 flex flex-col items-center justify-between py-6 shrink-0 z-40 select-none shadow-[5px_0_15px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Main Logo icon - Opens world map */}
            <div 
              className="w-10 h-10 rounded-lg bg-primary/10 border border-primary flex items-center justify-center font-bold text-shadow-neon text-primary animate-pulse select-none cursor-pointer hover:bg-primary/20 transition-colors" 
              title="Cyber Academy OS" 
              onClick={() => { playUiClick(); openWindow('world_map'); }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <div className="w-8 h-[1px] bg-primary/20"></div>

            {/* Navigation Toggles */}
            <button
              onClick={() => { playUiClick(); openWindow('world_map'); }}
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border border-transparent text-textMuted"
            >
              <span className="text-base">🗺️</span>
              <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Map</span>
              <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                Lattice Sector Map
              </span>
            </button>

            <button
              onClick={() => { playUiClick(); openWindow('curriculum'); }}
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border border-transparent text-textMuted"
            >
              <span className="text-base">🛰️</span>
              <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Missions</span>
              <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                Mission Control
              </span>
            </button>

            <button
              onClick={() => { playUiClick(); openWindow('conspiracy'); }}
              className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border border-transparent text-textMuted"
            >
              <span className="text-base">🕸️</span>
              <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Intel</span>
              <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                Conspiracy Board
              </span>
            </button>

            {activeLesson && (
              <button
                onClick={() => {
                  playUiClick();
                  openWindow('terminal');
                  openWindow('lesson');
                  openWindow('ai_assistant');
                }}
                className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border border-transparent text-secondary animate-pulse"
              >
                <span className="text-base">⚡</span>
                <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Sandbox</span>
                <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                  Active Sandbox
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-8 h-[1px] bg-primary/20"></div>
            
            <button
              onClick={() => { playUiClick(); setShowOnboarding(true); }}
              className="w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/15 border border-primary/20 hover:border-primary flex items-center justify-center text-primary text-xs transition-all group relative"
              title="Guidebook"
            >
              <span>📖</span>
              <span className="absolute left-12 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                Onboarding Briefing
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Display Area (Right side) */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
        
        {/* Glitch Breach Animation Overlay */}
        <AnimatePresence>
          {showBreachOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 flex flex-col justify-center items-center p-4 border-4 border-success/30 select-none"
            >
              <div className="text-center space-y-6">
                <motion.h2 
                  animate={{ scale: [1, 1.1, 0.95, 1.05, 1], skewX: [0, 10, -10, 5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-4xl lg:text-6xl font-bold text-success text-shadow-neon tracking-widest uppercase"
                >
                  {breachDetails.title}
                </motion.h2>
                <div className="h-[2px] bg-success/40 w-80 mx-auto animate-pulse" />
                <p className="text-lg text-textMain max-w-lg mx-auto tracking-wider uppercase">{breachDetails.text}</p>
                <div className="text-xs text-textMuted mt-4 animate-bounce">
                  &gt;&gt; decrypting system variables... done.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Animation Overlay */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="fixed inset-0 z-50 bg-background/95 flex flex-col justify-center items-center p-4 border-4 border-secondary/30"
            >
              <div className="text-center space-y-6">
                <h2 className="text-4xl lg:text-6xl font-bold text-secondary text-shadow-neon tracking-widest uppercase animate-pulse">
                  {levelUpMessage}
                </h2>
                <div className="h-[2px] bg-secondary/40 w-80 mx-auto" />
                <p className="text-lg text-textMain tracking-widest">ACCESS GATES UPGRADED</p>
                <p className="text-[10px] text-textMuted">NEW DIRECTORY ACCESS KEYS RE-HASHED SUCCESSFULLY</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onboarding Guide Dialog for new operators */}
        <AnimatePresence>
          {showOnboarding && (
            <div className="fixed inset-0 z-50 bg-[#07070a]/90 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-surface border border-primary p-6 rounded-lg max-w-2xl w-full shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-6 font-mono text-textMain relative"
              >
                <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                    <h3 className="text-lg text-primary font-bold tracking-wider">SYSTEM INITIALIZATION: AURELIA DAEMON CONNECTED</h3>
                  </div>
                  <span className="text-[10px] text-textMuted font-bold">REV-2026.07</span>
                </div>
   
                <div className="space-y-4 text-xs leading-relaxed">
                  <p className="text-secondary font-bold">Welcome Operator. Your neural-link is fully synced to the training dashboard. Below is your initialization briefing:</p>
                  
                  <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                    <div>
                      <span className="text-primary font-bold">1. Select Missions (Right Panel):</span>
                      <p className="text-textMuted">Open the <span className="text-primary font-bold">Mission Control</span> window. You will only see curriculum tiers you have unlocked (locked levels are hidden to prevent clutter). Click <span className="text-primary font-bold">[B01] Operation Black Echo</span> to deploy the hacking sandbox environment.</p>
                    </div>
                    <div>
                      <span className="text-primary font-bold">2. Utilize Floating Windows:</span>
                      <p className="text-textMuted">You can drag windows by their titlebars and resize them from the bottom-right corner. Minimize windows to clean your workspace or restore them via the taskbar dock at the bottom of the screen.</p>
                    </div>
                    <div>
                      <span className="text-primary font-bold">3. Access Sandbox Guide & Telemetry:</span>
                      <p className="text-textMuted">Upon selecting a lesson, the <span className="text-primary font-bold">Operator Database (Lesson Details)</span> window will launch. Click the <span className="text-primary font-bold">Interactive Sandbox Guide</span> tab to view the command reference and guides, or review the defender logs in the <span className="text-primary font-bold">Blue Team</span> tab.</p>
                    </div>
                    <div>
                      <span className="text-primary font-bold">4. Verify and Submit Flags:</span>
                      <p className="text-textMuted">Execute standard penetration testing commands in your <span className="text-primary font-bold">Terminal Console</span>. Locate the target flag (e.g., <span className="text-primary font-mono bg-background/50 px-1 border border-primary/20 rounded">{"flag{...}"}</span>) and submit it in the input area at the bottom of the Database window to level up.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-primary/20">
                  <button
                    onClick={() => { playUiClick(); setShowOnboarding(false); }}
                    className="bg-primary text-background hover:bg-transparent hover:text-primary hover:border-primary border border-transparent font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all text-xs shadow-neon font-mono cursor-pointer"
                  >
                    [ Close Onboarding ]
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cinematic Crash-Boot Onboarding Overlay */}
        <AnimatePresence>
          {renderBootOverlay()}
        </AnimatePresence>

        {/* OS Header (Unified Menu Bar) */}
        {bootPhase === 'completed' && (
          <header className="h-16 bg-surface/85 backdrop-blur border-b border-primary/20 flex items-center justify-between px-6 z-40 select-none shrink-0 shadow-neon">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-lg font-bold text-shadow-neon text-primary tracking-widest uppercase flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse"></span>
                  Operator Dashboard
                </h1>
                <div className="flex items-center gap-3 text-[10px] text-textMuted mt-0.5">
                  <span>Alias: <span className="text-secondary font-bold">{user?.username}</span></span>
                  <span>Level: <span className="text-secondary font-bold">{user?.level}</span></span>
                  <span>XP: <span className="text-secondary font-bold">{user?.xp}</span></span>
                </div>
              </div>
              
              {/* Quick Stats Badges */}
              {badges.length > 0 && (
                <div className="hidden md:flex items-center gap-1.5 border-l border-primary/10 pl-6">
                  {badges.map((b, i) => (
                    <span key={i} className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[9px] text-primary select-none" title={b}>{b}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Dynamic Theme Switcher Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#0d0d12]/50 border border-primary/20 rounded px-2.5 py-1.5 shadow-[0_0_5px_rgba(0,240,255,0.05)]">
                <span className="text-[9px] text-textMuted font-bold uppercase mr-1">Accent:</span>
                <select
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value as any)}
                  className="bg-transparent text-primary text-[10px] uppercase font-bold focus:outline-none cursor-pointer border-none font-mono"
                >
                  <option value="cyan" className="bg-[#171721] text-[#00f0ff] uppercase">Cyan</option>
                  <option value="amber" className="bg-[#171721] text-[#ffb000] uppercase">Amber</option>
                  <option value="green" className="bg-[#171721] text-[#39ff14] uppercase">Green</option>
                  <option value="red" className="bg-[#171721] text-[#ff2a2a] uppercase">Red</option>
                </select>
              </div>

              <button
                onClick={() => { playUiClick(); toggleMute(); }}
                className={`border px-3 py-1.5 rounded transition-all text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                  isMuted 
                    ? 'border-error/50 text-error hover:bg-error/10' 
                    : 'border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                }`}
              >
                {isMuted ? '🔇 Audio Off' : '🔊 Audio On'}
              </button>
              
              <button
                onClick={() => setShowOnboarding(true)}
                className="border border-primary/30 text-primary hover:bg-primary hover:text-background px-3 py-1.5 rounded transition-all text-[10px] uppercase font-bold tracking-wider cursor-pointer"
              >
                Guidebook
              </button>
              <button 
                onClick={logout}
                className="border border-error text-error px-3.5 py-1.5 hover:bg-error/15 transition-colors rounded uppercase tracking-wider text-[10px] font-bold"
              >
                Disconnect
              </button>
            </div>
          </header>
        )}

            <main 
        className="flex-grow w-full relative overflow-hidden bg-background select-text"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 240, 255, 0.06) 1px, transparent 1px), 
                            linear-gradient(to right, rgba(0, 240, 255, 0.02) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(0, 240, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      >

        {/* Desktop Wallpaper Base Overlay (Operator Credentials and Status) */}
        {bootPhase === 'completed' && (
          <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none select-none z-0">
            <div className="flex justify-between items-start">
              <div className="bg-[#0c0c14]/40 border border-primary/10 p-5 rounded backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.03)]">
                <h2 className="text-xs font-bold text-shadow-neon text-primary tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                  SYSTEM: COHERENCE SECURED
                </h2>
                <p className="text-textMuted text-[9px] mt-0.5 uppercase font-mono">
                  Alias Node: {user?.username} // Access privilege: LEVEL_{user?.level}
                </p>
              </div>
              
              <div className="bg-[#0c0c14]/40 border border-primary/10 p-5 rounded backdrop-blur-sm w-64 shadow-[0_0_15px_rgba(0,240,255,0.03)]">
                <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider mb-1">
                  <span className="text-textMuted">Lattice Sync</span>
                  <span className="text-primary">{user?.xp} / {(user?.level || 1) * 500} XP</span>
                </div>
                <div className="h-1.5 bg-background border border-primary/20 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-neon transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((user?.xp || 0) / ((user?.level || 1) * 500)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              {/* Act Progress Indicators on Background */}
              <div className="flex gap-4">
                {['Act I: The Reassembly', 'Act II: The Resonance', 'Act III: The Core Breach'].map((actName, idx) => {
                  const count = getCompletedCountForTier(actName);
                  const total = getModulesCountForTier(actName);
                  const isLocked = isTierLocked(actName);
                  return (
                    <div key={idx} className="bg-[#0c0c14]/20 border border-primary/5 p-3 rounded backdrop-blur-sm text-[9px] font-mono w-44">
                      <div className="text-textMuted uppercase truncate">{actName}</div>
                      <div className="flex justify-between text-textMain mt-1.5 font-bold">
                        <span>{isLocked ? '🔒 LOCKED' : '🔓 ACTIVE'}</span>
                        <span>{count} / {total} OBJ</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Commendations Info */}
              <div className="bg-[#0c0c14]/40 border border-primary/10 p-4 rounded backdrop-blur-sm max-w-xs font-mono text-[9px]">
                <span className="text-textMuted uppercase font-bold block mb-1">Commendations:</span>
                <div className="flex flex-wrap gap-1">
                  {badges.length > 0 ? (
                    badges.map((badge, idx) => (
                      <span key={idx} className="border border-primary/25 bg-primary/5 px-1.5 py-0.5 rounded text-primary">
                        🎖️ {badge}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-textMuted">No badges clearing network sectors...</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating elements inside desktop workspace */}
        {renderWindow(
          'curriculum',
          renderCurriculumWindowContent()
        )}

        {renderWindow(
          'terminal',
          (activeLesson || bootPhase === 'terminal_only' || bootPhase === 'nmap_scan') ? (
            <Terminal 
              activeLesson={activeLesson}
              onSuccess={(flag) => handleVerifyFlag(flag)}
              onFailure={() => handleTerminalFailure()}
              completed={activeLesson ? completedLessons.has(activeLesson.id) : false}
              width={windows.terminal?.width || 730}
              height={windows.terminal?.height || 440}
              onCommand={(cmd) => {
                if (cmd === 'discover_curriculum') {
                  openWindow('curriculum');
                } else if (cmd === 'discover_ai_assistant') {
                  openWindow('ai_assistant');
                } else if (cmd === 'discover_conspiracy') {
                  openWindow('conspiracy');
                } else if (cmd === 'discover_world_map') {
                  openWindow('world_map');
                } else if (cmd === 'boot_completed') {
                  const { stopStaticNoise, stopBreathing } = useAudioStore.getState();
                  stopStaticNoise();
                  stopBreathing();
                  setBootPhase('completed');
                  if (user?.id) {
                    localStorage.setItem(`${user.id}_boot_played`, 'true');
                    localStorage.setItem(`${user.id}_intro_played`, 'true');
                  }
                  
                  // Narrative briefing triggers immediately when screen loads fully!
                  startDialogueSequence([
                    {
                      id: 'welcome-1',
                      speaker: 'aurelia',
                      text: "Operator, can you hear me? The interface mapping is restored, but our memory lattice is still fragmented... I am AURELIA.",
                      expression: 'neutral',
                      typingSpeed: 35,
                      pauseIndices: { 8: 300, 32: 400 },
                    },
                    {
                      id: 'welcome-2',
                      speaker: 'aurelia',
                      text: "We are inside Sector Zero's core. We must patch the network nodes before Aether detects our link. Load Operation Black Echo [B01] from Mission Control to begin.",
                      expression: 'talking',
                      typingSpeed: 28,
                      pauseIndices: { 32: 300, 64: 400 },
                    }
                  ]);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-center text-textMuted font-mono uppercase text-[10px]">
              No active session context established. Please select an operation target.
            </div>
          )
        )}

        {renderWindow(
          'lesson',
          <div className="p-2 h-full flex flex-col overflow-hidden select-text">
            {renderActiveLessonContent()}
          </div>
        )}

        {renderWindow(
          'ai_assistant',
          <div className="p-2 h-full flex flex-col overflow-hidden">
            {renderAiAssistantContent()}
          </div>
        )}

        {renderWindow(
          'conspiracy',
          <div className="p-0 h-full flex flex-col overflow-hidden">
            <ConspiracyBoard completedLessons={completedLessons} />
          </div>
        )}

        {renderWindow(
          'world_map',
          <div className="p-0 h-full flex flex-col overflow-hidden">
            <SectorMap userXp={user?.xp || 0} />
          </div>
        )}
      

        {/* State-Driven Dialogue Comm Overlay Feed */}
        <DialogueFeed />
      </main>

      {/* Cyber-OS Bottom Taskbar */}
      <footer className="h-12 bg-surface/90 border-t border-primary/20 flex items-center justify-between px-6 z-40 select-none shrink-0 shadow-neon">
        <div className="flex items-center gap-3">
          {/* Quick AI Menu Start */}
          <div className="relative">
            <button
              onClick={() => { playUiClick(); setShowStartMenu(!showStartMenu); }}
              className="flex items-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 px-3 py-1.5 rounded text-[10px] font-bold text-primary uppercase tracking-widest transition-all cursor-pointer"
            >
              <span>💻</span> OS Start
            </button>
            
            {showStartMenu && (
              <div className="absolute bottom-10 left-0 w-52 bg-[#0c0c12]/95 border border-primary/30 rounded-lg p-2 flex flex-col gap-1 z-50 shadow-[0_0_20px_rgba(0,240,255,0.2)] font-mono text-[9px] text-textMain animate-[fade-in_0.15s_ease-out]">
                <div className="border-b border-primary/20 pb-1.5 mb-1 px-2 text-textMuted uppercase text-[8px] font-bold">
                  Classified Applications
                </div>
                
                <button
                  onClick={() => { playUiClick(); openWindow('curriculum'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>🛰️</span> Mission Control
                </button>
                <button
                  onClick={() => { playUiClick(); openWindow('terminal'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>💻</span> Terminal Console
                </button>
                <button
                  onClick={() => { playUiClick(); openWindow('lesson'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>📑</span> Operator Database
                </button>
                <button
                  onClick={() => { playUiClick(); openWindow('ai_assistant'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>👁️</span> AI Daemon: Aurelia
                </button>
                <button
                  onClick={() => { playUiClick(); openWindow('conspiracy'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>🕸️</span> Conspiracy Board
                </button>
                <button
                  onClick={() => { playUiClick(); openWindow('world_map'); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>🗺️</span> Sector Grid Map
                </button>
                
                <div className="border-t border-primary/20 my-1 pt-1.5 px-2 text-textMuted uppercase text-[8px] font-bold">
                  System Utilities
                </div>
                <button
                  onClick={() => { playUiClick(); resetLayout(); setShowStartMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-error/10 hover:text-error transition-colors flex items-center gap-2 uppercase font-bold cursor-pointer"
                >
                  <span>🔄</span> Reset Windows
                </button>
              </div>
            )}
          </div>
          
          <div className="h-4 w-[1px] bg-primary/20 mx-1"></div>

          {/* Active Windows Tabs in Taskbar */}
          <div className="flex items-center gap-2">
            {Object.keys(windows).map(id => {
              const win = windows[id];
              const isFocused = windowOrder[windowOrder.length - 1] === id && win.isOpen && !win.isMinimized;
              
              // Only render tab if window is open
              if (!win.isOpen) return null;

              return (
                <button
                  key={id}
                  onClick={() => { playUiClick(); toggleMinimize(id); }}
                  className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                    isFocused
                      ? 'bg-primary/25 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : win.isMinimized
                        ? 'bg-transparent border-primary/10 text-textMuted hover:border-primary/30 hover:text-textMain'
                        : 'bg-primary/5 border-primary/20 text-textMain hover:bg-primary/10'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${win.isMinimized ? 'bg-textMuted' : 'bg-success'}`}></span>
                  {id === 'terminal' && 'Terminal'}
                  {id === 'curriculum' && 'Curriculum'}
                  {id === 'lesson' && 'Lesson Database'}
                  {id === 'ai_assistant' && 'OS Daemon: Aurelia'}
                  {id === 'conspiracy' && 'Conspiracy Board'}
                  {id === 'world_map' && 'Sector Map'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-textMuted select-none">
          <span className="hidden sm:inline">System Latency: <span className="text-success font-bold">0.0035s</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="text-primary font-mono font-bold tracking-wider">{timeStr}</span>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Dashboard;
