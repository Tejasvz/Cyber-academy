import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audioSynth';

interface DialoguePanelProps {
  dialogueText: string;
  isSpeaking: boolean;
  onBeginMission: () => void;
  onSendMessage: (msg: string) => void;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  dialogueText,
  isSpeaking,
  onBeginMission,
  onSendMessage,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showInputMode, setShowInputMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    sound.playAureliaPulse();
    onSendMessage(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[92%] sm:w-[500px] pointer-events-auto z-30 select-none">
      <div className="glass-panel border-[#22d3ee] rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden shadow-neon-cyan/20">
        {/* Accent Bar Left */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]"></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#22d3ee]/20">
          <div className="flex items-center gap-2">
            <span className="text-[#22d3ee] font-bold text-sm sm:text-base tracking-wider text-glow-cyan">
              AURELIA
            </span>
            <span className="text-[#94a3b8]/60">//</span>
            <span className="text-[#22d3ee]/80 font-mono-cyber text-xs tracking-widest">
              AI HANDLER
            </span>
          </div>

          {/* Audio Equalizer Waveform Animation */}
          <div className="flex items-center gap-1 opacity-80">
            <div className={`w-1 bg-[#22d3ee] rounded-full transition-all ${isSpeaking ? 'h-4 animate-bounce' : 'h-2 animate-pulse'}`}></div>
            <div className={`w-1 bg-[#22d3ee] rounded-full transition-all ${isSpeaking ? 'h-6 animate-bounce' : 'h-4 animate-pulse'}`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-1 bg-[#22d3ee] rounded-full transition-all ${isSpeaking ? 'h-3 animate-bounce' : 'h-3 animate-pulse'}`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-1 bg-[#22d3ee] rounded-full transition-all ${isSpeaking ? 'h-5 animate-bounce' : 'h-5 animate-pulse'}`} style={{ animationDelay: '0.3s' }}></div>
            <div className={`w-1 bg-[#22d3ee] rounded-full transition-all ${isSpeaking ? 'h-2 animate-bounce' : 'h-2 animate-pulse'}`} style={{ animationDelay: '0.15s' }}></div>
          </div>
        </div>

        {/* Dialogue Body */}
        <div className="text-[#e2e8f0] text-xs sm:text-sm leading-relaxed font-mono-cyber min-h-[64px] whitespace-pre-line py-1">
          {dialogueText}
        </div>

        {/* Interactive Custom Input Toggle */}
        {showInputMode ? (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type message or instruction for Aurelia..."
              className="flex-1 bg-[#0c1324]/80 border border-[#22d3ee]/40 rounded px-3 py-1.5 text-xs text-[#e2e8f0] font-mono-cyber focus:outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]"
              autoFocus
            />
            <button
              type="submit"
              className="p-2 border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] rounded hover:bg-[#22d3ee]/40 transition"
              title="Send to Aurelia AI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowInputMode(false)}
              className="text-[10px] text-[#94a3b8] hover:text-[#e2e8f0] px-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          /* Primary Action Button */
          <div className="flex flex-col items-center gap-2 mt-1">
            <button
              onClick={() => {
                sound.playAureliaPulse();
                onBeginMission();
              }}
              className="btn-cyber text-[#a855f7] font-bold py-2.5 px-8 rounded clip-path-polygon w-full sm:w-3/4 text-center tracking-widest text-glow-purple text-xs sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition"
            >
              LET'S BEGIN
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowInputMode(true);
              }}
              className="text-[10px] font-mono-cyber text-[#22d3ee]/70 hover:text-[#22d3ee] transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>COMMUNICATE WITH AURELIA</span>
            </button>
          </div>
        )}

        {/* Bottom Micro Waveform */}
        <div className="flex justify-center items-center gap-0.5 opacity-40 pt-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-[2px] bg-[#22d3ee] rounded-full animate-pulse"
              style={{
                height: `${Math.sin(i * 0.5) * 6 + 8}px`,
                animationDelay: `${(i % 5) * 0.1}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
