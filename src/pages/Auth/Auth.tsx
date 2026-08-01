import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      login(response.data.user, response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  // Play interface sounds on hover/clicks
  const playHoverTick = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.003, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  };

  return (
    <div 
      className="min-h-screen bg-[#040406] flex items-center justify-center p-4 font-mono text-textMain overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(0, 240, 255, 0.05) 1px, transparent 1px), 
                          linear-gradient(to right, rgba(0, 240, 255, 0.01) 1px, transparent 1px), 
                          linear-gradient(to bottom, rgba(0, 240, 255, 0.01) 1px, transparent 1px)`,
        backgroundSize: '32px 32px, 64px 64px, 64px 64px',
      }}
    >
      {/* Cinematic CRT Scanline Overlays */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {showLanding ? (
        <motion.div 
          key="landing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="text-center space-y-8 max-w-xl z-20"
        >
          {/* Glowing Vector Logo */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-25" />
            <svg 
              className="w-24 h-24 text-primary animate-pulse" 
              viewBox="0 0 100 100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 12px rgba(0,240,255,0.4))' }}
            >
              <polygon points="50,10 90,80 10,80" />
              <circle cx="50" cy="55" r="10" />
              <path d="M50,10 L50,45" strokeDasharray="3,3" />
            </svg>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-shadow-neon text-primary uppercase">
              PROJECT VEIL
            </h1>
            <p className="text-[10px] text-textMuted uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
              Secure Cognitive Lattice Command Grid // Aether Systems Division
            </p>
          </div>

          <div className="h-[1px] bg-primary/20 w-48 mx-auto" />

          <p className="text-[10px] text-primary/80 max-w-sm mx-auto uppercase leading-relaxed tracking-wider">
            Notice: Classified encryption protocol actively logging system telemetry. Unauthorized attempts will trigger network quarantine.
          </p>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={playHoverTick}
              onClick={() => { playHoverTick(); setShowLanding(false); }}
              className="px-8 py-3.5 bg-primary/10 border border-primary text-primary font-bold text-xs uppercase tracking-widest rounded transition-all cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.15)] font-mono"
            >
              [ CONNECT COGNITIVE CHANNEL ]
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="auth-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#09090f]/90 p-8 rounded-lg shadow-[0_0_35px_rgba(0,240,255,0.15)] w-full max-w-md border border-primary/30 backdrop-blur-md z-20"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-shadow-neon text-primary tracking-widest uppercase">
              {isLogin ? 'INITIALIZE OPERATOR' : 'CREATE OPERATOR IDENT'}
            </h2>
            <p className="text-[9px] text-textMuted uppercase mt-1 tracking-wider">
              {isLogin ? 'Authorize interface socket credentials' : 'Register new alias on the reassembly lattice'}
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/40 text-error px-4 py-2.5 rounded mb-5 font-mono text-[10px] uppercase tracking-wide leading-relaxed">
              [-] CONNECTION ERROR: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">1. Register Alias</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. AetherOperator"
                  className="w-full bg-background/50 border border-primary/20 rounded px-4 py-2 focus:outline-none focus:border-primary text-primary text-xs transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">
                {isLogin ? '1. Email Address or Alias' : '2. Email Address'}
              </label>
              <input
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "operator@aether.org or alias" : "operator@aether.org"}
                className="w-full bg-background/50 border border-primary/20 rounded px-4 py-2 focus:outline-none focus:border-primary text-primary text-xs transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1">
                {isLogin ? '2. Passphrase Key' : '3. Passphrase Key'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-background/50 border border-primary/20 rounded px-4 py-2 focus:outline-none focus:border-primary text-primary text-xs transition-colors"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={playHoverTick}
              type="submit"
              className="w-full bg-primary/5 border border-primary text-primary font-bold py-2.5 px-4 rounded text-xs uppercase tracking-widest mt-6 hover:shadow-neon transition-shadow cursor-pointer"
            >
              {isLogin ? 'SECURE SOCKET' : 'AUTHORIZE ACCESS'}
            </motion.button>
          </form>

          <div className="mt-6 text-center border-t border-primary/10 pt-4">
            <button
              onClick={() => {
                playHoverTick();
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-textMuted hover:text-primary text-[10px] uppercase tracking-wider transition-colors hover:underline underline-offset-4"
            >
              {isLogin ? "[ Request operator access ]" : "[ Have credentials? Connect ]"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Auth;
