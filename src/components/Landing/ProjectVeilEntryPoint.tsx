import React, { useEffect, useState } from 'react';
import { ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { AureliaHologram3D, type AureliaExpression } from '../AI/AureliaHologram3D';
import './ProjectVeilEntryPoint.css';
import { speakAurelia } from '../../utils/aureliaVoice';
import { usePreferences } from '../../store/preferencesStore';

interface ProjectVeilEntryPointProps { onEnter: () => void }

const scenes = [
  {
    chapter: '01 // FIRST CONTACT',
    title: 'A SIGNAL IN THE DARK',
    copy: 'Can you hear me? Good. Keep your eyes on mine while the neural link stabilizes. My name is Aurelia. From this moment forward, I am your handler inside Project Veil.',
    prompt: 'ESTABLISH LINK',
    expression: 'neutral' as AureliaExpression,
  },
  {
    chapter: '02 // THE VEIL',
    title: 'WHAT THEY CANNOT SEE',
    copy: 'The network you know is only a surface. Beneath it lives the Veil—a place where abandoned systems remember, algorithms adapt, and every careless choice leaves an echo.',
    prompt: 'CONTINUE',
    expression: 'thinking' as AureliaExpression,
  },
  {
    chapter: '03 // YOUR CHOICE',
    title: 'SECTOR ZERO IS WAITING',
    copy: 'Power just died across Sector Zero. The official log says it was an accident. I do not believe it. Enter the command deck, Fragment. Let us discover which of us the darkness is calling for.',
    prompt: 'ENTER COMMAND DECK',
    expression: 'alert' as AureliaExpression,
  },
];

export const ProjectVeilEntryPoint: React.FC<ProjectVeilEntryPointProps> = ({ onEnter }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const voice = usePreferences(state => state.voice);
  const setPreference = usePreferences(state => state.update);
  const muted = !voice;
  const setMuted = (change: (current: boolean) => boolean) => setPreference({ voice: !change(muted) });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scene = scenes[sceneIndex];

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (text: string) => {
    speakAurelia(text, () => setIsSpeaking(false), () => setIsSpeaking(true));
  };

  const advance = () => {
    if (sceneIndex === scenes.length - 1) { window.speechSynthesis?.cancel(); onEnter(); return; }
    const next = sceneIndex + 1;
    setSceneIndex(next);
    speak(scenes[next].copy);
  };

  return (
    <main className="veil-intro">
      <div className="intro-grid" /><div className="intro-scanlines" />
      <header className="intro-header"><div className="intro-brand"><IntroMark /><span><b>PROJECT VEIL</b><small>AETHER PROTOCOL INTERFACE</small></span></div><div className="intro-link"><i /> NEURAL LINK // CALIBRATING</div><button onClick={() => setMuted((current) => !current)} aria-label={muted ? 'Enable Aurelia voice' : 'Mute Aurelia voice'}>{muted ? <VolumeX /> : <Volume2 />}</button></header>
      <section className="intro-stage">
        <div className="intro-portrait"><AureliaHologram3D expression={isSpeaking ? 'speaking' : scene.expression} isSpeaking={isSpeaking} onInteract={() => speak(scene.copy)} /></div>
        <article className="intro-dialogue" key={scene.chapter}><span>{scene.chapter}</span><h1>{scene.title}</h1><div className="intro-speaker">AURELIA // AI HANDLER <i /></div><p>{scene.copy}</p><button onClick={advance}>{scene.prompt} <ChevronRight /></button></article>
      </section>
      <nav className="intro-progress" aria-label="Introduction progress">{scenes.map((item, index) => <button key={item.chapter} className={index === sceneIndex ? 'active' : index < sceneIndex ? 'complete' : ''} onClick={() => { setSceneIndex(index); speak(item.copy); }}><i /><span>0{index + 1}</span></button>)}</nav>
      <button className="intro-skip" onClick={onEnter}>SKIP INTRO // RETURNING OPERATOR</button>
      <footer className="intro-footer"><span>AETHER OS v2.1.7</span><span>IDENTITY SEED CREATED</span><b>SECURE CHANNEL <i /></b></footer>
    </main>
  );
};

const IntroMark = () => <svg viewBox="0 0 64 64" fill="none"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;
