import { useEffect, useState, useRef } from 'react';
import { useDialogueStore, type DialogueNode } from '../../store/dialogueStore';
import { CharacterPortrait } from './CharacterPortrait';

export const DialogueFeed = () => {
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

  const currentNode = activeSequence && currentNodeIndex >= 0 ? activeSequence[currentNodeIndex] : null;

  useEffect(() => {
    if (!currentNode) {
      setDisplayedText('');
      return;
    }

    activeNodeRef.current = currentNode;
    setDisplayedText('');
    setIsTextTyping(true);

    const text = currentNode.text;
    const typingSpeed = currentNode.typingSpeed || 25; // 25ms per character default
    const pauseIndices = currentNode.pauseIndices || {};
    let currentCharIndex = 0;
    let accumulatedText = '';

    // Voice log trigger (basic fallback audio node)
    let audio: HTMLAudioElement | null = null;
    if (currentNode.voiceUrl) {
      audio = new Audio(currentNode.voiceUrl);
      audio.volume = 0.8;
      audio.play().catch((err) =>
        console.log('Voice audio autoplay blocked or file pending:', err)
      );
    }

    const typeNextChar = () => {
      if (activeNodeRef.current !== currentNode) {
        if (audio) {
          audio.pause();
        }
        return;
      }

      if (currentCharIndex < text.length) {
        const char = text[currentCharIndex];
        accumulatedText += char;
        setDisplayedText(accumulatedText);

        const pauseDuration = pauseIndices[currentCharIndex];
        currentCharIndex++;

        if (pauseDuration) {
          typingTimerRef.current = setTimeout(typeNextChar, pauseDuration);
        } else {
          typingTimerRef.current = setTimeout(typeNextChar, typingSpeed);
        }
      } else {
        setIsTextTyping(false);
        // Automatically save to log when text finishes typing
        addMessage({
          sender: currentNode.speaker,
          text: currentNode.text,
        });
      }
    };

    typingTimerRef.current = setTimeout(typeNextChar, typingSpeed);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (audio) {
        audio.pause();
      }
    };
  }, [currentNodeIndex, activeSequence, addMessage, setIsTextTyping]);

  const handleNextClick = () => {
    if (!currentNode) return;
    
    const isFinished = displayedText.length >= currentNode.text.length;
    
    if (!isFinished) {
      // Force complete typing if clicked early
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setDisplayedText(currentNode.text);
      setIsTextTyping(false);
      addMessage({
        sender: currentNode.speaker,
        text: currentNode.text,
      });
    } else {
      advanceDialogue();
    }
  };

  if (!isSequencePlaying || !currentNode) return null;

  const speakerNameMap: Record<string, string> = {
    aurelia: 'Tactical Daemon: Aurelia',
    hesper: 'Dr. Arthur Hesper',
    kaelen: 'The Chorus (Kaelen)',
    byte: 'Utility Script: Byte',
    operator: 'Operator (Fragment)'
  };

  const speakerColors: Record<string, string> = {
    aurelia: 'text-primary border-primary/30 bg-primary/5',
    hesper: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
    kaelen: 'text-secondary border-secondary/30 bg-secondary/5',
    byte: 'text-green-400 border-green-400/30 bg-green-400/5',
    operator: 'text-textMain border-primary/20 bg-[#171721]'
  };

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-[#07070a]/95 border border-primary/40 rounded-lg p-4 font-mono shadow-[0_0_25px_rgba(0,240,255,0.2)] z-50 flex gap-4 items-center CRT-glow">
      {/* Stage Area: Multi-Character Co-presence */}
      <div className="flex gap-2 shrink-0 items-center justify-center select-none">
        {/* Main Speaker Portrait */}
        <div className="w-20 h-20 rounded border border-primary/25 overflow-hidden bg-[#0a0a0f]/90 relative shadow-inner transition-all duration-300 scale-105 shadow-[0_0_15px_rgba(0,240,255,0.15)] z-10">
          <CharacterPortrait 
            speaker={currentNode.speaker} 
            expression={currentNode.expression || 'neutral'} 
            isTyping={displayedText.length < currentNode.text.length} 
          />
        </div>
        
        {/* Co-Speaker Portrait */}
        {currentNode.coSpeaker && (
          <div className="w-16 h-16 rounded border border-primary/10 overflow-hidden bg-[#0a0a0f]/60 relative shadow-inner opacity-45 blur-[0.8px] transition-all duration-300 scale-95 z-0">
            <CharacterPortrait 
              speaker={currentNode.coSpeaker} 
              expression={currentNode.coSpeakerExpression || 'neutral'} 
              isTyping={false} 
            />
          </div>
        )}
      </div>

      {/* Right Column: Dialogue Info & Text */}
      <div className="flex-grow flex flex-col justify-between min-w-0">
        <div className="flex justify-between items-center border-b border-primary/20 pb-1.5 mb-2">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${speakerColors[currentNode.speaker] || speakerColors.operator}`}>
            {speakerNameMap[currentNode.speaker] || 'Unknown Origin'}
          </span>
          <button 
            onClick={skipDialogueSequence}
            className="text-textMuted hover:text-error text-[8px] uppercase font-bold transition-colors cursor-pointer border border-transparent hover:border-error/20 px-1 rounded font-mono"
          >
            [ Skip Transmission ]
          </button>
        </div>

        <div className="text-[11px] leading-relaxed text-textMain min-h-[44px] whitespace-pre-wrap select-text font-mono flex-grow pr-1 overflow-y-auto">
          {displayedText}
          {displayedText.length < currentNode.text.length && (
            <span className="w-1.5 h-3.5 bg-primary inline-block ml-0.5 animate-pulse"></span>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleNextClick}
            className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background text-[9px] font-bold uppercase py-1 px-3.5 rounded transition-all cursor-pointer shadow-neon font-mono"
          >
            {displayedText.length < currentNode.text.length ? '[ Fast Forward ]' : '[ Next ]'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DialogueFeed;
