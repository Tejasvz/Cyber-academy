import { useEffect, useState, useRef } from 'react';
import { useDialogueStore, type DialogueNode } from '../../store/dialogueStore';

interface DialogueFeedProps {
  activeLesson: any;
}

export const DialogueFeed: React.FC<DialogueFeedProps> = ({ activeLesson }) => {
  const {
    activeSequence,
    currentNodeIndex,
    isSequencePlaying,
    advanceDialogue,
    skipDialogueSequence,
    addMessage,
    setIsTextTyping
  } = useDialogueStore();

  const [displayedText, setDisplayedText] = useState('');
  const activeNodeRef = useRef<DialogueNode | null>(null);
  const typingTimerRef = useRef<any>(null);

  // Generate an immersive idle dialogue tip if no story sequence is active
  const getMockIdleNode = (): DialogueNode => {
    if (activeLesson) {
      return {
        id: `idle-${activeLesson.id}`,
        speaker: 'aurelia',
        text: `Fragment, node ${activeLesson.id} (${activeLesson.title}) is selected. Access the terminal console on your left to audit records or inject exploit vectors. Standing by.`,
        expression: 'neutral',
      };
    }
    return {
      id: 'idle-none',
      speaker: 'aurelia',
      text: 'Lattice link stabilized. No active target payload loaded. Select an operation target from Mission Control on the left to begin synaptic reassembly.',
      expression: 'neutral',
    };
  };

  const idleNode = getMockIdleNode();
  const currentNode = activeSequence && currentNodeIndex >= 0 ? activeSequence[currentNodeIndex] : idleNode;

  // Typist animation loop
  useEffect(() => {
    if (!currentNode) {
      setDisplayedText('');
      return;
    }

    activeNodeRef.current = currentNode;
    setDisplayedText('');
    setIsTextTyping(true);

    const text = currentNode.text;
    const typingSpeed = currentNode.typingSpeed || 20; // Fast typing speed for HUD feel
    const pauseIndices = currentNode.pauseIndices || {};
    let currentCharIndex = 0;
    let accumulatedText = '';

    // Simple audio click beep for dialog typing
    let audioCtx: AudioContext | null = null;
    const playTick = () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.005, audioCtx.currentTime); // Subtle beep volume
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (e) {}
    };

    // Voice log trigger (basic fallback audio node)
    let audio: HTMLAudioElement | null = null;
    if (currentNode.voiceUrl) {
      audio = new Audio(currentNode.voiceUrl);
      audio.volume = 0.8;
      audio.play().catch((err) =>
        console.log('Voice audio autoplay blocked:', err)
      );
    }

    const typeNextChar = () => {
      if (activeNodeRef.current !== currentNode) {
        if (audio) audio.pause();
        return;
      }

      if (currentCharIndex < text.length) {
        const char = text[currentCharIndex];
        accumulatedText += char;
        setDisplayedText(accumulatedText);

        // Tick sound on every few characters to sound like a transmitter
        if (currentCharIndex % 3 === 0 && !currentNode.id.startsWith('idle')) {
          playTick();
        }

        const pauseDuration = pauseIndices[currentCharIndex];
        currentCharIndex++;

        if (pauseDuration) {
          typingTimerRef.current = setTimeout(typeNextChar, pauseDuration);
        } else {
          typingTimerRef.current = setTimeout(typeNextChar, typingSpeed);
        }
      } else {
        setIsTextTyping(false);
        // Save to logs once complete
        if (!currentNode.id.startsWith('idle')) {
          addMessage({
            sender: currentNode.speaker,
            text: currentNode.text,
          });
        }
      }
    };

    typingTimerRef.current = setTimeout(typeNextChar, typingSpeed);

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (audio) audio.pause();
    };
  }, [currentNode.id, addMessage, setIsTextTyping]);

  const handleNextClick = () => {
    if (!currentNode) return;
    
    const isFinished = displayedText.length >= currentNode.text.length;
    
    if (!isFinished) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setDisplayedText(currentNode.text);
      setIsTextTyping(false);
      if (!currentNode.id.startsWith('idle')) {
        addMessage({
          sender: currentNode.speaker,
          text: currentNode.text,
        });
      }
    } else {
      advanceDialogue();
    }
  };

  const speakerNameMap: Record<string, string> = {
    aurelia: 'Tactical OS Daemon: Aurelia',
    hesper: 'Dr. Arthur Hesper',
    kaelen: 'The Chorus (Kaelen)',
    byte: 'Utility Script: Byte',
    operator: 'Operator (Fragment)'
  };

  const speakerColors: Record<string, string> = {
    aurelia: 'text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/5',
    hesper: 'text-[#ffb000] border-[#ffb000]/30 bg-[#ffb000]/5',
    kaelen: 'text-[#d946ef] border-[#d946ef]/30 bg-[#d946ef]/5',
    byte: 'text-red-400 border-red-400/30 bg-red-400/5',
    operator: 'text-slate-400 border-slate-500/20 bg-slate-500/5'
  };

  return (
    <div className="w-full bg-[#09090f]/90 border border-primary/20 rounded-lg p-4 font-mono shadow-[0_0_20px_rgba(0,240,255,0.03)] flex flex-col justify-between relative z-20 shrink-0">
      {/* Top Header Row of dialogue box */}
      <div className="flex justify-between items-center border-b border-primary/20 pb-1.5 mb-2 select-none">
        <div className="flex items-center gap-2">
          <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${speakerColors[currentNode.speaker] || speakerColors.operator}`}>
            {speakerNameMap[currentNode.speaker] || 'Unknown Origin'}
          </span>
          
          {/* Animated audio visualizer bars */}
          <div className="flex items-center gap-0.5 h-3 ml-2">
            <div className={`w-[2px] rounded-full bg-current ${displayedText.length < currentNode.text.length && !currentNode.id.startsWith('idle') ? 'animate-bounce' : 'h-1'}`} style={{ color: currentNode.speaker === 'aurelia' ? '#00f0ff' : currentNode.speaker === 'hesper' ? '#ffb000' : '#d946ef', height: '8px', animationDelay: '0ms' }} />
            <div className={`w-[2px] rounded-full bg-current ${displayedText.length < currentNode.text.length && !currentNode.id.startsWith('idle') ? 'animate-bounce' : 'h-1'}`} style={{ color: currentNode.speaker === 'aurelia' ? '#00f0ff' : currentNode.speaker === 'hesper' ? '#ffb000' : '#d946ef', height: '12px', animationDelay: '100ms' }} />
            <div className={`w-[2px] rounded-full bg-current ${displayedText.length < currentNode.text.length && !currentNode.id.startsWith('idle') ? 'animate-bounce' : 'h-1'}`} style={{ color: currentNode.speaker === 'aurelia' ? '#00f0ff' : currentNode.speaker === 'hesper' ? '#ffb000' : '#d946ef', height: '6px', animationDelay: '200ms' }} />
            <div className={`w-[2px] rounded-full bg-current ${displayedText.length < currentNode.text.length && !currentNode.id.startsWith('idle') ? 'animate-bounce' : 'h-1'}`} style={{ color: currentNode.speaker === 'aurelia' ? '#00f0ff' : currentNode.speaker === 'hesper' ? '#ffb000' : '#d946ef', height: '10px', animationDelay: '50ms' }} />
          </div>
        </div>

        {isSequencePlaying ? (
          <button 
            onClick={skipDialogueSequence}
            className="text-textMuted hover:text-error text-[8px] uppercase font-bold transition-colors cursor-pointer border border-transparent hover:border-error/20 px-1.5 py-0.5 rounded font-mono"
          >
            [ Skip Transmission ]
          </button>
        ) : (
          <span className="text-success/70 text-[8px] font-bold tracking-widest animate-pulse font-mono">// SECURE CHANNEL</span>
        )}
      </div>

      {/* Main Dialogue text body */}
      <div className="text-[10px] leading-relaxed text-textMain min-h-[40px] whitespace-pre-wrap select-text font-mono flex-grow pr-1 overflow-y-auto">
        {displayedText}
        {displayedText.length < currentNode.text.length && (
          <span className="w-1.5 h-3 bg-primary inline-block ml-0.5 animate-ping"></span>
        )}
      </div>

      {/* Advance button */}
      {isSequencePlaying && (
        <div className="flex justify-end pt-2 select-none border-t border-primary/10 mt-2">
          <button
            onClick={handleNextClick}
            className="bg-primary/5 border border-primary/30 text-primary hover:bg-primary hover:text-background text-[8px] font-bold uppercase py-0.5 px-3 rounded transition-all cursor-pointer font-mono tracking-widest"
          >
            {displayedText.length < currentNode.text.length ? '[ Skip Typing ]' : '[ Next Objective ]'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DialogueFeed;
