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

  const handleCompleteLesson = async () => {
    if (!activeLesson || !token || !user) return;
    try {
      const data = await completeLesson(activeLesson.id, token);
      setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
      // Update local user context with new XP and Level
      login(data.user, token);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary p-4 lg:p-8 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-surface p-4 rounded shadow-neon border border-primary/10">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-shadow-neon text-primary tracking-widest uppercase">Operator Dashboard</h1>
          <p className="text-textMuted text-sm mt-1">Alias: <span className="text-secondary">{user?.username}</span> | Level: {user?.level} | XP: {user?.xp}</p>
        </div>
        <button 
          onClick={logout}
          className="border border-error text-error px-4 py-2 hover:bg-error/10 transition-colors rounded uppercase tracking-wider text-sm"
        >
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Terminal Area (Left) */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
          <div className="flex-grow">
            <Terminal />
          </div>
          
          {/* Active Lesson Display */}
          <AnimatePresence mode="wait">
            {activeLesson ? (
              <motion.div 
                key={activeLesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-surface border border-primary/20 rounded shadow-neon p-4 overflow-y-auto max-h-[35vh]"
              >
                <div className="flex justify-between items-start mb-2 border-b border-primary/30 pb-2">
                  <h2 className="text-xl text-primary font-bold">{activeLesson.title}</h2>
                  <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded border border-secondary/50">
                    {activeLesson.technique}
                  </span>
                </div>
                
                <div className="space-y-4 mt-4 text-sm mb-4">
                  <div>
                    <h3 className="text-secondary font-bold mb-1">[THEORY]</h3>
                    <p className="text-textMain">{activeLesson.theory}</p>
                  </div>
                  <div>
                    <h3 className="text-success font-bold mb-1">[LAB OBJECTIVE]</h3>
                    <p className="text-textMain">{activeLesson.lab}</p>
                  </div>
                  <div className="bg-background p-3 rounded border border-warning/30">
                    <h3 className="text-warning font-bold mb-1">[OPSEC WARNING]</h3>
                    <p className="text-textMuted italic">{activeLesson.opSec}</p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-primary/20 pt-4 mt-4">
                  {completedLessons.has(activeLesson.id) ? (
                    <span className="text-success font-bold px-4 py-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
                      MODULE COMPLETED
                    </span>
                  ) : (
                    <button
                      onClick={handleCompleteLesson}
                      className="bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-background px-4 py-2 rounded font-bold uppercase tracking-widest transition-all"
                    >
                      Mark as Completed (+100 XP)
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface border border-primary/10 rounded p-4 text-center text-textMuted flex items-center justify-center h-32">
                Awaiting module selection...
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Curriculum List (Right) */}
        <div className="bg-surface border border-primary/20 rounded shadow-neon p-4 overflow-y-auto h-full">
          <h2 className="text-xl text-secondary mb-4 font-bold border-b border-secondary/30 pb-2 uppercase tracking-widest">Active Curriculum</h2>
          
          {loading ? (
            <div className="text-textMuted animate-pulse">Decrypting modules...</div>
          ) : (
            <div className="space-y-6">
              {curriculum?.tiers.map((tier, idx) => (
                <div key={idx}>
                  <h3 className="text-primary font-bold mb-2 uppercase tracking-wider">{tier.name} Tier</h3>
                  <div className="space-y-2 pl-2 border-l border-primary/20">
                    {tier.modules.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`block w-full text-left px-3 py-2 rounded transition-colors text-sm flex justify-between items-center ${
                          activeLesson?.id === lesson.id 
                            ? 'bg-primary/20 text-primary border border-primary/50' 
                            : 'text-textMain hover:bg-surface hover:text-primary hover:border hover:border-primary/30 border border-transparent'
                        }`}
                      >
                        <span>
                          <span className="text-textMuted mr-2">[{lesson.id}]</span>
                          {lesson.title}
                        </span>
                        {completedLessons.has(lesson.id) && (
                          <span className="text-success ml-2">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
