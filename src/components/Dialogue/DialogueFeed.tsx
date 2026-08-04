import { useEffect, useState, useRef } from 'react';
import { useDialogueStore, type DialogueNode } from '../../store/dialogueStore';
import { useAudioStore } from '../../store/audioStore';

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

  // Dynamic Audio Ducking during active dialogue sequences
  useEffect(() => {
    try {
      const { setAudioDucking } = useAudioStore.getState();
      setAudioDucking(isSequencePlaying);
    } catch (e) {}
  }, [isSequencePlaying]);

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

    const playTick = () => {
      try {
        const { playVoiceClick } = useAudioStore.getState();
        playVoiceClick(currentNode.speaker);
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
    aurelia: 'AURELIA',
    hesper: 'HESPER',
    kaelen: 'KAELEN',
    byte: 'BYTE',
    valkyrie: 'VALKYRIE',
    cyra: 'CYRA',
    lyra: 'LYRA',
    solene: 'SOLENE',
    vance: 'VANCE',
    operator: 'FRAGMENT'
  };

  const speakerColors: Record<string, string> = {
    aurelia: 'text-[#00f0ff]',
    hesper: 'text-[#ffb000]',
    kaelen: 'text-[#d946ef]',
    valkyrie: 'text-[#ff0033]',
    cyra: 'text-[#e0115f]',
    lyra: 'text-[#00ff88]',
    solene: 'text-[#ffb700]',
    vance: 'text-[#0066ff]',
    byte: 'text-red-400',
    operator: 'text-slate-300'
  };

  return (
    <div onClick={handleNextClick} className="cyber-glass-panel w-full p-4 font-mono flex flex-col justify-between relative z-20 shrink-0 select-none cursor-pointer">
      {/* Top Header Row of dialogue box */}
      <div className="flex justify-between items-center pb-2 mb-2 select-none">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-widest ${speakerColors[currentNode.speaker] || speakerColors.operator}`}>
            {speakerNameMap[currentNode.speaker] || 'AURELIA'}
          </span>
          
          {/* Animated audio visualizer waveform equalizers */}
          <div className="flex items-end gap-1 h-3.5 px-2 py-0.5 rounded bg-[#00f0ff]/5 border border-[#00f0ff]/20">
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-1`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-2`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-3`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-4`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-5`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-2`} />
            <div className={`w-[2px] bg-[#00f0ff] rounded-sm eq-bar-4`} />
          </div>
        </div>

        {isSequencePlaying && (
          <button 
            onClick={skipDialogueSequence}
            className="text-textMuted hover:text-error text-[9px] uppercase font-bold transition-colors cursor-pointer border border-transparent hover:border-error/20 px-1.5 py-0.5 rounded font-mono"
          >
            [ Skip ]
          </button>
        )}
      </div>

      {/* Main Dialogue text body */}
      <div className="text-[11.5px] leading-relaxed text-textMain min-h-[44px] whitespace-pre-wrap select-text font-mono flex-grow pr-1">
        {displayedText}
        {displayedText.length < currentNode.text.length && (
          <span className="w-1.5 h-3.5 bg-primary inline-block ml-1 animate-pulse"></span>
        )}
      </div>

      {/* Bottom right indicator */}
      <div className="flex justify-end pt-1 text-[10px] text-[#00f0ff]/60 tracking-widest font-bold">
        ...
      </div>
    </div>
  );
};

export default DialogueFeed;
