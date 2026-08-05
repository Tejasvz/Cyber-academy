import React, { useState } from 'react';
import { HolographicSync } from './HolographicSync';
import { Send, Activity, RefreshCw } from 'lucide-react';

interface Message {
  sender: 'aurelia' | 'operator';
  text: string;
  timestamp: string;
}

export const AureliaAICommandCore: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'aurelia',
      text: 'Aurelia Neural Core online. Synaptic uplink verified. What are your instructions, Operator?',
      timestamp: '13:20:05'
    }
  ]);
  const [input, setInput] = useState('');
  const [syncMode, setSyncMode] = useState<'waveform' | 'spectrum' | 'pulse'>('waveform');
  const [personality, setPersonality] = useState<'tactical' | 'analytical' | 'protective'>('tactical');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      sender: 'operator',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const query = input.toLowerCase();
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      let reply = '';
      if (query.includes('status') || query.includes('system')) {
        reply = 'All Sector Zero subroutines operational. Neural bandwidth: 98.4%. Firewall intact.';
      } else if (query.includes('threat') || query.includes('aether')) {
        reply = 'Aether Protocol nodes detected in Grid 04. I recommend executing a deep DNS sweep before proceeding.';
      } else if (query.includes('dossier') || query.includes('kaelen') || query.includes('hesper')) {
        reply = 'Accessing personnel database... Dossier files decrypted and loaded into Intel window.';
      } else {
        reply = `Query processed. Core analysis: "${userMsg.text}". Tactical recommendations synthesized.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'aurelia',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="w-full h-full bg-[#0a0e14]/90 text-[#dfe2eb] font-mono flex flex-col justify-between p-4 rounded-lg select-none">
      {/* Top AI Companion Header */}
      <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src="/assets/portraits/aurelia.png"
              alt="Aurelia"
              className="w-10 h-10 rounded-full border border-cyan-400 object-cover shadow-[0_0_10px_rgba(0,240,255,0.5)]"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-teal-400 rounded-full border border-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-cyan-300">AURELIA // AI COMMAND CORE</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase">V4.09</span>
            </div>
            <p className="text-[11px] text-gray-400">PERSONALITY MATRIX: <span className="text-cyan-400 font-bold uppercase">{personality}</span></p>
          </div>
        </div>

        {/* Sync Mode selector */}
        <div className="flex items-center space-x-1 text-[11px] bg-black/40 border border-cyan-500/20 rounded p-1">
          {(['waveform', 'spectrum', 'pulse'] as const).map(m => (
            <button
              key={m}
              onClick={() => setSyncMode(m)}
              className={`px-2 py-0.5 rounded transition ${syncMode === m ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400 hover:text-cyan-300'}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Holographic Sync Waveform Bar */}
      <div className="my-3 h-20 bg-black/60 border border-cyan-500/30 rounded-lg p-2 relative overflow-hidden">
        <HolographicSync active={isProcessing || true} mode={syncMode} frequency={440} />
        <div className="absolute top-2 right-2 text-[10px] text-cyan-400/70 flex items-center gap-1">
          <Activity size={12} className="animate-pulse" /> SYNC FREQ: 440 Hz
        </div>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'operator' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1 text-[10px] text-gray-500 mb-1">
              <span className="uppercase font-bold text-cyan-400/80">{msg.sender}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>
            <div
              className={`max-w-[85%] p-3 rounded-lg leading-relaxed ${
                msg.sender === 'operator'
                  ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 rounded-tr-none'
                  : 'bg-black/70 border border-teal-500/30 text-teal-100 rounded-tl-none shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 italic">
            <RefreshCw size={12} className="animate-spin" />
            <span>Aurelia synthesizing neural response...</span>
          </div>
        )}
      </div>

      {/* Personality Matrix & Quick Actions */}
      <div className="flex items-center justify-between py-2 border-t border-cyan-500/20 text-[11px] gap-2">
        <div className="flex items-center space-x-1">
          <span className="text-gray-400">MATRIX:</span>
          {(['tactical', 'analytical', 'protective'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPersonality(p)}
              className={`px-2 py-0.5 rounded border transition ${
                personality === p
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'border-transparent text-gray-400 hover:text-cyan-300'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Issue command to Aurelia..."
            className="w-full bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="p-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400 disabled:opacity-50 transition"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
