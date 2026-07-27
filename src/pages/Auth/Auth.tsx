import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
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
      const response = await axios.post(`http://localhost:3000${endpoint}`, payload);
      login(response.data.user, response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-textMain">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface p-8 rounded-lg shadow-neon w-full max-w-md border border-primary/20"
      >
        <h2 className="text-3xl font-mono text-primary mb-6 text-center font-bold tracking-widest uppercase">
          {isLogin ? 'Initialize Session' : 'Create Operator'}
        </h2>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-2 rounded mb-4 font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-textMuted">Operator Alias</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-primary/30 rounded px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textMain font-mono transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-textMuted">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-primary/30 rounded px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textMain font-mono transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-textMuted">Passphrase</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-primary/30 rounded px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textMain font-mono transition-colors"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 255, 65, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-transparent border-2 border-primary text-primary font-bold py-2 px-4 rounded font-mono uppercase tracking-widest mt-6 hover:shadow-neon transition-shadow"
          >
            {isLogin ? 'Connect' : 'Register'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-textMuted hover:text-primary text-sm font-mono underline decoration-primary/30 underline-offset-4 transition-colors"
          >
            {isLogin ? "Need access? Register here." : "Already have access? Connect."}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
