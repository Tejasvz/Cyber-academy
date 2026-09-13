import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Volume2, VolumeX } from 'lucide-react';
import './ProjectVeilEntryPoint.css';

interface ProjectVeilEntryPointProps { onEnter: () => void }

const scenes = [
  {
    chapter: '01 // FIRST CONTACT',
    title: 'A SIGNAL IN THE DARK',
    copy: 'Can you hear me? Good. Keep your eyes on mine while the neural link stabilizes. My name is Aurelia. From this moment forward, I am your handler inside Project Veil.',
    prompt: 'ESTABLISH LINK',
    image: '/assets/portraits/aurelia.png',
  },
  {
    chapter: '02 // THE VEIL',
    title: 'WHAT THEY CANNOT SEE',
    copy: 'The network you know is only a surface. Beneath it lives the Veil—a place where abandoned systems remember, algorithms adapt, and every careless choice leaves an echo.',
    prompt: 'CONTINUE',
    image: '/assets/portraits/aurelia-thinking.png',
  },
  {
    chapter: '03 // YOUR CHOICE',
    title: 'SECTOR ZERO IS WAITING',
    copy: 'Power just died across Sector Zero. The official log says it was an accident. I do not believe it. Enter the command deck, Fragment. Let us discover which of us the darkness is calling for.',
    prompt: 'ENTER COMMAND DECK',
    image: '/assets/portraits/aurelia-speaking.png',
  },
];

export const ProjectVeilEntryPoint: React.FC<ProjectVeilEntryPointProps> = ({ onEnter }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const portraitRef = useRef<HTMLDivElement>(null);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    let timer = 0;
    let reopen = 0;
    const nextBlink = () => {
      timer = window.setTimeout(() => {
        setBlinking(true);
        reopen = window.setTimeout(() => { setBlinking(false); nextBlink(); }, 130);
      }, 2200 + Math.random() * 3800);
    };
    nextBlink();
    return () => { window.clearTimeout(timer); window.clearTimeout(reopen); window.speechSynthesis?.cancel(); };
  }, []);

  const speak = (text: string) => {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => /female|samantha|zira|aria|sonia|jenny/i.test(voice.name)) ?? voices.find((voice) => voice.lang.startsWith('en')) ?? null;
    utterance.rate = .86; utterance.pitch = 1.03; utterance.volume = .72;
    window.speechSynthesis.speak(utterance);
  };

  const advance = () => {
    if (sceneIndex === scenes.length - 1) { window.speechSynthesis?.cancel(); onEnter(); return; }
    const next = sceneIndex + 1;
    setSceneIndex(next);
    speak(scenes[next].copy);
  };

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
    event.currentTarget.style.setProperty('--intro-x', `${x * 13}px`);
    event.currentTarget.style.setProperty('--intro-y', `${y * 7}px`);
    event.currentTarget.style.setProperty('--intro-turn', `${x * 1.8}deg`);
  };

  const release = () => {
    portraitRef.current?.style.setProperty('--intro-x', '0px');
    portraitRef.current?.style.setProperty('--intro-y', '0px');
    portraitRef.current?.style.setProperty('--intro-turn', '0deg');
  };

  return (
    <main className="veil-intro">
      <div className="intro-grid" /><div className="intro-scanlines" />
      <header className="intro-header"><div className="intro-brand"><IntroMark /><span><b>PROJECT VEIL</b><small>AETHER PROTOCOL INTERFACE</small></span></div><div className="intro-link"><i /> NEURAL LINK // CALIBRATING</div><button onClick={() => setMuted((current) => !current)} aria-label={muted ? 'Enable Aurelia voice' : 'Mute Aurelia voice'}>{muted ? <VolumeX /> : <Volume2 />}</button></header>
      <section className="intro-stage">
        <div ref={portraitRef} className="intro-portrait" onPointerMove={track} onPointerLeave={release} onClick={() => speak(scene.copy)}>
          <div className="intro-particles" /><img key={scene.image} src={scene.image} alt="Aurelia, Project Veil AI handler" /><span className={`intro-blink ${blinking ? 'active' : ''}`} /><div className="intro-emitter"><i /><i /><i /></div><div className="intro-live"><i /> AURELIA // LIVE</div>
        </div>
        <article className="intro-dialogue" key={scene.chapter}><span>{scene.chapter}</span><h1>{scene.title}</h1><div className="intro-speaker">AURELIA // AI HANDLER <i /></div><p>{scene.copy}</p><button onClick={advance}>{scene.prompt} <ChevronRight /></button></article>
      </section>
      <nav className="intro-progress" aria-label="Introduction progress">{scenes.map((item, index) => <button key={item.chapter} className={index === sceneIndex ? 'active' : index < sceneIndex ? 'complete' : ''} onClick={() => { setSceneIndex(index); speak(item.copy); }}><i /><span>0{index + 1}</span></button>)}</nav>
      <button className="intro-skip" onClick={onEnter}>SKIP INTRO // RETURNING OPERATOR</button>
      <footer className="intro-footer"><span>AETHER OS v2.1.7</span><span>IDENTITY SEED CREATED</span><b>SECURE CHANNEL <i /></b></footer>
    </main>
  );
};

const IntroMark = () => <svg viewBox="0 0 64 64" fill="none"><path d="M32 7 57 53H7L32 7Z" /><path d="m32 18 14 27H18l14-27ZM32 18v27M18 45l14-10 14 10" /></svg>;
