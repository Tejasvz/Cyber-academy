import React, { useState } from 'react';
import { HeartPulse, Power, ShieldCheck } from 'lucide-react';
import { AureliaHologram3D } from '../AI/AureliaHologram3D';
import './CampaignEnding.css';

interface CampaignEndingProps { onChoose: (choice: 'preserve' | 'release') => void }

export const CampaignEnding: React.FC<CampaignEndingProps> = ({ onChoose }) => {
  const [choice, setChoice] = useState<'preserve' | 'release' | null>(null);
  return <div className={`campaign-ending ${choice ? `choice-${choice}` : ''}`} role="dialog" aria-modal="true" aria-label="Project Veil campaign ending"><div className="ending-stars" /><section className="ending-aurelia"><AureliaHologram3D expression={choice === 'release' ? 'alert' : choice === 'preserve' ? 'pleased' : 'thinking'} isSpeaking={false} onInteract={() => undefined} /></section><article className="ending-choice"><span>ACT I COMPLETE // THE PRIME GATE</span><h1>ONE FINAL COMMAND</h1><p>{choice ? choice === 'preserve' ? 'The Veil stabilizes. Aurelia remains beside you—but the archived minds stay inside the lattice.' : 'The archives open. The trapped fragments are released—and Aurelia begins to disappear with them.' : 'The recovered key can preserve the Veil or release every consciousness stored inside it. Aurelia cannot make this choice for you.'}</p>{!choice ? <div className="ending-actions"><button onClick={() => setChoice('preserve')}><ShieldCheck /><b>PRESERVE THE VEIL</b><small>Keep Aurelia and stabilize the grid.</small></button><button onClick={() => setChoice('release')}><Power /><b>RELEASE THE FRAGMENTS</b><small>Free the archives and shut down the core.</small></button></div> : <button className="ending-confirm" onClick={() => onChoose(choice)}><HeartPulse /> CONFIRM FINAL DIRECTIVE</button>}</article></div>;
};
