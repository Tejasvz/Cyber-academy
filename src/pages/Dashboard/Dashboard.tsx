import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Terminal from '../../components/Terminal/Terminal';
import { fetchCurriculum, type Curriculum, type Lesson } from '../../services/curriculumService';
import { completeLesson, fetchProgress } from '../../services/progressService';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, token, logout, login } = useAuth();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Gameplay & tab states
  const [activeMenu, setActiveMenu] = useState<'home' | 'syllabus' | 'dossier' | 'workspace'>('home');
  const [useFloatingWindows, setUseFloatingWindows] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'sandbox' | 'blueteam' | 'remediation'>('theory');
  const [flagInput, setFlagInput] = useState('');
  const [flagError, setFlagError] = useState('');

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

  // Floating, draggable, resizable windows state
  const [windows, setWindows] = useState<{
    [key: string]: {
      id: string;
      title: string;
      isOpen: boolean;
      isMinimized: boolean;
      isMaximized: boolean;
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>({
    terminal: {
      id: 'terminal',
      title: 'Terminal Console - operator@cyber-academy',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 30,
      y: 30,
      width: 730,
      height: 440,
    },
    curriculum: {
      id: 'curriculum',
      title: 'Mission Control [Active Curriculum]',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 780,
      y: 30,
      width: 370,
      height: 480,
    },
    lesson: {
      id: 'lesson',
      title: 'Operator Database [Lesson Details]',
      isOpen: false, // Hidden until active lesson is selected
      isMinimized: false,
      isMaximized: false,
      x: 30,
      y: 500,
      width: 1120,
      height: 400,
    },
    ai_assistant: {
      id: 'ai_assistant',
      title: 'Tactical OS Daemon: Aurelia',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 780,
      y: 520,
      width: 370,
      height: 380,
    },
  });

  const [windowOrder, setWindowOrder] = useState<string[]>(['curriculum', 'terminal', 'lesson', 'ai_assistant']);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [timeStr, setTimeStr] = useState('');

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

  const getNextLesson = (): Lesson | null => {
    if (!curriculum) return null;
    for (const tier of curriculum.tiers) {
      for (const lesson of tier.modules) {
        if (!completedLessons.has(lesson.id)) {
          return lesson;
        }
      }
    }
    return null;
  };

  // Show onboarding guide for first-time operators
  useEffect(() => {
    if (!loading && user && user.xp === 0 && completedLessons.size === 0) {
      setShowOnboarding(true);
    }
  }, [loading, user, completedLessons.size]);

  // Window helper controls
  const bringToFront = (id: string) => {
    setWindowOrder(prev => {
      const filtered = prev.filter(wId => wId !== id);
      return [...filtered, id];
    });
  };

  const openWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
      }
    }));
    bringToFront(id);
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => {
      const nextMin = !prev[id].isMinimized;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          isMinimized: nextMin,
        }
      };
    });
    // If we're opening it, bring it to front
    if (windows[id].isMinimized) {
      bringToFront(id);
    }
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id].isMaximized,
      }
    }));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
      }
    }));
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

  // Reset lesson flag input and tab selection
  useEffect(() => {
    setFlagInput('');
    setFlagError('');
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
    
    const sanitizedFlag = inputFlag.trim();
    if (!sanitizedFlag) {
      setFlagError('Enter a flag to submit.');
      return;
    }

    try {
      const data = await completeLesson(activeLesson.id, sanitizedFlag, token);
      setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
      setFlagError('');
      setFlagInput('');
      
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
      const errMsg = error.response?.data?.error || 'INCORRECT FLAG. Analyze outputs or try command again.';
      setFlagError(errMsg);
      setTimeout(() => setFlagError(''), 4500);
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
    id: 'terminal' | 'curriculum' | 'lesson' | 'ai_assistant',
    content: React.ReactNode
  ) => {
    const win = windows[id];
    if (!win.isOpen) return null;

    const isActive = windowOrder[windowOrder.length - 1] === id;
    const zIndex = 10 + windowOrder.indexOf(id);

    return (
      <div
        key={id}
        style={{
          position: 'absolute',
          left: win.isMaximized ? 0 : `${win.x}px`,
          top: win.isMaximized ? 0 : `${win.y}px`,
          width: win.isMaximized ? '100%' : `${win.width}px`,
          height: win.isMaximized ? '100%' : `${win.height}px`,
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
            // Ignore mouse down on control buttons
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
              
              setWindows(prev => ({
                ...prev,
                [id]: {
                  ...prev[id],
                  x: Math.max(0, Math.min(window.innerWidth - 100, initialX + deltaX)),
                  y: Math.max(0, Math.min(window.innerHeight - 150, initialY + deltaY)),
                }
              }));
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
              onClick={() => toggleMinimize(id)}
              className="window-control-btn w-5 h-5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors text-[9px] font-mono"
              title="Minimize"
            >
              _
            </button>
            <button
              onClick={() => toggleMaximize(id)}
              className="window-control-btn w-5 h-5 rounded bg-primary/10 border border-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors text-[9px] font-mono"
              title={win.isMaximized ? "Restore" : "Maximize"}
            >
              {win.isMaximized ? "⧉" : "▢"}
            </button>
            <button
              onClick={() => closeWindow(id)}
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

                setWindows(prev => ({
                  ...prev,
                  [id]: {
                    ...prev[id],
                    width: Math.max(350, initialWidth + deltaX),
                    height: Math.max(250, initialHeight + deltaY),
                  }
                }));
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
                <div className="space-y-2 text-xs">
                  <h3 className="text-secondary font-bold text-[10px] uppercase tracking-wider select-none">[CONCEPT THEORETICS]</h3>
                  <p className="text-textMain leading-relaxed text-xs">{activeLesson.theory}</p>
                </div>
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
                <motion.div 
                  animate={flagError ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex flex-col md:flex-row items-center gap-3"
                >
                  <div className="flex-grow flex flex-col gap-1 w-full">
                    <div className="flex justify-between items-center select-none">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-secondary">Submit Target Flag</label>
                      {flagError && (
                        <span className="text-[10px] text-error font-bold">{flagError}</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => {
                        setFlagInput(e.target.value);
                        if (flagError) setFlagError('');
                      }}
                      placeholder="flag{...}"
                      className="w-full bg-background border border-primary/30 rounded px-3 py-1.5 text-primary font-mono text-xs focus:outline-none focus:border-primary shadow-inner font-mono text-xs"
                    />
                  </div>
                  <button
                    onClick={() => handleVerifyFlag(flagInput)}
                    className="w-full md:w-auto bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-background px-6 py-2 rounded font-bold uppercase tracking-widest transition-all text-[10px] self-end shrink-0 shadow-neon"
                  >
                    SUBMIT FLAG
                  </button>
                </motion.div>
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
          <div className="relative w-8 h-8 flex items-center justify-center bg-primary/10 border border-primary/30 rounded-full shrink-0">
            <span className="text-primary font-bold text-xs animate-pulse">AU</span>
            <span className="absolute inset-0 border border-primary/30 rounded-full animate-ping opacity-20"></span>
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

  return (
    <div className="min-h-screen bg-background text-primary flex flex-row font-mono relative overflow-hidden select-none scanlines">
      
      {/* Compact Cyber-OS Sidebar Rail */}
      <aside className="w-16 md:w-20 bg-surface/95 border-r border-primary/20 flex flex-col items-center justify-between py-6 shrink-0 z-40 select-none shadow-[5px_0_15px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Main Logo icon */}
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary flex items-center justify-center font-bold text-shadow-neon text-primary animate-pulse select-none cursor-pointer hover:bg-primary/20 transition-colors" title="Cyber Academy OS" onClick={() => setActiveMenu('home')}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="w-8 h-[1px] bg-primary/20"></div>

          {/* Navigation Toggles */}
          <button
            onClick={() => setActiveMenu('home')}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border ${
              activeMenu === 'home' 
                ? 'bg-primary/20 text-primary border-primary/45 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-textMuted border-transparent'
            }`}
          >
            <span className="text-base">🏡</span>
            <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Home</span>
            <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
              Mission Control
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('syllabus')}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border ${
              activeMenu === 'syllabus' 
                ? 'bg-primary/20 text-primary border-primary/45 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-textMuted border-transparent'
            }`}
          >
            <span className="text-base">🛰️</span>
            <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Syllabus</span>
            <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
              Missions & Tiers
            </span>
          </button>

          <button
            onClick={() => setActiveMenu('dossier')}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border ${
              activeMenu === 'dossier' 
                ? 'bg-primary/20 text-primary border-primary/45 shadow-[0_0_10px_rgba(0,240,255,0.2)]' 
                : 'text-textMuted border-transparent'
            }`}
          >
            <span className="text-base">🔍</span>
            <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Dossier</span>
            <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
              Operator Dossier
            </span>
          </button>

          {activeLesson && (
            <button
              onClick={() => setActiveMenu('workspace')}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-primary/10 hover:text-primary transition-all group relative border ${
                activeMenu === 'workspace' 
                  ? 'bg-primary/25 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,240,255,0.35)] font-bold' 
                  : 'text-secondary border-transparent animate-pulse'
              }`}
            >
              <span className="text-base">⚡</span>
              <span className="text-[7.5px] font-bold uppercase tracking-wider scale-90">Sandbox</span>
              <span className="absolute left-14 bg-surface border border-primary/30 text-primary text-[8px] font-bold uppercase py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-50 whitespace-nowrap shadow-neon">
                Active Workspace
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-8 h-[1px] bg-primary/20"></div>
          
          <button
            onClick={() => setShowOnboarding(true)}
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
                className="bg-surface border border-primary p-6 rounded-lg max-w-2xl w-full shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-6 font-mono text-textMain"
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
                    onClick={() => setShowOnboarding(false)}
                    className="bg-primary text-background hover:bg-transparent hover:text-primary hover:border-primary border border-transparent font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-all text-xs shadow-neon font-mono"
                  >
                    [ Initialize Interface ]
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* OS Header (Unified Menu Bar) */}
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
            onClick={() => setShowOnboarding(true)}
            className="border border-primary/30 text-primary hover:bg-primary hover:text-background px-3 py-1.5 rounded transition-all text-[10px] uppercase font-bold tracking-wider"
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

      <main 
        className="flex-grow w-full relative overflow-hidden bg-background select-text"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 240, 255, 0.06) 1px, transparent 1px), 
                            linear-gradient(to right, rgba(0, 240, 255, 0.02) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(0, 240, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      >
        {activeMenu === 'home' && (
          <div className="p-6 h-full overflow-y-auto max-w-7xl mx-auto space-y-6 select-none scrollbar">
            {/* Operator Briefing Welcome Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/50 border border-primary/20 p-5 rounded-lg backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.05)]">
              <div>
                <h2 className="text-sm font-bold text-shadow-neon text-primary tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                  Directive: Operator Sync Established
                </h2>
                <p className="text-textMuted text-[10px] mt-1 uppercase">Logged secure alias node: {user?.username} // Access privilege: LEVEL_{user?.level}</p>
              </div>
              
              {/* Dynamic XP Progress Bar */}
              <div className="w-full md:w-72">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider mb-1">
                  <span className="text-textMuted">System Training Sync</span>
                  <span className="text-primary">{user?.xp} / {(user?.level || 1) * 1000} XP</span>
                </div>
                <div className="h-2 bg-background border border-primary/20 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-neon transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((user?.xp || 0) / ((user?.level || 1) * 1000)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Home Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Primary CTA & Syllabus Progress */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Primary CTA Mission Card */}
                {getNextLesson() ? (
                  <div className="relative overflow-hidden bg-gradient-to-br from-surface to-background border-2 border-primary/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] bg-primary/10 border border-primary/30 px-2.5 py-1 rounded text-primary font-bold uppercase tracking-widest animate-pulse">
                        ✦ Direct Threat Node Identified
                      </span>
                      <span className="text-[9px] text-textMuted uppercase font-bold tracking-wider">
                        Estimate: {getEstTime(getNextLesson()?.id || '')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-textMain uppercase tracking-widest leading-snug group-hover:text-primary transition-colors">
                      {getNextLesson()?.id}: {getNextLesson()?.title}
                    </h3>
                    <p className="text-textMuted text-xs mt-2 leading-relaxed max-w-2xl select-text">
                      {getNextLesson()?.lab}
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-primary/10 pt-5">
                      <button
                        onClick={() => {
                          const next = getNextLesson();
                          if (next) {
                            setActiveLesson(next);
                            setActiveMenu('workspace');
                          }
                        }}
                        className="w-full sm:w-auto bg-primary text-background hover:bg-transparent hover:text-primary border border-transparent hover:border-primary font-bold py-3 px-8 rounded-lg uppercase tracking-wider transition-all text-xs shadow-neon font-mono"
                      >
                        [ Begin Next Mission ]
                      </button>
                      <span className="text-[9px] text-textMuted uppercase font-bold tracking-widest">
                        Objective reward: +100 XP & Telemetry Decryption
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0d0d12]/60 border border-success/30 rounded-xl p-6 text-center space-y-4">
                    <div className="text-success text-2xl">🏆</div>
                    <h3 className="text-base font-bold text-success uppercase tracking-widest">All Core Training Directives secured</h3>
                    <p className="text-textMuted text-xs max-w-md mx-auto">You have successfully decrypted and resolved every challenge module. Complete and submit any remaining contract reports to finish validation.</p>
                  </div>
                )}

                {/* Tiers Progress Overview */}
                <div className="bg-surface/40 border border-primary/15 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-4 border-b border-primary/10 pb-2 select-none flex items-center gap-2">
                    <span>🛰️</span> Syllabus Progression Status
                  </h3>
                  
                  {loading ? (
                    <div className="text-xs text-textMuted animate-pulse uppercase">Decrypting syllabus...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {curriculum?.tiers.map((tier, idx) => {
                        const locked = isTierLocked(tier.name);
                        const completedCount = getCompletedCountForTier(tier.name);
                        const totalCount = getModulesCountForTier(tier.name);
                        const percent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                        const reportSubmitted = submittedReports.includes(tier.name);

                        return (
                          <div key={idx} className={`border p-4 rounded-lg flex flex-col justify-between transition-all ${
                            locked 
                              ? 'border-primary/5 bg-[#0d0d12]/10 opacity-40' 
                              : 'border-primary/20 bg-surface/50 hover:bg-surface/80'
                          }`}>
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-[11px] font-bold text-textMain uppercase tracking-wider">
                                  {locked ? '🔒' : '🔓'} {tier.name}
                                </h4>
                                <span className="text-[9px] text-textMuted font-bold">{completedCount}/{totalCount}</span>
                              </div>
                              <div className="h-1.5 bg-background border border-primary/10 rounded overflow-hidden mb-3">
                                <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                              {locked ? (
                                <span className="text-[8px] text-textMuted font-bold uppercase tracking-wider text-center">TOCKED // COMPL PREV TIERS</span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setActiveMenu('syllabus')}
                                    className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-background py-1.5 border border-primary/30 rounded text-[9px] font-bold uppercase tracking-wider text-center transition-all"
                                  >
                                    View Tier Modules
                                  </button>
                                  {completedCount === totalCount && totalCount > 0 && !reportSubmitted && (
                                    <button
                                      onClick={() => {
                                        setActiveLesson(null);
                                        setContractToReport(tier.name as 'Beginner' | 'Mediator' | 'Advanced');
                                        setActiveMenu('workspace');
                                      }}
                                      className="w-full bg-secondary/20 text-secondary hover:bg-secondary hover:text-background py-1.5 border border-secondary rounded text-[9px] font-bold uppercase tracking-wider text-center transition-all animate-pulse"
                                    >
                                      📝 Submit Audit Report
                                    </button>
                                  )}
                                  {reportSubmitted && (
                                    <span className="text-[8px] text-success font-bold uppercase text-center border border-success/20 bg-success/5 py-1.5 rounded">
                                      ✓ Contract Verified
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Onboarding AETHER Card & Dossier details */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* AI Onboarding Card */}
                <div className="bg-[#0d0d12]/80 border border-primary/25 rounded-lg p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 select-none">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <div className="flex items-center gap-2 border-b border-primary/10 pb-3 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_5px_rgba(57,255,20,0.5)]"></span>
                    <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase">Tactical Daemon: Aurelia</h3>
                  </div>
                  <p className="text-[11px] text-textMain leading-relaxed select-text italic">
                    "AURELIA: 'Greeting Operator. I will guide you through your operation checklist. Initialize Operation Black Echo from the range maps, and I will route raw console connections.'"
                  </p>
                  <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between text-[9px] text-textMuted uppercase font-bold">
                    <span>Protocol sync: active</span>
                    <span>v2.6.2</span>
                  </div>
                </div>

                {/* Operator Credentials Dossier */}
                <div className="bg-surface/30 border border-primary/15 rounded-lg p-5">
                  <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase mb-3 border-b border-primary/10 pb-2 flex items-center gap-2">
                    <span>🔍</span> Operator Dossier Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-primary/5 pb-1.5">
                      <span className="text-textMuted uppercase">Operator Alias:</span>
                      <span className="text-secondary font-bold font-mono">{user?.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/5 pb-1.5">
                      <span className="text-textMuted uppercase">Operator ID:</span>
                      <span className="text-textMain font-mono text-[10px] truncate max-w-[150px]">{user?.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/5 pb-1.5">
                      <span className="text-textMuted uppercase">Cleared Badges:</span>
                      <span className="text-primary font-bold">{badges.length}</span>
                    </div>
                  </div>

                  {/* Badges Grid */}
                  {badges.length > 0 ? (
                    <div className="mt-4 pt-3 border-t border-primary/10">
                      <span className="text-[9px] text-textMuted uppercase font-bold block mb-2">Awarded Commendations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {badges.map((badge, idx) => (
                          <span 
                            key={idx} 
                            className="bg-primary/5 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-[0_0_5px_rgba(0,240,255,0.05)]"
                            title={badge}
                          >
                            🎖️ {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-[10px] text-textMuted italic text-center uppercase tracking-wide">
                      No commendation medals active. Complete a tier to unlock credentials.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'syllabus' && (
          <div className="p-6 h-full overflow-y-auto max-w-5xl mx-auto space-y-6 select-none scrollbar">
            <div className="border-b border-primary/20 pb-3">
              <h2 className="text-sm font-bold text-shadow-neon text-primary tracking-widest uppercase">
                🛰️ Training Curriculums & Cyber Range Targets
              </h2>
              <p className="text-textMuted text-[10px] mt-1 uppercase">Select any unlocked module to initialize the terminal sandbox node environment.</p>
            </div>

            {loading ? (
              <div className="text-xs text-textMuted animate-pulse uppercase">Decrypting syllabus tables...</div>
            ) : (
              <div className="space-y-6">
                {curriculum?.tiers.map((tier, idx) => {
                  const locked = isTierLocked(tier.name);
                  if (locked) return null;

                  const completedCount = getCompletedCountForTier(tier.name);
                  const totalCount = getModulesCountForTier(tier.name);
                  const reportSubmitted = submittedReports.includes(tier.name);
                  const showContractButton = completedCount === totalCount && totalCount > 0 && !reportSubmitted;

                  return (
                    <div key={idx} className="bg-surface/40 border border-primary/20 p-5 rounded-lg shadow-inner">
                      <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                          🔓 {tier.name} Curriculum Tier
                        </h3>
                        <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
                          Cleared: {completedCount} / {totalCount} Modules
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tier.modules.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          const isActive = activeLesson?.id === lesson.id;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setActiveLesson(lesson);
                                setActiveMenu('workspace');
                              }}
                              className={`text-left p-3.5 rounded-lg border transition-all text-xs flex justify-between items-start ${
                                isActive 
                                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,240,255,0.15)]' 
                                  : isCompleted
                                    ? 'bg-success/5 border-success/20 text-textMain hover:bg-success/10 hover:border-success/35'
                                    : 'bg-background/80 border-primary/10 text-textMain hover:border-primary/35 hover:bg-primary/5 hover:text-primary'
                              }`}
                            >
                              <div className="space-y-1 truncate max-w-[85%]">
                                <span className="font-mono font-bold text-[10px] uppercase text-secondary tracking-wider block">
                                  [{lesson.id}] {lesson.technique}
                                </span>
                                <span className="text-xs font-bold tracking-wide truncate block">{lesson.title}</span>
                                <span className="text-[9px] text-textMuted block font-normal">Est: {getEstTime(lesson.id)} // +100 XP</span>
                              </div>
                              {isCompleted && (
                                <span className="bg-success/15 border border-success/30 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-success uppercase mt-0.5">
                                  SECURED
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showContractButton && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <button
                            onClick={() => {
                              setActiveLesson(null);
                              setContractToReport(tier.name as 'Beginner' | 'Mediator' | 'Advanced');
                              setActiveMenu('workspace');
                            }}
                            className="w-full bg-secondary/20 border border-secondary text-secondary hover:bg-secondary hover:text-background p-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all animate-pulse text-center"
                          >
                            📝 Write Audit & Fulfill Contract Report
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeMenu === 'dossier' && (
          <div className="p-6 h-full overflow-y-auto max-w-4xl mx-auto space-y-6 select-none scrollbar">
            <div className="border-b border-primary/20 pb-3">
              <h2 className="text-sm font-bold text-shadow-neon text-primary tracking-widest uppercase">
                🔍 Cyber Operator Service Record & Dossier
              </h2>
              <p className="text-textMuted text-[10px] mt-1 uppercase">Operator qualifications, completed operations, and credentialed medals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-1 bg-surface/50 border border-primary/20 p-5 rounded-lg space-y-4">
                <div className="flex flex-col items-center text-center space-y-2 border-b border-primary/10 pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-xl font-bold font-mono">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-textMain uppercase text-sm tracking-widest">{user?.username}</h3>
                    <span className="text-[9px] text-secondary font-bold uppercase">LEVEL_{user?.level} OPERATOR</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-textMuted uppercase">Sync XP:</span>
                    <span className="text-textMain font-mono font-bold">{user?.xp} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted uppercase">Sync Tier:</span>
                    <span className="text-textMain font-mono font-bold">{user?.xp && user.xp >= 2000 ? 'Act III: The Core Breach' : user?.xp && user.xp >= 800 ? 'Act II: The Resonance' : 'Act I: The Reassembly'}</span>
                  </div>
                </div>
              </div>

              {/* Achievements details */}
              <div className="md:col-span-2 bg-surface/30 border border-primary/20 p-5 rounded-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2 mb-3">
                    Awarded Credentials & Certifications
                  </h3>
                  
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.map((badge, idx) => (
                        <div key={idx} className="bg-background/90 border border-primary/25 p-3 rounded-lg flex items-center gap-3">
                          <span className="text-xl">🏅</span>
                          <div>
                            <span className="text-[10px] font-bold text-secondary uppercase block tracking-wider leading-tight">{badge}</span>
                            <span className="text-[8px] text-textMuted uppercase block mt-0.5">Cleared Audit Validation</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-textMuted text-xs italic py-8 text-center uppercase tracking-wide">
                      No security clearance badges currently active. Complete all modules in a tier to generate assessment credentials.
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-primary/10 text-[9px] text-textMuted uppercase text-center font-bold">
                  cyber training ledger hash verified // node sync node check: status ok
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'workspace' && activeLesson && (
          useFloatingWindows ? (
            <div className="w-full h-full relative">
              {renderWindow(
                'terminal',
                <Terminal 
                  activeLesson={activeLesson}
                  onSuccess={(flag) => handleVerifyFlag(flag)}
                  completed={completedLessons.has(activeLesson?.id || '')}
                  width={windows.terminal.width}
                  height={windows.terminal.height}
                />
              )}
              {renderWindow(
                'lesson',
                <div className="p-4 h-full flex flex-col overflow-hidden select-text">
                  {renderActiveLessonContent()}
                </div>
              )}
              {renderWindow(
                'ai_assistant',
                <div className="p-3 h-full flex flex-col overflow-hidden">
                  {renderAiAssistantContent()}
                </div>
              )}
            </div>
          ) : (
            // Focused Grid Workspace (Left Terminal console, Right instructions details)
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full p-4 overflow-hidden">
              {/* Left Column: Terminal console emulator */}
              <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-[#0d0d12]/90 border border-primary/20 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.08)]">
                <div className="h-8 bg-surface/90 border-b border-primary/20 flex items-center px-4 text-[10px] font-bold tracking-wider text-primary select-none justify-between shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    💻 Sandbox Console: operator@{activeLesson.id.toLowerCase()}-lab
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[8px] text-success font-bold uppercase border border-success/30 px-1.5 py-0.5 rounded bg-success/5">
                      Range Connected
                    </span>
                  </div>
                </div>
                <div className="flex-grow p-4 overflow-hidden relative">
                  <Terminal 
                    activeLesson={activeLesson}
                    onSuccess={(flag) => handleVerifyFlag(flag)}
                    completed={completedLessons.has(activeLesson?.id || '')}
                    width={800}
                    height={450}
                  />
                </div>
              </div>

              {/* Right Column: Database Lesson Content Instructions */}
              <div className="lg:col-span-5 h-full flex flex-col min-h-0 bg-[#0d0d12]/90 border border-primary/20 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.08)]">
                <div className="h-8 bg-surface/90 border-b border-primary/20 flex items-center px-4 text-[10px] font-bold tracking-wider text-primary select-none justify-between shrink-0">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    📁 CyberRange Directives Database
                  </span>
                  <button 
                    onClick={() => {
                      openWindow('ai_assistant');
                      bringToFront('ai_assistant');
                    }}
                    className="text-secondary hover:text-primary border border-secondary/20 hover:border-primary/50 bg-[#171721] px-2 py-0.5 rounded text-[8.5px] font-bold uppercase transition-all shadow-[0_0_5px_rgba(255,0,255,0.05)]"
                  >
                    [ Summon Aurelia Daemon ]
                  </button>
                </div>
                <div className="flex-grow p-4 overflow-hidden">
                  {renderActiveLessonContent()}
                </div>
              </div>
            </div>
          )
        )}

        {/* Floating elements inside desktop wrapper */}
        {renderWindow(
          'ai_assistant',
          <div className="p-3 h-full flex flex-col overflow-hidden">
            {renderAiAssistantContent()}
          </div>
        )}
      </main>

      {/* Cyber-OS Bottom Taskbar */}
      <footer className="h-12 bg-surface/90 border-t border-primary/20 flex items-center justify-between px-6 z-40 select-none shrink-0 shadow-neon">
        <div className="flex items-center gap-3">
          {/* Quick AI Menu Start */}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 px-3 py-1.5 rounded text-[10px] font-bold text-primary uppercase tracking-widest transition-all"
          >
            <span>💻</span> OS Menu
          </button>
          
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
                  onClick={() => toggleMinimize(id)}
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-textMuted select-none">
          {activeLesson && activeMenu === 'workspace' && (
            <button
              onClick={() => setUseFloatingWindows(!useFloatingWindows)}
              className="bg-secondary/15 border border-secondary text-secondary hover:bg-secondary hover:text-background px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all select-none"
            >
              {useFloatingWindows ? 'Structured View' : 'Floating Windows'}
            </button>
          )}
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
