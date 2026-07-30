import { create } from 'zustand';

export interface DialogueNode {
  id: string;
  speaker: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator';
  text: string;
  voiceUrl?: string;
  expression?: 'neutral' | 'worried' | 'angry' | 'glitch' | 'talking' | 'explaining' | 'exhausted';
  typingSpeed?: number; // Base speed per character in milliseconds
  pauseIndices?: Record<number, number>; // Map character index to pause duration in ms (e.g., { 10: 500 } pauses for 500ms at character 10)
  interruptsPrevious?: boolean; // Clips active comms immediately
}

export interface ChatMessage {
  id: string;
  sender: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'operator';
  text: string;
  timestamp: string;
  isGlitched?: boolean;
}

interface DialogueStore {
  messageHistory: ChatMessage[];
  activeSequence: DialogueNode[] | null;
  currentNodeIndex: number;
  isSequencePlaying: boolean;
  activeSpeaker: string | null;
  activeExpression: string | null;
  isTextTyping: boolean;
  
  // Actions
  startDialogueSequence: (sequence: DialogueNode[]) => void;
  advanceDialogue: () => void;
  skipDialogueSequence: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsTextTyping: (isTyping: boolean) => void;
  clearHistory: () => void;
}

export const useDialogueStore = create<DialogueStore>((set, get) => ({
  messageHistory: [
    {
      id: 'init-0',
      sender: 'aurelia',
      text: 'SYSTEM: Tactical OS Daemon [AURELIA-v2.6] loaded.\r\nSynaptic link established. Ready to assist with active operation directives.',
      timestamp: new Date().toLocaleTimeString(),
    }
  ],
  activeSequence: null,
  currentNodeIndex: -1,
  isSequencePlaying: false,
  activeSpeaker: null,
  activeExpression: 'neutral',
  isTextTyping: false,

  startDialogueSequence: (sequence) => {
    if (sequence.length === 0) return;
    
    const firstNode = sequence[0];
    set({
      activeSequence: sequence,
      currentNodeIndex: 0,
      isSequencePlaying: true,
      activeSpeaker: firstNode.speaker,
      activeExpression: firstNode.expression || 'neutral',
      isTextTyping: true,
    });
  },

  advanceDialogue: () => {
    const { activeSequence, currentNodeIndex } = get();
    if (!activeSequence || currentNodeIndex === -1) return;

    const nextIndex = currentNodeIndex + 1;
    if (nextIndex < activeSequence.length) {
      const nextNode = activeSequence[nextIndex];
      set({
        currentNodeIndex: nextIndex,
        activeSpeaker: nextNode.speaker,
        activeExpression: nextNode.expression || 'neutral',
        isTextTyping: true,
      });
    } else {
      // Sequence completed
      set({
        activeSequence: null,
        currentNodeIndex: -1,
        isSequencePlaying: false,
        activeSpeaker: null,
        isTextTyping: false,
      });
    }
  },

  skipDialogueSequence: () => {
    set({
      activeSequence: null,
      currentNodeIndex: -1,
      isSequencePlaying: false,
      activeSpeaker: null,
      isTextTyping: false,
    });
  },

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    set((state) => ({
      messageHistory: [...state.messageHistory, newMessage],
    }));
  },

  setIsTextTyping: (isTyping) => set({ isTextTyping: isTyping }),

  clearHistory: () => set({ messageHistory: [] }),
}));
