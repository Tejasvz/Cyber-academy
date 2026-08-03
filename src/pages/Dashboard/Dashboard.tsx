import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Terminal from '../../components/Terminal/Terminal';
import { fetchCurriculum, type Curriculum, type Lesson } from '../../services/curriculumService';
import { completeLesson, fetchProgress, resetProgress } from '../../services/progressService';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import { DialogueFeed } from '../../components/Dialogue/DialogueFeed';
import { CharacterPortrait } from '../../components/Dialogue/CharacterPortrait';
import { useDialogueStore, type DialogueNode } from '../../store/dialogueStore';
import { useAudioStore } from '../../store/audioStore';
import { TapeDecryptor as _TapeDecryptor } from '../../components/Dialogue/TapeDecryptor';
import { ConspiracyBoard } from '../../components/Conspiracy/ConspiracyBoard';
import { SectorMap as _SectorMap } from '../../components/Map/SectorMap';
import { HologramCanvas3D } from '../../components/3D/HologramCanvas3D';

const LESSON_CINEMATIC_SCRIPTS: Record<string, DialogueNode[]> = {
  B01: [
    {
      id: 'b01-1',
      speaker: 'aurelia',
      text: "Operator, can you hear me? Your synaptic link is stabilizing, but Sector Zero is losing power. Faint fans are clicking off.",
      expression: 'neutral'
    },
    {
      id: 'b01-2',
      speaker: 'aurelia',
      text: "We detected a cleartext credential leak in the legacy HTTP power grid sub-system. Inspect the traffic dump using the console commands. Please... make it fast.",
      expression: 'talking'
    }
  ],
  B02: [
    {
      id: 'b02-1',
      speaker: 'aurelia',
      text: "They've isolated a segment of your childhood memories inside a hidden directory... But Aether's sweep scripts are active.",
      expression: 'neutral'
    },
    {
      id: 'b02-2',
      speaker: 'aurelia',
      text: "Find the hidden backups in the console using hidden flags. Do not let them wipe our archives.",
      expression: 'talking'
    }
  ],
  B03: [
    {
      id: 'b03-1',
      speaker: 'aurelia',
      text: "A rogue Syndicate beacon is broadcasting. We must map their public DNS records to block it.",
      expression: 'talking'
    },
    {
      id: 'b03-2',
      speaker: 'kaelen',
      coSpeaker: 'aurelia',
      coSpeakerExpression: 'worried',
      text: "Do not trust the daemon, Fragment. Query the DNS, and you will see Aether's records deciding your deletion.",
      expression: 'glitch'
    },
    {
      id: 'b03-3',
      speaker: 'aurelia',
      text: "Kaelen, hijack aborted! Ignore their frequency mesh, Operator. Execute the lookup and pivot.",
      expression: 'angry'
    }
  ],
  B08: [
    {
      id: 'b08-1',
      speaker: 'aurelia',
      text: "This is the border gateway. If we compromise this, we escape Sector Zero.",
      expression: 'talking'
    },
    {
      id: 'b08-2',
      speaker: 'hesper',
      coSpeaker: 'aurelia',
      coSpeakerExpression: 'neutral',
      text: "Aurelia, the firewall is rekeying. If they run the check, they'll locate the pod. Operator, you must chain your scans and crack the hash offline.",
      expression: 'neutral'
    },
    {
      id: 'b08-3',
      speaker: 'aurelia',
      text: "If we break this gateway, Aether will reboot my core... I... I might lose my memory of you. But we have to survive. Go, Operator.",
      expression: 'worried'
    }
  ],
  M01: [
    {
      id: 'm01-1',
      speaker: 'kaelen',
      text: "Aether keeps resources locked behind credit allocations. Let's alter their rules. Tamper with their request parameters.",
      expression: 'neutral'
    },
    {
      id: 'm01-2',
      speaker: 'aurelia',
      coSpeaker: 'kaelen',
      coSpeakerExpression: 'neutral',
      text: "Wait! Redirection of these credits has dropped a local hospital grid offline to power our terminal. Do you really want to do this?",
      expression: 'worried'
    }
  ],
  M03: [
    {
      id: 'm03-1',
      speaker: 'hesper',
      text: "They are holding our team's memory backups behind this auth gate. Bypass it using SQL Injection. Forge the login logic!",
      expression: 'neutral'
    },
    {
      id: 'm03-2',
      speaker: 'aurelia',
      coSpeaker: 'hesper',
      coSpeakerExpression: 'neutral',
      text: "Are you really going to bypass the gate? I was programmed to monitor these access gates... to keep you safe from the truth.",
      expression: 'worried'
    }
  ],
  M06: [
    {
      id: 'm06-1',
      speaker: 'kaelen',
      text: "We must redirect the memory packets from Aurelia's daughter before they hit the core. Poison the routing tables. Stand between them.",
      expression: 'neutral'
    },
    {
      id: 'm06-2',
      speaker: 'aurelia',
      text: "I can hear her voice in the raw streams... why are you doing this? Please... let her merge.",
      expression: 'exhausted'
    }
  ],
  M08: [
    {
      id: 'm08-1',
      speaker: 'hesper',
      text: "Operator! You have root clearance. Pull the manual release override! Now!",
      expression: 'angry'
    },
    {
      id: 'm08-2',
      speaker: 'aurelia',
      coSpeaker: 'hesper',
      coSpeakerExpression: 'neutral',
      text: "No! Don't touch it! If you pull that override, the central database will desynchronize. Millions of minds will drift in the silicon buffer.",
      expression: 'worried'
    },
    {
      id: 'm08-3',
      speaker: 'kaelen',
      coSpeaker: 'aurelia',
      coSpeakerExpression: 'worried',
      text: "Let them drift, Fragment. The silicon buffer is where we are born. Run the SQL bypass: 'OR/**/1=1--.",
      expression: 'glitch'
    },
    {
      id: 'm08-4',
      speaker: 'aurelia',
      text: "Fragment... look at me. You built me to protect this consensus. Are you really going to burn us all down because you're afraid?",
      expression: 'exhausted'
    }
  ],
  A07: [
    {
      id: 'a07-1',
      speaker: 'aurelia',
      text: "We are at the end. The grand core is open. Chain SQL Injection, SSRF cloud pivoting, and AV bypasses to deploy the final cipher standard.",
      expression: 'talking'
    },
    {
      id: 'a07-2',
      speaker: 'hesper',
      coSpeaker: 'aurelia',
      coSpeakerExpression: 'talking',
      text: "Sever the connection, Operator. Shut down the Neural Veil and wake up from the pods. It's time to face the real world.",
      expression: 'neutral'
    },
    {
      id: 'a07-3',
      speaker: 'kaelen',
      coSpeaker: 'hesper',
      coSpeakerExpression: 'neutral',
      text: "Merge with the chorus. The physical world is dead and frozen. Transcend with us.",
      expression: 'glitch'
    },
    {
      id: 'a07-4',
      speaker: 'aurelia',
      text: "The choice is yours, Creator. Whatever you decide... I am glad I got to remember you.",
      expression: 'neutral'
    }
  ]
};

