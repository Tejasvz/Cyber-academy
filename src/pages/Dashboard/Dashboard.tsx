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
  const [activeTab, setActiveTab] = useState<'theory' | 'sandbox' | 'blueteam' | 'remediation'>('theory');
  const [flagInput, setFlagInput] = useState('');
  const [flagError, setFlagError] = useState('');

  // Local persistent achievements and reports
  const [badges, setBadges] = useState<string[]>([]);
  const [submittedReports, setSubmittedReports] = useState<string[]>([]);

  // Contract report form states
  const [contractToReport, setContractToReport] = useState<'Beginner' | 'Mediator' | 'Advanced' | null>(null);
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
      width: 760,
      height: 440,
    },
    curriculum: {
      id: 'curriculum',
      title: 'Mission Control [Active Curriculum]',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 820,
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
      width: 1160,
      height: 400,
    },
  });

  const [windowOrder, setWindowOrder] = useState<string[]>(['curriculum', 'terminal', 'lesson']);
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

  const allBeginnerCompleted = getCompletedCountForTier('Beginner') === getModulesCountForTier('Beginner') && getModulesCountForTier('Beginner') > 0;
  const allMediatorCompleted = getCompletedCountForTier('Mediator') === getModulesCountForTier('Mediator') && getModulesCountForTier('Mediator') > 0;

  const beginnerReportSubmitted = submittedReports.includes('Beginner');
  const mediatorReportSubmitted = submittedReports.includes('Mediator');

  const isTierLocked = (tierName: string) => {
    if (tierName === 'Beginner') return false;
    if (tierName === 'Mediator') {
      return !allBeginnerCompleted || !beginnerReportSubmitted;
    }
    if (tierName === 'Advanced') {
      return !allMediatorCompleted || !mediatorReportSubmitted;
    }
    return false;
  };

  // Check for auto-triggering contract report alerts
  useEffect(() => {
    if (allBeginnerCompleted && !beginnerReportSubmitted) {
      setContractToReport('Beginner');
      setActiveLesson(null);
    } else if (allMediatorCompleted && !mediatorReportSubmitted) {
      setContractToReport('Mediator');
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

    if (sanitizedFlag.toLowerCase() === activeLesson.flag?.toLowerCase()) {
      try {
        const data = await completeLesson(activeLesson.id, token);
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
      } catch (error) {
        console.error('Failed to complete lesson:', error);
        setFlagError('Server error updating completion status.');
      }
    } else {
      setFlagError('INCORRECT FLAG. Analyze outputs or try command again.');
      setTimeout(() => setFlagError(''), 4500);
    }
  };

  // Fulfill Contract & Report Handler
  const handleFulfillContract = (tierName: 'Beginner' | 'Mediator' | 'Advanced') => {
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
    if (tierName === 'Beginner') badge = '🔍 Recon Officer';
    else if (tierName === 'Mediator') badge = '🛡️ Security Specialist';
    else if (tierName === 'Advanced') badge = '👑 Elite Operator';

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
    id: 'terminal' | 'curriculum' | 'lesson',
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

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-mono relative overflow-hidden select-none">
      
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
                  <h3 className="text-lg text-primary font-bold tracking-wider">SYSTEM INITIALIZATION: ASSISTANT PROTOCOL</h3>
                </div>
                <span className="text-[10px] text-textMuted font-bold">REV-2026.07</span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <p className="text-secondary font-bold">Welcome Operator. Your neural-link is fully synced to the training dashboard. Below is your initialization briefing:</p>
                
                <div className="space-y-3 pl-2 border-l-2 border-primary/30">
                  <div>
                    <span className="text-primary font-bold">1. Select Missions (Right Panel):</span>
                    <p className="text-textMuted">Open the <span className="text-primary font-bold">Mission Control</span> window. You will only see curriculum tiers you have unlocked (locked levels are hidden to prevent clutter). Click <span className="text-primary font-bold">[B01] Networking Fundamentals</span> to deploy the hacking sandbox environment.</p>
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
      <header className="h-16 bg-surface/80 backdrop-blur border-b border-primary/20 flex items-center justify-between px-6 z-40 select-none shrink-0 shadow-neon">
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

      {/* Cyber-OS Virtual Desktop Canvas */}
      <main 
        className="flex-grow w-full relative overflow-hidden bg-background"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px), 
                            linear-gradient(to right, rgba(0, 240, 255, 0.03) 1px, transparent 1px), 
                            linear-gradient(to bottom, rgba(0, 240, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      >
        {/* Desktop Icons (Left Side Shortcut Column) */}
        <div className="absolute left-6 top-6 flex flex-col gap-5 z-20 select-none">
          <button
            onClick={() => openWindow('terminal')}
            onDoubleClick={() => openWindow('terminal')}
            className="flex flex-col items-center gap-1.5 p-2 rounded border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-center w-20"
          >
            <div className="w-10 h-10 rounded bg-[#0d0d12] border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon transition-shadow">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-textMain tracking-wide">Terminal</span>
          </button>

          <button
            onClick={() => openWindow('curriculum')}
            onDoubleClick={() => openWindow('curriculum')}
            className="flex flex-col items-center gap-1.5 p-2 rounded border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-center w-20"
          >
            <div className="w-10 h-10 rounded bg-[#0d0d12] border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon transition-shadow">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-textMain tracking-wide leading-tight">Mission Control</span>
          </button>

          <button
            onClick={() => openWindow('lesson')}
            onDoubleClick={() => openWindow('lesson')}
            className="flex flex-col items-center gap-1.5 p-2 rounded border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-center w-20"
          >
            <div className="w-10 h-10 rounded bg-[#0d0d12] border border-primary/30 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-neon transition-shadow">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-textMain tracking-wide">Database</span>
          </button>
        </div>

        {/* Windows Rendering Area */}
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
          'curriculum',
          <div className="flex flex-col h-full overflow-hidden select-none">
            <h2 className="text-sm text-secondary mb-3 font-bold border-b border-secondary/20 pb-2 uppercase tracking-widest flex items-center gap-1.5">
              <span>🛰️</span> Active Curriculum
            </h2>
            
            {loading ? (
              <div className="text-textMuted text-xs animate-pulse">Decrypting modules...</div>
            ) : (
              <div className="space-y-5 flex-grow overflow-auto pr-1">
                {curriculum?.tiers.map((tier, idx) => {
                  const locked = isTierLocked(tier.name);
                  
                  // Hide locked tiers/levels entirely from curriculum search to keep it relevant and avoid spoil/distraction
                  if (locked) return null;

                  const completedCount = getCompletedCountForTier(tier.name);
                  const totalCount = getModulesCountForTier(tier.name);
                  const reportSubmitted = submittedReports.includes(tier.name);
                  const showContractButton = completedCount === totalCount && totalCount > 0 && !reportSubmitted;

                  return (
                    <div key={idx} className="relative bg-[#0d0d12]/30 border border-primary/5 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2.5">
                        <h3 className="text-primary font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                          🔓 {tier.name} Tier
                        </h3>
                        <span className="text-[9px] text-textMuted">
                          ({completedCount}/{totalCount})
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-1.5 border-l-2 border-primary/20">
                        {tier.modules.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setActiveLesson(lesson);
                              // Auto-open and focus the Database (Lesson details) window
                              setWindows(prev => ({
                                ...prev,
                                lesson: {
                                  ...prev.lesson,
                                  isOpen: true,
                                  isMinimized: false,
                                  title: `Operator Database [Lesson Details: ${lesson.id}]`
                                }
                              }));
                              bringToFront('lesson');
                            }}
                            className={`block w-full text-left px-3 py-1.5 rounded transition-all text-xs flex justify-between items-center ${
                              activeLesson?.id === lesson.id 
                                ? 'bg-primary/20 text-primary border border-primary/40 font-bold' 
                                : 'text-textMain hover:bg-primary/5 hover:text-primary hover:border hover:border-primary/20 border border-transparent'
                            }`}
                          >
                            <span>
                              <span className="text-textMuted mr-2">[{lesson.id}]</span>
                              {lesson.title}
                            </span>
                            {completedLessons.has(lesson.id) && (
                              <span className="text-success font-bold text-xs select-none">✓</span>
                            )}
                          </button>
                        ))}

                        {/* CONTRACT REPORT INITIATION TRIGGER */}
                        {showContractButton && (
                          <button
                            onClick={() => {
                              setActiveLesson(null);
                              setContractToReport(tier.name as 'Beginner' | 'Mediator' | 'Advanced');
                              setWindows(prev => ({
                                ...prev,
                                lesson: {
                                  ...prev.lesson,
                                  isOpen: true,
                                  isMinimized: false,
                                  title: `Assessment Report - Client Authorization: ${tier.name}`
                                }
                              }));
                              bringToFront('lesson');
                            }}
                            className="w-full mt-2 bg-secondary/20 border border-secondary text-secondary hover:bg-secondary hover:text-background p-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all animate-pulse"
                          >
                            📝 Fulfill Contract Report
                          </button>
                        )}

                        {completedCount === totalCount && totalCount > 0 && reportSubmitted && (
                          <div className="text-[9px] text-success bg-success/10 border border-success/20 px-2 py-1 rounded font-bold uppercase tracking-widest text-center mt-2">
                            ✦ Contract Report Fulfilled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {renderWindow(
          'lesson',
          <AnimatePresence mode="wait">
            {contractToReport ? (
              // CONTRACT REPORT SUBMISSION INTERFACE
              <motion.div
                key={`contract-${contractToReport}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col h-full"
              >
                <div className="border-b border-secondary/30 pb-2 mb-3 select-none">
                  <span className="text-[9px] font-bold bg-secondary/20 border border-secondary/50 text-secondary px-2 py-0.5 rounded uppercase">AetherCorp Client Contract</span>
                  <h2 className="text-base text-primary font-bold mt-1">Pending Assessment Report: {contractToReport} Tier</h2>
                </div>
                <p className="text-xs text-textMuted mb-3 leading-relaxed select-none">
                  Authorize the next tier gateway by submitting your security assessment report findings for AetherCorp review. Complete all three verification statements.
                </p>
                
                <div className="space-y-3 flex-grow overflow-auto pr-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-secondary uppercase tracking-wider">1. What was the core vulnerability discovered?</label>
                    <input
                      type="text"
                      value={reportVuln}
                      onChange={(e) => setReportVuln(e.target.value)}
                      placeholder="e.g. Unencrypted credential transmissions, input concatenation database bypass..."
                      className="bg-background border border-primary/20 rounded p-2 text-textMain focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-secondary uppercase tracking-wider">2. How did you execute the exploitation?</label>
                    <input
                      type="text"
                      value={reportExploit}
                      onChange={(e) => setReportExploit(e.target.value)}
                      placeholder="e.g. Sniffing PCAP bytes, injecting OR logical arguments, LFI traversal jumps..."
                      className="bg-background border border-primary/20 rounded p-2 text-textMain focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-secondary uppercase tracking-wider">3. What is the key mitigation fix to secure the client?</label>
                    <input
                      type="text"
                      value={reportFix}
                      onChange={(e) => setReportFix(e.target.value)}
                      placeholder="e.g. Force TLS encryption, parameterize queries, validate inputs with basename limits..."
                      className="bg-background border border-primary/20 rounded p-2 text-textMain focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-primary/10 pt-3 mt-3 select-none">
                  <button
                    onClick={() => setContractToReport(null)}
                    className="border border-textMuted text-textMuted px-4 py-1.5 hover:bg-textMuted/10 rounded uppercase text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFulfillContract(contractToReport)}
                    className="bg-secondary/15 border border-secondary text-secondary hover:bg-secondary hover:text-background px-5 py-1.5 rounded uppercase text-xs font-bold tracking-wider transition-all"
                  >
                    Fulfill Contract (+200 XP)
                  </button>
                </div>
              </motion.div>
            ) : activeLesson ? (
              // ACTIVE LESSON DETAILS CARD
              <motion.div 
                key={activeLesson.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col h-full"
              >
                {/* Title & metadata */}
                <div className="flex justify-between items-start mb-3 border-b border-primary/20 pb-2.5 select-none shrink-0">
                  <div>
                    <h2 className="text-base text-primary font-bold">{activeLesson.title}</h2>
                    <p className="text-[9px] text-textMuted mt-0.5 font-bold uppercase">Lesson ID: {activeLesson.id} &nbsp;|&nbsp; Target Node: {activeLesson.technique}</p>
                  </div>
                  <span className="text-[9px] bg-secondary/15 text-secondary px-2.5 py-0.5 rounded border border-secondary/30 font-bold uppercase select-none">
                    {activeLesson.technique}
                  </span>
                </div>

                {/* 4-Tab selectors */}
                <div className="flex border-b border-primary/15 mb-3 overflow-x-auto whitespace-nowrap select-none shrink-0">
                  {(['theory', 'sandbox', 'blueteam', 'remediation'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
                        activeTab === tab
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-textMuted hover:text-textMain'
                      }`}
                    >
                      {tab === 'theory' && (
                        <>
                          <span>📖</span> 1. Theory Database
                        </>
                      )}
                      {tab === 'sandbox' && (
                        <>
                          <span>🛠️</span> 2. Interactive Guide
                        </>
                      )}
                      {tab === 'blueteam' && (
                        <>
                          <span>🛡️</span> 3. Blue Team logs
                        </>
                      )}
                      {tab === 'remediation' && (
                        <>
                          <span>🔒</span> 4. Remediation Code
                        </>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Tabs content rendering */}
                <div className="flex-grow overflow-auto pr-1 mb-4 select-text">
                  {activeTab === 'theory' && (
                    <div className="space-y-2 text-sm">
                      <h3 className="text-secondary font-bold text-[10px] uppercase tracking-wider select-none">[CONCEPT THEORETICS]</h3>
                      <p className="text-textMain leading-relaxed">{activeLesson.theory}</p>
                    </div>
                  )}

                  {activeTab === 'sandbox' && (
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="text-success font-bold text-[10px] uppercase tracking-wider select-none">[MISSION OBJECTIVE]</h3>
                        <p className="text-textMain leading-relaxed">{activeLesson.lab}</p>
                      </div>
                      {activeLesson.guide && (
                        <div className="bg-background/80 p-3.5 rounded border border-success/20 select-text">
                          <h4 className="text-primary font-bold uppercase tracking-wider text-[9px] mb-1.5 select-none">Simulated Operator Walkthrough:</h4>
                          <pre className="text-textMain font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text">{activeLesson.guide}</pre>
                        </div>
                      )}
                      {activeLesson.cheatSheet && (
                        <div className="bg-background/60 p-3 rounded border border-primary/20 select-text">
                          <h4 className="text-secondary font-bold uppercase tracking-wider text-[9px] mb-1.5 select-none">Real-World Tool Command Reference:</h4>
                          <pre className="text-primary font-mono text-[11px] whitespace-pre-wrap select-text">{activeLesson.cheatSheet}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'blueteam' && (
                    <div className="space-y-2 text-sm">
                      <h3 className="text-warning font-bold text-[10px] uppercase tracking-wider select-none">[IDS FIREWALL MONITORING TELEMETRY]</h3>
                      <p className="text-textMuted italic text-xs select-none">This is what defenders logged on system consoles during execution:</p>
                      <pre className="bg-background/90 p-3.5 rounded border border-warning/20 text-warning font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text">
                        {activeLesson.blueTeamLogs || "No telemetry captured for this operation."}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'remediation' && (
                    <div className="space-y-3 text-sm">
                      <h3 className="text-secondary font-bold text-[10px] uppercase tracking-wider select-none">[CODE FIX & HARDENING]</h3>
                      <p className="text-textMain leading-relaxed mb-1">{activeLesson.remediation?.explanation || "Remediation data pending."}</p>
                      
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
                        MODULE COMPLETED (+100 XP Gained)
                      </span>
                      <span className="text-success text-[10px] font-bold bg-success/20 border border-success/40 px-2 py-0.5 rounded uppercase">✓ DECRYPTED</span>
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
                          className="w-full bg-background border border-primary/30 rounded px-3 py-1.5 text-primary font-mono text-xs focus:outline-none focus:border-primary shadow-inner"
                        />
                      </div>
                      <button
                        onClick={() => handleVerifyFlag(flagInput)}
                        className="w-full md:w-auto bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-background px-6 py-2 rounded font-bold uppercase tracking-widest transition-all text-[10px] self-end shrink-0"
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-textMuted">
          <span className="hidden sm:inline">System Latency: <span className="text-success font-bold">0.0035s</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="text-primary font-mono font-bold tracking-wider">{timeStr}</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
