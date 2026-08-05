import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowStore {
  windows: Record<string, WindowState>;
  windowOrder: string[];
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  resetLayout: () => void;
}

const INITIAL_WINDOWS: Record<string, WindowState> = {
  terminal: {
    id: 'terminal',
    title: 'Terminal Console v2.6 - operator@cyber-academy',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    x: 30,
    y: 30,
    width: 730,
    height: 440,
  },
  curriculum: {
    id: 'curriculum',
    title: 'Mission Control [Active Curriculum]',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    x: 780,
    y: 30,
    width: 370,
    height: 480,
  },
  lesson: {
    id: 'lesson',
    title: 'Operation Theory Mode [Lesson Lab]',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 100,
    y: 100,
    width: 750,
    height: 480,
  },
  ai_assistant: {
    id: 'ai_assistant',
    title: 'Tactical OS Core: Aurelia',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 780,
    y: 520,
    width: 380,
    height: 400,
  },
  intel_db: {
    id: 'intel_db',
    title: 'Intel Personnel Database [Roster]',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 120,
    y: 60,
    width: 820,
    height: 500,
  },
  sector_map: {
    id: 'sector_map',
    title: 'Sector Zero Strategic Map V2',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 140,
    y: 70,
    width: 880,
    height: 540,
  },
  skill_tree: {
    id: 'skill_tree',
    title: 'Operator Skill Tree & Cyberware Upgrades',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 160,
    y: 80,
    width: 850,
    height: 520,
  },
  mission_briefing: {
    id: 'mission_briefing',
    title: 'Operation Briefing [Black Echo]',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 200,
    y: 90,
    width: 760,
    height: 500,
  },
  tactical_hud: {
    id: 'tactical_hud',
    title: 'Cinematic Tactical HUD V2',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 80,
    y: 40,
    width: 900,
    height: 560,
  },
  mission_results: {
    id: 'mission_results',
    title: 'Mission Complete [Debriefing Summary]',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 220,
    y: 100,
    width: 720,
    height: 480,
  },
  conspiracy: {
    id: 'conspiracy',
    title: 'Intel Linker [Conspiracy Board]',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    x: 180,
    y: 100,
    width: 820,
    height: 520,
  },
};

const getPersistedLayout = (): Record<string, WindowState> => {
  try {
    const saved = localStorage.getItem('operator_os_layout');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that all initial window keys exist in the parsed object
      const allKeysExist = Object.keys(INITIAL_WINDOWS).every(key => parsed[key] !== undefined);
      if (allKeysExist) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached window layout:', e);
  }
  return INITIAL_WINDOWS;
};

const persistLayout = (windows: Record<string, WindowState>) => {
  try {
    localStorage.setItem('operator_os_layout', JSON.stringify(windows));
  } catch (e) {
    console.warn('Failed to cache window layout:', e);
  }
};

export const useWindowStore = create<WindowStore>((set) => ({
  windows: getPersistedLayout(),
  windowOrder: ['curriculum', 'terminal', 'lesson', 'ai_assistant', 'intel_db', 'sector_map', 'skill_tree', 'mission_briefing', 'tactical_hud', 'mission_results', 'conspiracy'],

  openWindow: (id) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};
      
      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          isOpen: true,
          isMinimized: false,
        },
      };

      persistLayout(updatedWindows);

      const updatedOrder = state.windowOrder.filter((wId) => wId !== id);
      updatedOrder.push(id);

      return {
        windows: updatedWindows,
        windowOrder: updatedOrder,
      };
    }),

  closeWindow: (id) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};

      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          isOpen: false,
        },
      };

      persistLayout(updatedWindows);

      return {
        windows: updatedWindows,
      };
    }),

  toggleMinimize: (id) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};

      const nextMinimized = !target.isMinimized;
      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          isMinimized: nextMinimized,
        },
      };

      persistLayout(updatedWindows);

      let updatedOrder = [...state.windowOrder];
      if (!nextMinimized) {
        // Bring to front if we are un-minimizing
        updatedOrder = updatedOrder.filter((wId) => wId !== id);
        updatedOrder.push(id);
      }

      return {
        windows: updatedWindows,
        windowOrder: updatedOrder,
      };
    }),

  toggleMaximize: (id) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};

      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          isMaximized: !target.isMaximized,
        },
      };

      persistLayout(updatedWindows);

      return {
        windows: updatedWindows,
      };
    }),

  bringToFront: (id) =>
    set((state) => {
      if (!state.windows[id]) return {};
      const updatedOrder = state.windowOrder.filter((wId) => wId !== id);
      updatedOrder.push(id);
      return { windowOrder: updatedOrder };
    }),

  updateWindowPosition: (id, x, y) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};

      // Dynamic snapping constraints
      let snapX = x;
      let snapY = y;
      const snapThreshold = 15;

      // Snap to left edge
      if (Math.abs(x) < snapThreshold) {
        snapX = 0;
      }
      // Snap to top edge
      if (Math.abs(y) < snapThreshold) {
        snapY = 0;
      }
      // Snap to right screen boundary
      if (Math.abs(window.innerWidth - (x + target.width)) < snapThreshold) {
        snapX = window.innerWidth - target.width;
      }
      // Snap to bottom taskbar boundary
      if (Math.abs(window.innerHeight - 45 - (y + target.height)) < snapThreshold) {
        snapY = window.innerHeight - 45 - target.height;
      }

      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          x: snapX,
          y: snapY,
        },
      };

      persistLayout(updatedWindows);

      return {
        windows: updatedWindows,
      };
    }),

  updateWindowSize: (id, width, height) =>
    set((state) => {
      const target = state.windows[id];
      if (!target) return {};

      // Enforce minimum dimensions
      const minWidth = 280;
      const minHeight = 200;

      const updatedWindows = {
        ...state.windows,
        [id]: {
          ...target,
          width: Math.max(minWidth, width),
          height: Math.max(minHeight, height),
        },
      };

      persistLayout(updatedWindows);

      return {
        windows: updatedWindows,
      };
    }),

  resetLayout: () =>
    set(() => {
      try {
        localStorage.removeItem('operator_os_layout');
      } catch (e) {
        console.warn('Failed to clear window layout cache:', e);
      }
      return {
        windows: INITIAL_WINDOWS,
        windowOrder: ['curriculum', 'terminal', 'lesson', 'ai_assistant', 'intel_db', 'sector_map', 'skill_tree', 'mission_briefing', 'tactical_hud', 'mission_results', 'conspiracy'],
      };
    }),
}));
