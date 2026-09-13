import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, LockKeyhole, Mail, Radio, UserRound } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import './Auth.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { username, email, password };
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      login(response.data.user, response.data.token, { startIntro: !isLogin });
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) setError(requestError.response?.data?.error || 'Connection to the Aether relay was interrupted.');
      else setError('Connection to the Aether relay was interrupted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-stars" aria-hidden="true" />
      <header className="auth-header">
        <div className="auth-brand"><Mark /><span><b>PROJECT VEIL</b><small>AETHER PROTOCOL INTERFACE</small></span></div>
        <div className="auth-header-status"><Radio /> SECURE AETHER RELAY <i /></div>
      </header>

      <section className="auth-content">
        <motion.div className="auth-intel" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}>
          <p className="auth-eyebrow">OPERATOR ACCESS // SECTOR ZERO</p>
          <h1>THE VEIL<br /><em>IS WAITING.</em></h1>
          <p className="auth-intro">A secure cyber-academy command interface for learning defensive operations, unraveling live intel, and restoring the fractured Aether grid.</p>
          <div className="auth-signal"><span>UPLINK INTEGRITY</span><b>ENCRYPTED</b><i><em /></i></div>
          <div className="auth-events"><p><i /> AURELIA DAEMON ONLINE</p><p><i /> SECTOR ZERO GATEWAY STABLE</p><p><i /> CLEARANCE REQUIRED</p></div>
        </motion.div>

        <motion.section className="auth-card" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }}>
          <header><span className="auth-card-icon">{isLogin ? <KeyRound /> : <UserRound />}</span><div><p>{isLogin ? 'RETURNING OPERATOR' : 'NEW OPERATOR'}</p><h2>{isLogin ? 'SECURE LOGIN' : 'CREATE IDENT'}</h2></div></header>
          <p className="auth-card-copy">{isLogin ? 'Authenticate your command credentials to resume the operation.' : 'Register an operator identity before the Project Veil initiation sequence.'}</p>
          {error && <div className="auth-error">// {error}</div>}
          <form onSubmit={submit}>
            {!isLogin && <Field icon={<UserRound />} label="OPERATOR ALIAS"><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Fragment" required /></Field>}
            <Field icon={<Mail />} label={isLogin ? 'EMAIL OR ALIAS' : 'AETHER EMAIL'}><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isLogin ? 'operator@aether.org' : 'operator@aether.org'} type={isLogin ? 'text' : 'email'} required /></Field>
            <Field icon={<LockKeyhole />} label="PASSPHRASE KEY"><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" type="password" required /></Field>
            <button className="auth-submit" disabled={submitting} type="submit">{submitting ? 'AUTHENTICATING...' : isLogin ? 'ENTER COMMAND DECK' : 'AUTHORIZE OPERATOR'} <ArrowRight /></button>
          </form>
          <footer><span>{isLogin ? 'NO OPERATOR ID?' : 'ALREADY HAVE CREDENTIALS?'}</span><button onClick={() => { setIsLogin((value) => !value); setError(''); }}>{isLogin ? 'REQUEST ACCESS' : 'RETURN TO LOGIN'}</button></footer>
        </motion.section>
      </section>
      <footer className="auth-footer"><span>AETHER OS v2.1.7</span><span>CLASSIFIED // OPERATOR TELEMETRY ACTIVE</span><span>NODE: SEC_ZERO_POD</span></footer>
    </main>
  );
};

const Field: React.FC<{ children: React.ReactNode; icon: React.ReactNode; label: string }> = ({ children, icon, label }) => <label className="auth-field"><span>{icon}{label}</span>{children}</label>;
const Mark: React.FC = () => <svg viewBox="0 0 64 64" fill="none"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;

export default Auth;
