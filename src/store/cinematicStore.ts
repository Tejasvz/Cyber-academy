import { create } from 'zustand';
import { useDialogueStore } from './dialogueStore';

export type CameraFocusMode = 'default' | 'hologram_close' | 'wide_overview';
export type EnvironmentLightingMode = 'normal' | 'breach' | 'override' | 'hijack';

interface CinematicStore {
  activeCinematicEvent: string | null;
  isCinematicActive: boolean;
  cameraFocus: CameraFocusMode;
  environmentLighting: EnvironmentLightingMode;
  lightingColor: string;
  isInterrupted: boolean;
  interruptedBy: string | null;

  // Actions
  startCinematicEvent: (eventId: string, focus?: CameraFocusMode, lightingColor?: string) => void;
  triggerInterruption: (
    bySpeaker: 'aurelia' | 'hesper' | 'kaelen' | 'byte' | 'valkyrie' | 'cyra' | 'lyra' | 'solene' | 'vance',
    text: string,
    expression?: string
  ) => void;
  endCinematicEvent: () => void;
  setEnvironmentLighting: (mode: EnvironmentLightingMode, color?: string) => void;
  setCameraFocus: (focus: CameraFocusMode) => void;
}

export const useCinematicStore = create<CinematicStore>((set) => ({
  activeCinematicEvent: null,
  isCinematicActive: false,
  cameraFocus: 'default',
  environmentLighting: 'normal',
  lightingColor: '#00f0ff',
  isInterrupted: false,
  interruptedBy: null,

  startCinematicEvent: (eventId, focus = 'hologram_close', lightingColor = '#00f0ff') => {
    set({
      activeCinematicEvent: eventId,
      isCinematicActive: true,
      cameraFocus: focus,
      lightingColor,
      isInterrupted: false,
      interruptedBy: null,
    });
  },

  triggerInterruption: (bySpeaker, text, expression = 'glitch') => {
    set({
      isInterrupted: true,
      interruptedBy: bySpeaker,
      lightingColor:
        bySpeaker === 'kaelen'
          ? '#d946ef'
          : bySpeaker === 'valkyrie' || bySpeaker === 'cyra'
          ? '#ff0033'
          : bySpeaker === 'hesper'
          ? '#ffb000'
          : '#00f0ff',
      environmentLighting: 'hijack',
    });

    // Inject interrupting dialogue node directly into the dialogue store
    const dialogueStore = useDialogueStore.getState();
    dialogueStore.startDialogueSequence([
      {
        id: `interrupt-${Date.now()}`,
        speaker: bySpeaker,
        text: `[SIGNAL INTERRUPTED] ${bySpeaker.toUpperCase()}: "${text}"`,
        expression: expression as any,
        typingSpeed: 18,
        interruptsPrevious: true,
      },
    ]);
  },

  endCinematicEvent: () => {
    set({
      activeCinematicEvent: null,
      isCinematicActive: false,
      cameraFocus: 'default',
      environmentLighting: 'normal',
      lightingColor: '#00f0ff',
      isInterrupted: false,
      interruptedBy: null,
    });
  },

  setEnvironmentLighting: (mode, color) => {
    set({
      environmentLighting: mode,
      lightingColor: color || (mode === 'breach' ? '#ff0033' : mode === 'hijack' ? '#d946ef' : mode === 'override' ? '#ffb000' : '#00f0ff'),
    });
  },

  setCameraFocus: (focus) => {
    set({ cameraFocus: focus });
  },
}));

export default useCinematicStore;