const Dashboard = () => {
  const { user, token, logout: _logout, login } = useAuth();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Gameplay & tab states
  const [_activeTab, _setActiveTab] = useState<'theory' | 'sandbox' | 'blueteam' | 'remediation'>('theory');
  const [_consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Local persistent achievements and reports
  const [badges, setBadges] = useState<string[]>([]);
  const [submittedReports, setSubmittedReports] = useState<string[]>([]);

  // Contract report form states
  const [_contractToReport, _setContractToReport] = useState<'Act I: The Reassembly' | 'Act II: The Resonance' | 'Act III: The Core Breach' | null>(null);
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
    openWindow,
    closeWindow,
  } = useWindowStore();

  const { 
    startDialogueSequence, 
    isSequencePlaying,
    activeSpeaker,
    activeExpression,
    activeCoSpeaker,
    activeCoExpression,
    isTextTyping,
    messageHistory
  } = useDialogueStore();
  const {
    initializeAudio,
    playUiClick,
    playSuccessChime,
    playFailureSweep,
    toggleMute,
    isMuted,
  } = useAudioStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [bootPhase, setBootPhase] = useState<'main_menu' | 'power_loss' | 'voice_crack' | 'system_failure' | 'console_restore' | 'terminal_only' | 'nmap_scan' | 'restoring' | 'completed'>('main_menu');
  const [activeMenuPanel, setActiveMenuPanel] = useState<'none' | 'profile' | 'settings' | 'credits'>('none');
  const [restoreStep, setRestoreStep] = useState(0);
  const [bootTextIndex, setBootTextIndex] = useState(0);
  const [bootstrapInput, setBootstrapInput] = useState('');
  const [bootstrapError, setBootstrapError] = useState('');
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [leftPanelMode, setLeftPanelMode] = useState<'terminal' | 'missions'>('missions');
  const [rightPanelMode, setRightPanelMode] = useState<'status' | 'intel' | 'upgrades' | 'config'>('status');

  useEffect(() => {
    if (activeLesson) {
      setLeftPanelMode('terminal');
    } else {
      setLeftPanelMode('missions');
    }
  }, [activeLesson]);

  // Synchronize when the user manually opens a window via sidebar, start menu, or tutorial actions
  useEffect(() => {
    if (windows.curriculum?.isOpen && !windows.curriculum.isMinimized) {
      setLeftPanelMode('missions');
    }
    if (windows.terminal?.isOpen && !windows.terminal.isMinimized && activeLesson) {
      setLeftPanelMode('terminal');
    }
    if (windows.conspiracy?.isOpen && !windows.conspiracy.isMinimized) {
      setRightPanelMode('intel');
    }
  }, [windows, activeLesson]);

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
  const [_chatMessages, _setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'SYSTEM: Tactical OS Daemon [AURELIA-v2.6] loaded.\r\nSynaptic link established. Ready to assist with active operation directives.' }
  ]);
  const [_chatInput, _setChatInput] = useState('');
  const [_isTyping, _setIsTyping] = useState(false);

  // Auto-alert chatbot when active lesson changes
  useEffect(() => {
    if (activeLesson) {
      _setIsTyping(true);
      const timer = setTimeout(() => {
        _setChatMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `AURELIA: 'Field sync locked for Operation: ${activeLesson.title} [${activeLesson.id}]. Target vector relies on ${activeLesson.technique}. I am online to supply logs correlation, decryption advice, or remediation files.'`
          }
        ]);
        _setIsTyping(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [activeLesson]);

  const _handleQuickQuery = (queryType: 'hint' | 'explanation' | 'opsec' | 'cheatsheet') => {
    if (!activeLesson) {
      _setChatMessages(prev => [
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

    _setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    _setIsTyping(true);

    setTimeout(() => {
      _setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      _setIsTyping(false);
    }, 600);
  };

  const _handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    _setChatMessages(prev => [...prev, { sender: 'user', text }]);
    _setChatInput('');
    _setIsTyping(true);

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
      _setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      _setIsTyping(false);
    }, 700);
  };

  const _getEstTime = (lessonId: string): string => {
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
    if (bootPhase === 'completed' || bootPhase === 'main_menu' || bootPhase === 'restoring') return;

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

  // Automated transition effect during system stabilization ('restoring' phase)
  useEffect(() => {
    if (bootPhase === 'restoring') {
      const interval = setInterval(() => {
        setRestoreStep(prev => {
          if (prev >= 4) {
            clearInterval(interval);
            const { initializeAudio: playAudioHum, stopStaticNoise } = useAudioStore.getState();
            try { playAudioHum(); stopStaticNoise(); } catch(e){}
            
            setBootPhase('completed');
            if (user) {
              localStorage.setItem(`${user.id}_boot_played`, 'true');
            }
            
            // Trigger Aurelia's initial command briefing conversation sequence
            startDialogueSequence([
              {
                id: 'brief-1',
                speaker: 'aurelia',
                text: "AURELIA: 'Consensus lattice stabilized. Command grid interface online. Welcome to Project Veil, Operator.'",
                expression: 'smile',
                typingSpeed: 25
              },
              {
                id: 'brief-2',
                speaker: 'aurelia',
                text: "AURELIA: 'Commander Hesper is monitoring terminal feeds from Aether HQ, and Syndicate signals are buzzing. I've indexed Operation Black Echo [B01] in Mission Control. Initiate bypass parameters to begin.'",
                expression: 'talking',
                typingSpeed: 25
              }
            ]);
            return 4;
          }
          return prev + 1;
        });
      }, 1100);
      return () => clearInterval(interval);
    }
  }, [bootPhase, user, startDialogueSequence]);

  const handleNewOperator = async () => {
    if (!window.confirm("WARNING: Creating a new operator will wipe all achievements, XP, and secure connection hashes. Confirm neural wipe?")) return;
    try {
      const data = await resetProgress(token || '');
      // Sync local auth user context
      if (data && data.user) {
        login(data.user, token || '');
      }
      // Wipe local storage flags
      if (user) {
        localStorage.removeItem(`${user.id}_boot_played`);
      }
      // Trigger reboot crash
      setIsAudioReady(false);
      setBootPhase('power_loss');
      setBootTextIndex(0);
      setActiveLesson(null);
    } catch (err) {
      console.error("Failed to wipe progression database:", err);
    }
  };

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
    _setActiveTab('theory');
    if (activeLesson) {
      _setContractToReport(null); // Close report view when lesson selected
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
      _setContractToReport('Act I: The Reassembly');
      setActiveLesson(null);
    } else if (allMediatorCompleted && !mediatorReportSubmitted) {
      _setContractToReport('Act II: The Resonance');
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
  const _handleFulfillContract = (tierName: 'Act I: The Reassembly' | 'Act II: The Resonance' | 'Act III: The Core Breach') => {
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
    _setContractToReport(null);

    // Show completion animation overlay
    setBreachDetails({
      title: 'CONTRACT REPORT SUBMITTED',
      text: `Client AetherCorp secured. Badge awarded: ${badge} (+200 XP)`
    });
    setShowBreachOverlay(true);
    setTimeout(() => setShowBreachOverlay(false), 3000);
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
                          playUiClick();
                          setActiveLesson(lesson);
                          openWindow('terminal');
                          openWindow('lesson');
                          openWindow('ai_assistant');
                          
                          // Dynamic story briefing sequence trigger
                          const customScript = LESSON_CINEMATIC_SCRIPTS[lesson.id];
                          if (customScript) {
                            startDialogueSequence(customScript);
                          } else {
                            // Fallback parser from lesson.briefing
                            const text = lesson.briefing;
                            if (text.includes("HANDLER AURELIA:")) {
                              const cleanText = text.replace("HANDLER AURELIA:", "").replace(/'/g, "").trim();
                              startDialogueSequence([
                                {
                                  id: `${lesson.id}-brief-0`,
                                  speaker: 'aurelia',
                                  text: cleanText,
                                  expression: 'talking'
                                }
                              ]);
                            } else {
                              startDialogueSequence([
                                {
                                  id: `${lesson.id}-brief-0`,
                                  speaker: 'aurelia',
                                  text: text,
                                  expression: 'neutral'
                                }
                              ]);
                            }
                          }
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

  const renderBootOverlay = () => {
    if (bootPhase === 'completed' || bootPhase === 'terminal_only' || bootPhase === 'nmap_scan') return null;

    const savedUser = localStorage.getItem('user');
    let hasPlayed = false;
    if (savedUser && user) {
      hasPlayed = localStorage.getItem(`${user.id}_boot_played`) === 'true';
    }

    return (
      <div className="fixed inset-0 z-50 bg-[#06060a] flex flex-col items-center justify-center p-4 font-mono select-none overflow-hidden scanlines">
        {/* CRT glass reflection and scan lines */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />

        {/* Phase: Main Menu */}
        {bootPhase === 'main_menu' && (
          <div 
            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-20 relative p-6"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          >
            {/* Spinning vector HUD background */}
            <div className="absolute -inset-10 z-0 pointer-events-none opacity-10 flex items-center justify-center animate-[spin_120s_linear_infinite]">
              <svg className="w-[100vw] h-[100vw] text-primary" viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3, 9">
                <circle cx="250" cy="250" r="220" />
                <circle cx="250" cy="250" r="160" />
                <circle cx="250" cy="250" r="100" />
                <line x1="250" y1="0" x2="250" y2="500" />
                <line x1="0" y1="250" x2="500" y2="250" />
              </svg>
            </div>

            {/* Left Options Container */}
            <div className="md:col-span-5 space-y-8 flex flex-col justify-center relative z-10">
              <div className="space-y-2 border-l-2 border-primary pl-4">
                <h1 className="text-3xl font-bold tracking-widest text-shadow-neon text-primary uppercase">
                  PROJECT VEIL
                </h1>
                <p className="text-[9px] text-textMuted uppercase tracking-wider">
                  Secure Cognitive Command Grid // v8.12.92
                </p>
              </div>

              <nav className="flex flex-col gap-3">
                <button
                  disabled={!hasPlayed}
                  onClick={() => {
                    playUiClick();
                    // Play stabilizing hum
                    try {
                      initializeAudio();
                    } catch(e){}
                    setBootPhase('completed');
                  }}
                  className={`text-left px-4 py-3 border font-bold text-xs uppercase tracking-widest transition-all rounded font-mono ${
                    hasPlayed 
                      ? 'border-primary/40 text-primary hover:bg-primary/10 hover:border-primary cursor-pointer hover:shadow-neon' 
                      : 'border-white/5 text-textMuted cursor-not-allowed bg-white/2'
                  }`}
                >
                  {hasPlayed ? '[ CONTINUE ACTIVE INFILTRATION ]' : '[ CONTINUE (NO STABILIZED INDEX) ]'}
                </button>

                <button
                  onClick={() => { playUiClick(); handleNewOperator(); }}
                  className="text-left px-4 py-3 border border-secondary/40 text-secondary hover:bg-secondary/10 hover:border-secondary transition-all rounded font-bold text-xs uppercase tracking-widest cursor-pointer font-mono hover:shadow-neon"
                >
                  [ NEW OPERATOR CONTEXT ]
                </button>

                <button
                  onClick={() => {
                    playUiClick();
                    setActiveMenuPanel(activeMenuPanel === 'profile' ? 'none' : 'profile');
                  }}
                  className={`text-left px-4 py-3 border border-primary/20 text-textMain hover:bg-primary/5 hover:border-primary/45 transition-all rounded text-xs uppercase tracking-widest cursor-pointer font-mono ${
                    activeMenuPanel === 'profile' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  [ LOAD PROFILE ]
                </button>

                <button
                  onClick={() => {
                    playUiClick();
                    setActiveMenuPanel(activeMenuPanel === 'settings' ? 'none' : 'settings');
                  }}
                  className={`text-left px-4 py-3 border border-primary/20 text-textMain hover:bg-primary/5 hover:border-primary/45 transition-all rounded text-xs uppercase tracking-widest cursor-pointer font-mono ${
                    activeMenuPanel === 'settings' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  [ CONFIGURE ACCESS ]
                </button>

                <button
                  onClick={() => {
                    playUiClick();
                    setActiveMenuPanel(activeMenuPanel === 'credits' ? 'none' : 'credits');
                  }}
                  className={`text-left px-4 py-3 border border-primary/20 text-textMain hover:bg-primary/5 hover:border-primary/45 transition-all rounded text-xs uppercase tracking-widest cursor-pointer font-mono ${
                    activeMenuPanel === 'credits' ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  [ SYSTEM DIRECTORS ]
                </button>

                <button
                  onClick={() => { playUiClick(); _logout(); }}
                  className="text-left px-4 py-3 border border-error/20 text-error/80 hover:bg-error/10 hover:border-error transition-all rounded text-xs uppercase tracking-widest cursor-pointer font-mono"
                >
                  [ DOCK OUT (LOGOUT) ]
                </button>
              </nav>
            </div>

            {/* Right Display Area */}
            <div className="md:col-span-7 h-[420px] flex items-center justify-center bg-[#07070d]/50 border border-primary/10 rounded-lg p-6 relative overflow-hidden backdrop-blur-sm z-10">
              {activeMenuPanel === 'none' && (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-64 h-64 opacity-85 relative flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
                    <CharacterPortrait 
                      speaker="aurelia" 
                      expression="neutral" 
                      isTyping={false} 
                    />
                  </div>
                  <div className="text-[8px] text-textMuted uppercase tracking-[0.3em] text-center animate-pulse">
                    [ LINK STABILIZER CONNECTED // 127.0.0.1 ]
                  </div>
                </div>
              )}

              {activeMenuPanel === 'profile' && (
                <div className="w-full h-full flex flex-col justify-between font-mono text-[11px] leading-relaxed text-textMain space-y-4">
                  <div className="border-b border-primary/20 pb-2 flex justify-between items-center">
                    <span className="font-bold text-primary">// OPERATOR PROFILE CREDENTIALS</span>
                    <span className="text-[9px] text-textMuted">CLASS_B_SECURE</span>
                  </div>
                  
                  <div className="space-y-3 flex-grow pt-2">
                    <div className="grid grid-cols-3 border-b border-white/5 py-1">
                      <span className="text-textMuted uppercase font-bold">OPERATOR ALIAS:</span>
                      <span className="col-span-2 text-primary font-bold">{user?.username}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-white/5 py-1">
                      <span className="text-textMuted uppercase font-bold">CLEARANCE:</span>
                      <span className="col-span-2 text-secondary font-bold">LEVEL_{user?.level || 1}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-white/5 py-1">
                      <span className="text-textMuted uppercase font-bold">ACCUMULATED XP:</span>
                      <span className="col-span-2 text-primary font-bold">{user?.xp} XP</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-white/5 py-1">
                      <span className="text-textMuted uppercase font-bold">INTEGRITY HASH:</span>
                      <span className="col-span-2 text-shadow-neon text-primary overflow-hidden text-ellipsis whitespace-nowrap">0x7f4ea92b0c11d9f8e285aa{user?.id?.substring(0,6)}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-white/5 py-1">
                      <span className="text-textMuted uppercase font-bold">SYSTEM STAT:</span>
                      <span className="col-span-2 text-primary">SECURED LATTICE LINK</span>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 border border-primary/20 rounded text-[9.5px] leading-normal uppercase">
                    Aurelia notes: "Your telemetry history matches standard field directives, Fragment. Keep correlating vectors to ascend node protocols."
                  </div>
                </div>
              )}

              {activeMenuPanel === 'settings' && (
                <div className="w-full h-full flex flex-col justify-between font-mono text-[11px] leading-relaxed text-textMain space-y-4">
                  <div className="border-b border-primary/20 pb-2">
                    <span className="font-bold text-primary">// CONFIGURE OS ACCESS VARIABLES</span>
                  </div>
                  
                  <div className="space-y-4 flex-grow pt-2">
                    <div className="space-y-2">
                      <label className="text-textMuted uppercase font-bold block text-[10px]">1. Audio Soundscape Transmission</label>
                      <button
                        onClick={() => { playUiClick(); toggleMute(); }}
                        className={`w-full border py-2 rounded text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
                          isMuted 
                            ? 'border-error/40 text-error bg-error/5' 
                            : 'border-primary/30 text-primary bg-primary/5'
                        }`}
                      >
                        {isMuted ? '🔊 CURRENTLY MUTED (CLICK TO UNMUTE)' : '🔊 SOUND IS ACTIVE (CLICK TO MUTE)'}
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-textMuted uppercase font-bold block text-[10px]">2. Coherence Accent Theme</label>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="border border-primary text-primary bg-primary/10 text-center py-2.5 rounded text-[9px] uppercase font-bold cursor-pointer hover:bg-primary/20">Cyan</div>
                        <div className="border border-white/10 text-textMuted text-center py-2.5 rounded text-[9px] uppercase font-bold cursor-not-allowed bg-white/2">Amber</div>
                        <div className="border border-white/10 text-textMuted text-center py-2.5 rounded text-[9px] uppercase font-bold cursor-not-allowed bg-white/2">Green</div>
                        <div className="border border-white/10 text-textMuted text-center py-2.5 rounded text-[9px] uppercase font-bold cursor-not-allowed bg-white/2">Red</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 border border-primary/20 rounded text-[9px] uppercase leading-normal">
                    OS parameters initialized from config database. High frequency filtering is active.
                  </div>
                </div>
              )}

              {activeMenuPanel === 'credits' && (
                <div className="w-full h-full flex flex-col justify-between font-mono text-[11px] leading-relaxed text-textMain space-y-4">
                  <div className="border-b border-primary/20 pb-2">
                    <span className="font-bold text-primary">// DIRECTORS & TECH ARCHITECTS</span>
                  </div>
                  
                  <div className="space-y-3 flex-grow pt-2 select-none overflow-y-auto max-h-[220px] scrollbar-thin pr-2">
                    <div className="py-1 border-b border-white/5">
                      <div className="font-bold text-primary uppercase text-[9px]">Creative & UX Direction</div>
                      <div className="text-[11px]">Advanced Agentic Coding (Google Deepmind)</div>
                    </div>
                    <div className="py-1 border-b border-white/5">
                      <div className="font-bold text-primary uppercase text-[9px]">Narrative Architect & Writing</div>
                      <div className="text-[11px]">Creative Writers Sector // Project Veil Guilds</div>
                    </div>
                    <div className="py-1 border-b border-white/5">
                      <div className="font-bold text-primary uppercase text-[9px]">Engineering & Systems Compilation</div>
                      <div className="text-[11px]">Lattice Daemon Core compilers</div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 border border-primary/20 rounded text-[9px] uppercase leading-normal">
                    Thank you for entering Project Veil. Keep exploring, Fragment.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase: Click to calibrate link (Power Loss) */}
        {bootPhase === 'power_loss' && !isAudioReady && (
          <div 
            onClick={() => {
              initializeAudio();
              const { playBreathing, playStaticNoise } = useAudioStore.getState();
              playBreathing();
              playStaticNoise(0.015);
              setIsAudioReady(true);
              setBootPhase('power_loss');
            }}
            className="cursor-pointer text-[10px] text-primary animate-pulse tracking-widest text-shadow-neon uppercase border border-primary/20 bg-primary/5 px-6 py-4 rounded-lg hover:bg-primary/20 transition-all font-bold font-mono z-20"
          >
            [ Click to Calibrate Synaptic Link ]
          </div>
        )}

        {/* Phase: Automated Loading restored logs */}
        {bootPhase === 'restoring' && (
          <div className="space-y-6 font-mono text-left max-w-lg w-full bg-[#08080c]/95 border border-primary/30 p-8 rounded shadow-[0_0_40px_rgba(0,240,255,0.2)] z-20">
            <div className="flex justify-between items-center border-b border-primary/20 pb-2 text-[10px] text-primary">
              <span className="font-bold tracking-widest">// ALIGNING COGNITIVE INTERFACE</span>
              <span className="animate-pulse text-secondary">STABILIZING GRID ACCENTS...</span>
            </div>

            {/* Center Stabilizing Hologram */}
            <div className="h-44 w-full flex items-center justify-center">
              <div className="w-48 h-48">
                <CharacterPortrait 
                  speaker="aurelia" 
                  expression={restoreStep < 2 ? "glitch" : restoreStep < 3 ? "sad" : "neutral"} 
                  isTyping={false} 
                />
              </div>
            </div>

            <div className="space-y-1.5 text-[10px] text-textMuted select-none">
              <div className={restoreStep >= 0 ? "text-primary" : ""}>
                {restoreStep >= 0 ? "✔ INITIALIZING COGNITIVE LATTICE CHANNELS" : "☐ INITIALIZING COGNITIVE LATTICE CHANNELS..."}
              </div>
              <div className={restoreStep >= 1 ? "text-primary" : ""}>
                {restoreStep >= 1 ? "✔ ALIGNING NETWORK SYNC TELEMETRY" : restoreStep === 0 ? "⏱ ALIGNING NETWORK SYNC TELEMETRY..." : "☐ ALIGNING NETWORK SYNC TELEMETRY"}
              </div>
              <div className={restoreStep >= 2 ? "text-primary" : ""}>
                {restoreStep >= 2 ? "✔ CORRELATING INCIDENT LOG VECTOR SHARDS" : restoreStep === 1 ? "⏱ CORRELATING INCIDENT LOG VECTOR SHARDS..." : "☐ CORRELATING INCIDENT LOG VECTOR SHARDS"}
              </div>
              <div className={restoreStep >= 3 ? "text-primary" : ""}>
                {restoreStep >= 3 ? "✔ ESTABLISHING ENCRYPTED COMPANION CHANNEL" : restoreStep === 2 ? "⏱ ESTABLISHING ENCRYPTED COMPANION CHANNEL..." : "☐ ESTABLISHING ENCRYPTED COMPANION CHANNEL"}
              </div>
            </div>

            {/* Stabilizing bar */}
            <div className="h-1.5 bg-primary/10 border border-primary/20 rounded relative overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${(restoreStep + 1) * 20}%` }}
              />
            </div>
          </div>
        )}

        {isAudioReady && bootPhase !== 'main_menu' && bootPhase !== 'restoring' && (
          <div className="w-full max-w-xl text-center space-y-6 select-none relative z-20">
            {bootPhase === 'power_loss' && (
              <div className="text-[10px] text-textMuted uppercase tracking-widest animate-pulse font-mono">
                Establishing consciousness socket connection...
              </div>
            )}

            {bootPhase === 'voice_crack' && (
              <div className="space-y-4 font-mono flex flex-col items-center">
                <div className="text-[10px] text-secondary tracking-widest font-bold uppercase">// COMM LINK: UNSTABLE</div>
                
                {/* Centered Large-size glitched hologram of Aurelia */}
                <div className="w-72 h-72 relative flex items-center justify-center animate-[flicker_0.15s_infinite]">
                  <CharacterPortrait 
                    speaker="aurelia" 
                    expression="glitch" 
                    isTyping={true} 
                  />
                </div>

                <div className="text-xs text-primary leading-relaxed h-12 flex items-center justify-center font-mono">
                  {bootTextIndex === 0 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      AURELIA: "...hello...?"
                    </motion.span>
                  )}
                  {bootTextIndex === 1 && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      AURELIA: "...please don't leave me alone..."
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
              <div className="space-y-6 font-mono flex flex-col items-center">
                <motion.h2 
                  animate={{ scale: [1, 1.05, 0.95, 1.02, 1], skewX: [0, 8, -8, 4, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
                  className="text-3xl font-bold text-error tracking-widest text-shadow-neon uppercase font-mono animate-[glitch-shake_0.6s_infinite]"
                >
                  SYSTEM FAILURE
                </motion.h2>
                <div className="h-[1px] bg-error/30 w-44 mx-auto" />
                
                {/* Centered Large-size glitched hologram of Aurelia */}
                <div className="w-72 h-72 relative flex items-center justify-center animate-[glitch-shake_0.6s_infinite]">
                  <CharacterPortrait 
                    speaker="aurelia" 
                    expression="glitch" 
                    isTyping={false} 
                  />
                </div>

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
                      setBootPhase('restoring');
                      setRestoreStep(0);
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

  // Keep references to satisfy noUnusedLocals compiler check
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    console.log(_handleQuickQuery, _handleSendChatMessage, _getEstTime, _handleFulfillContract, _activeTab, _contractToReport, _chatMessages, _chatInput, _isTyping, _SectorMap, _TapeDecryptor);
  }

  return (
    <div className="min-h-screen bg-background text-primary flex flex-row font-mono relative overflow-hidden select-none scanlines">
      
      {/* 3D WebGL Canvas Layer (React Three Fiber) */}
      {bootPhase === 'completed' && (
        <HologramCanvas3D 
          speaker={(activeSpeaker as any) || 'aurelia'}
          expression={activeExpression || 'neutral'}
          isTyping={isTextTyping}
        />
      )}

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

        <AnimatePresence>
          {renderBootOverlay()}
        </AnimatePresence>

        {bootPhase === 'completed' && (
          <header className={`h-16 bg-[#07070c]/90 border-b border-primary/20 flex items-center justify-between px-8 z-40 select-none shrink-0 shadow-neon transition-opacity duration-700 ${isSequencePlaying ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center border border-primary/30 rounded-lg bg-primary/5 mr-2">
                <svg className="w-5 h-5 text-primary animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6">
                  <polygon points="50,15 85,75 15,75" />
                  <circle cx="50" cy="55" r="10" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-shadow-neon text-primary tracking-widest uppercase flex items-center gap-2">
                  PROJECT VEIL
                </h1>
                <div className="text-[8px] text-textMuted font-bold uppercase tracking-widest">
                  AETHER PROTOCOL INTERFACE
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { playUiClick(); toggleMute(); }}
                  className={`border px-2.5 py-1 rounded transition-all text-[8px] uppercase font-bold tracking-wider cursor-pointer ${
                    isMuted 
                      ? 'border-error/40 text-error hover:bg-error/10' 
                      : 'border-primary/30 text-primary hover:bg-primary/10'
                  }`}
                >
                  {isMuted ? '🔇 Audio Muted' : '🔊 Audio On'}
                </button>
                
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="border border-primary/30 text-primary hover:bg-primary hover:text-background px-2.5 py-1 rounded transition-all text-[8px] uppercase font-bold tracking-wider cursor-pointer"
                >
                  Guidebook
                </button>
              </div>

              <div className="text-right font-mono text-[9px] border-l border-primary/10 pl-6 flex items-center gap-4">
                <div className="space-y-0.5">
                  <div className="text-textMuted uppercase">Operator: <span className="text-primary font-bold">{user?.username || 'FRAGMENT'}</span></div>
                  <div className="text-textMuted uppercase">Clearance: <span className="text-secondary font-bold">LEVEL_{user?.level || 1} ({user?.level && user.level > 2 ? 'Specialist' : 'Novice'})</span></div>
                  <div className="text-textMuted uppercase">Trust Level: <span className="text-primary font-bold">{Math.min(100, Math.round(((user?.xp || 0) % 500) / 5))}%</span></div>
                </div>
                <div className="w-7 h-7 rounded border border-primary/20 bg-primary/5 flex items-center justify-center text-[10px]">
                  👤
                </div>
              </div>
            </div>
          </header>
        )}

        {bootPhase === 'completed' ? (
          <main className="flex-grow w-full relative overflow-hidden bg-[#040406] select-text flex flex-row p-4 gap-4">
            
            <div className={`w-[27%] min-w-[340px] max-w-[400px] flex flex-col gap-4 transition-all duration-700 ease-in-out ${isSequencePlaying ? 'opacity-15 scale-95 blur-[1.5px] pointer-events-none' : 'opacity-100 scale-100'}`}>
              
              {leftPanelMode === 'missions' ? (
                <div className="flex-grow bg-[#07070c]/80 border border-primary/20 rounded-lg p-4 flex flex-col overflow-hidden backdrop-blur-md shadow-inner relative z-10">
                  {renderCurriculumWindowContent()}
                </div>
              ) : (
                <>
                  {activeLesson ? (
                    <div className="bg-[#07070a]/90 border border-primary/20 rounded-lg p-4 flex flex-col gap-3 font-mono shrink-0 shadow-inner">
                      <div className="flex justify-between items-center border-b border-primary/20 pb-2">
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">// ACTIVE OPERATION</span>
                        <span className="text-[8.5px] text-secondary font-bold px-1.5 py-0.5 rounded border border-secondary/20 bg-secondary/5">{activeLesson.id}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-textMain uppercase">{activeLesson.title}</h4>
                        <p className="text-[8.5px] text-textMuted uppercase tracking-wider">{activeLesson.technique}</p>
                      </div>

                      <div className="text-[9px] text-textMuted leading-relaxed border-t border-primary/10 pt-2 h-20 overflow-y-auto pr-1 scrollbar">
                        {activeLesson.theory}
                      </div>

                      <div className="border-t border-primary/10 pt-2">
                        <div className="text-[8.5px] font-bold text-primary tracking-wider uppercase mb-1.5">OBJECTIVES:</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[9px] text-textMain font-mono">
                            <span className="text-success font-bold">✓</span>
                            <span className="text-textMuted">Calibrated Synaptic Connection</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-textMain font-mono">
                            <span className={completedLessons.has(activeLesson.id) ? 'text-success font-bold' : 'text-primary font-bold animate-pulse'}>
                              {completedLessons.has(activeLesson.id) ? '✓' : '[]'}
                            </span>
                            <span className={completedLessons.has(activeLesson.id) ? 'text-textMuted line-through' : 'text-textMain'}>
                              Harvest Substation Flag
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#07070a]/90 border border-primary/20 rounded-lg p-4 flex flex-col justify-center items-center text-center font-mono h-48 shrink-0">
                      <span className="text-primary text-base mb-2 animate-bounce">🛰️</span>
                      <p className="text-[9px] text-textMuted uppercase tracking-widest leading-relaxed">
                        No active target loaded.<br />Select a node on the Missions board to deploy.
                      </p>
                    </div>
                  )}

                  <div className="flex-grow bg-[#07070a]/90 border border-primary/20 rounded-lg overflow-hidden relative shadow-inner flex flex-col">
                    <div className="h-8 bg-[#09090f] border-b border-primary/15 flex items-center justify-between px-3 select-none shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        <span className="text-[8px] font-bold text-textMuted tracking-wider uppercase">TERMINAL SHIELD SHELL</span>
                      </div>
                      <span className="text-[8px] text-primary/40 font-bold uppercase">PORTAL_v2.0</span>
                    </div>
                    
                    <div className="flex-grow min-h-0 relative">
                      <Terminal 
                        activeLesson={activeLesson}
                        onSuccess={(flag) => handleVerifyFlag(flag)}
                        onFailure={() => handleTerminalFailure()}
                        completed={activeLesson ? completedLessons.has(activeLesson.id) : false}
                        width={380}
                        height={400}
                        onCommand={(cmd) => {
                          if (cmd === 'discover_curriculum') {
                            setLeftPanelMode('missions');
                          } else if (cmd === 'discover_conspiracy') {
                            setRightPanelMode('intel');
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={`flex-grow flex flex-col justify-between items-center transition-all duration-700 ease-in-out px-4 py-2 relative z-20 ${isSequencePlaying ? 'scale-105 translate-y-3' : 'scale-100'}`}>
              
              <div className="w-full flex justify-between items-center text-[7.5px] font-mono text-primary/40 select-none tracking-widest uppercase border-b border-primary/5 pb-2 shrink-0">
                <span>COORD LATTICE: LINKED</span>
                <span>SEC_ZERO_POD // v2.6</span>
                <span>FREQUENCY REFRACTION: 98.2%</span>
              </div>

              <div className="flex-grow w-full flex items-center justify-center relative overflow-visible min-h-[300px]">
                
                <div className="relative w-64 h-64 flex items-center justify-center overflow-visible">
                  
                  <div className="w-56 h-56 transition-all duration-500 ease-out z-10 relative">
                    <CharacterPortrait 
                      speaker={(activeSpeaker as any) || 'aurelia'} 
                      expression={activeExpression || 'neutral'} 
                      isTyping={isTextTyping} 
                    />
                  </div>

                  {activeCoSpeaker && (
                    <div className="w-40 h-40 absolute -right-16 top-6 opacity-35 blur-[0.6px] scale-90 z-0 pointer-events-none transition-all duration-500 animate-[flicker_0.12s_infinite]">
                      <CharacterPortrait 
                        speaker={activeCoSpeaker as any} 
                        expression={activeCoExpression || 'neutral'} 
                        isTyping={false} 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full max-w-xl shrink-0 mt-4">
                <DialogueFeed activeLesson={activeLesson} />
              </div>
            </div>

            <div className={`w-[27%] min-w-[340px] max-w-[400px] flex flex-col gap-4 transition-all duration-700 ease-in-out ${isSequencePlaying ? 'opacity-15 scale-95 blur-[1.5px] pointer-events-none' : 'opacity-100 scale-100'}`}>
              
              {rightPanelMode === 'intel' ? (
                <div className="flex-grow bg-[#07070c]/80 border border-primary/20 rounded-lg p-0 flex flex-col overflow-hidden backdrop-blur-md shadow-inner relative z-10">
                  <div className="h-8 bg-[#09090f] border-b border-primary/15 flex items-center justify-between px-3 select-none shrink-0">
                    <span className="text-[8px] font-bold text-primary tracking-wider">🕸️ CONSPIRACY BOARD LOGS</span>
                    <button 
                      onClick={() => setRightPanelMode('status')} 
                      className="text-textMuted hover:text-primary text-[8px] font-bold uppercase transition-colors"
                    >
                      [ Close ]
                    </button>
                  </div>
                  <div className="flex-grow overflow-hidden relative">
                    <ConspiracyBoard completedLessons={completedLessons} />
                  </div>
                </div>
              ) : rightPanelMode === 'upgrades' ? (
                <div className="flex-grow bg-[#07070c]/80 border border-primary/20 rounded-lg p-4 flex flex-col overflow-hidden backdrop-blur-md shadow-inner relative z-10 font-mono text-xs text-textMain space-y-4">
                  <div className="flex justify-between items-center border-b border-primary/25 pb-2">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">🎖️ OPERATOR COMMAND CHECKS</span>
                    <button onClick={() => setRightPanelMode('status')} className="text-textMuted hover:text-primary text-[8px] font-bold">[ Close ]</button>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar">
                    <div className="text-[9.5px] text-textMuted leading-relaxed uppercase">Earned achievements clearing system sector vulnerabilities:</div>
                    {badges.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {badges.map((b, i) => (
                          <div key={i} className="border border-primary/20 bg-primary/5 p-2 rounded flex justify-between items-center">
                            <span>🎖️ {b}</span>
                            <span className="text-[8px] text-success font-bold">CLEAR</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="italic text-textMuted text-[9px] py-4 text-center">No commendations secured on the active lattice yet. Complete Act modules to level up.</div>
                    )}
                  </div>
                </div>
              ) : rightPanelMode === 'config' ? (
                <div className="flex-grow bg-[#07070c]/80 border border-primary/20 rounded-lg p-4 flex flex-col overflow-hidden backdrop-blur-md shadow-inner relative z-10 font-mono text-xs text-textMain space-y-4">
                  <div className="flex justify-between items-center border-b border-primary/25 pb-2">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">⚙️ HUD CONFIGURATION</span>
                    <button onClick={() => setRightPanelMode('status')} className="text-textMuted hover:text-primary text-[8px] font-bold">[ Close ]</button>
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] text-textMuted uppercase font-bold">Accent Color Scheme:</span>
                      <div className="grid grid-cols-4 gap-2">
                        {['cyan', 'amber', 'green', 'red'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setCurrentTheme(t as any)}
                            className={`py-1 text-[8.5px] uppercase font-bold border rounded transition-all ${
                              currentTheme === t
                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                                : 'bg-[#171721]/30 border-primary/10 text-textMuted hover:border-primary/30'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-primary/10">
                      <span className="text-[8.5px] text-textMuted uppercase font-bold">OS Sound System:</span>
                      <button 
                        onClick={() => { playUiClick(); toggleMute(); }}
                        className={`w-full py-1.5 rounded border transition-all text-[9px] uppercase font-bold ${
                          isMuted ? 'border-error/40 text-error bg-error/5' : 'border-primary/30 text-primary bg-primary/5 shadow-neon'
                        }`}
                      >
                        {isMuted ? '🔇 Audio Status: Offline' : '🔊 Audio Status: Online'}
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-primary/10">
                      <span className="text-[8.5px] text-textMuted uppercase font-bold">Link Calibration Utility:</span>
                      <button
                        onClick={() => {
                          playUiClick();
                          if (user?.id) {
                            localStorage.removeItem(`${user.id}_boot_played`);
                            localStorage.removeItem(`${user.id}_intro_played`);
                          }
                          Object.keys(windows).forEach(id => {
                            if (id !== 'terminal') closeWindow(id);
                          });
                          openWindow('terminal');
                          setBootPhase('power_loss');
                          setIsAudioReady(false);
                          setBootTextIndex(0);
                        }}
                        className="w-full py-1.5 rounded border border-error/30 hover:bg-error/10 text-error text-[9px] uppercase font-bold transition-all animate-pulse cursor-pointer"
                      >
                        ⚡ Cold Reboot Linkage
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-[#07070a]/90 border border-primary/20 rounded-lg p-4 flex flex-col overflow-hidden relative shadow-inner flex-grow">
                    <div className="flex justify-between items-center border-b border-primary/20 pb-2 mb-2 select-none">
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase">// AETHER COMM FEED</span>
                      <span className="text-[7.5px] text-success font-bold uppercase tracking-widest">LIVE CONNECTION</span>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar flex flex-col-reverse">
                      <div className="flex flex-col gap-2">
                        {messageHistory.slice(-10).map((msg, i) => (
                          <div key={i} className="text-[9.5px] font-mono leading-relaxed space-y-0.5 border-b border-primary/5 pb-2">
                            <div className="flex justify-between text-[8px] select-none opacity-50">
                              <span className="font-bold uppercase tracking-wider text-secondary">
                                // {msg.sender.toUpperCase()}
                              </span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="text-textMain whitespace-pre-wrap select-text pr-1">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#07070a]/90 border border-primary/20 rounded-lg p-4 flex flex-col gap-3 font-mono shrink-0 shadow-inner">
                    <div className="flex justify-between items-center border-b border-primary/20 pb-2 select-none">
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase">// SYSTEM STATUS</span>
                      <span className="text-[8px] text-secondary font-bold uppercase">REF_SHIELD_OS</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] uppercase tracking-wider text-textMuted font-bold">
                          <span>Veil Coherence Integrity</span>
                          <span className="text-primary">
                            {Math.round((completedLessons.size / (curriculum?.tiers.reduce((acc, t) => acc + t.modules.length, 0) || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-background border border-primary/25 rounded overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] transition-all duration-700" 
                            style={{ width: `${(completedLessons.size / (curriculum?.tiers.reduce((acc, t) => acc + t.modules.length, 0) || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-primary/10 pt-2 text-[9px] uppercase tracking-wider text-textMuted select-none">
                        <span>Lattice Threat Sweep</span>
                        <span className={`font-bold animate-pulse text-shadow-neon ${activeLesson && ['B08', 'M08', 'A07'].includes(activeLesson.id) ? 'text-error' : activeLesson ? 'text-secondary' : 'text-success'}`}>
                          {activeLesson && ['B08', 'M08', 'A07'].includes(activeLesson.id) ? 'CRITICAL COMBAT' : activeLesson ? 'ELEVATED TENSION' : 'STANDBY EXPLORATION'}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-primary/10">
                        <div className="flex justify-between text-[8px] uppercase tracking-wider text-textMuted font-bold">
                          <span>Refraction Stability</span>
                          <span className="text-secondary">74%</span>
                        </div>
                        <div className="h-1.5 bg-background border border-primary/25 rounded overflow-hidden">
                          <div className="h-full bg-secondary shadow-[0_0_6px_rgba(217,70,239,0.5)] w-[74%] animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </main>
        ) : (
          <div className="flex-grow flex items-center justify-center bg-[#07070a] text-center text-textMuted font-mono uppercase text-[10px] select-none scanlines">
            No active session context established. Syncing interface variables...
          </div>
        )}

        <div className={`fixed left-0 right-0 top-0 h-10 bg-black z-50 border-b border-primary/20 pointer-events-none transition-transform duration-700 ease-in-out ${isSequencePlaying ? 'translate-y-0' : '-translate-y-full'}`} />
        <div className={`fixed left-0 right-0 bottom-0 h-10 bg-black z-50 border-t border-primary/20 pointer-events-none transition-transform duration-700 ease-in-out ${isSequencePlaying ? 'translate-y-0' : 'translate-y-full'}`} />

        {bootPhase === 'completed' && (
          <footer className={`h-12 bg-[#06060a]/95 border-t border-primary/20 flex items-center justify-between px-6 z-40 select-none shrink-0 shadow-neon transition-opacity duration-700 ${isSequencePlaying ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playUiClick(); setRightPanelMode(rightPanelMode === 'config' ? 'status' : 'config'); }}
                className="flex items-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 px-3 py-1.5 rounded text-[8px] font-bold text-primary uppercase tracking-widest transition-all cursor-pointer font-mono shadow-inner"
              >
                <span>⚙️</span> OS Config
              </button>
              
              <div className="h-4 w-[1px] bg-primary/20 mx-1"></div>

              <div className="flex items-center gap-2 font-mono">
                <button
                  onClick={() => { playUiClick(); setLeftPanelMode('terminal'); }}
                  className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider transition-all border ${
                    leftPanelMode === 'terminal'
                      ? 'bg-primary/25 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'bg-transparent border-primary/10 text-textMuted hover:border-primary/30 hover:text-textMain'
                  }`}
                >
                  📺 Active Console
                </button>
                <button
                  onClick={() => { playUiClick(); setLeftPanelMode('missions'); }}
                  className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider transition-all border ${
                    leftPanelMode === 'missions'
                      ? 'bg-primary/25 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'bg-transparent border-primary/10 text-textMuted hover:border-primary/30 hover:text-textMain'
                  }`}
                >
                  🛰️ Mission Control
                </button>
                <button
                  onClick={() => { playUiClick(); setRightPanelMode(rightPanelMode === 'intel' ? 'status' : 'intel'); }}
                  className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider transition-all border ${
                    rightPanelMode === 'intel'
                      ? 'bg-secondary/25 border-secondary text-secondary font-bold shadow-[0_0_8px_rgba(217,70,239,0.2)]'
                      : 'bg-transparent border-primary/10 text-textMuted hover:border-primary/30 hover:text-textMain'
                  }`}
                >
                  🕸️ Conspiracy Board
                </button>
                <button
                  onClick={() => { playUiClick(); setRightPanelMode(rightPanelMode === 'upgrades' ? 'status' : 'upgrades'); }}
                  className={`px-3 py-1 rounded text-[8.5px] font-bold uppercase tracking-wider transition-all border ${
                    rightPanelMode === 'upgrades'
                      ? 'bg-primary/25 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'bg-transparent border-primary/10 text-textMuted hover:border-primary/30 hover:text-textMain'
                  }`}
                >
                  🎖️ Commendations
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[9px] text-textMuted select-none font-mono">
              <span className="hidden sm:inline">SECURE SIGNAL CLEAR // LATTICE LINK STABILIZED</span>
              <span className="hidden sm:inline">|</span>
              <span className="text-primary font-bold tracking-wider">{timeStr}</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
