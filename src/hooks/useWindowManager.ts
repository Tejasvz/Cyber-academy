import { useState, useEffect, useCallback } from 'react';
import type { WindowId, WindowState } from '../types';

export type { WindowId, WindowState };

const STORAGE_KEY = 'project-veil:window-layout';

export const INITIAL_WINDOW_STATE: Record<WindowId, WindowState> = {
  mission: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  operator: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  terminal: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  notifications: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  integrity: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  intel: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  secure: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 2 },
  dialogue: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 3 },
};

export const WINDOW_TITLES: Record<WindowId, string> = {
  mission: 'CURRENT MISSION',
  operator: 'OPERATOR STATUS',
  terminal: 'TERMINAL CONSOLE',
  notifications: 'AI NOTIFICATIONS',
  integrity: 'SYSTEM INTEGRITY',
  intel: 'RECENT INTEL',
  secure: 'SECURE CHANNEL',
  dialogue: 'AURELIA HANDLER',
};

export const useWindowManager = () => {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(() => {
    if (typeof window === 'undefined') return INITIAL_WINDOW_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_WINDOW_STATE, ...parsed };
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_WINDOW_STATE;
  });

  const [, setTopZIndex] = useState(10);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
    } catch {
      // ignore
    }
  }, [windows]);

  const focusWindow = useCallback((id: WindowId) => {
    setTopZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) => ({
        ...curr,
        [id]: { ...curr[id], zIndex: nextZ },
      }));
      return nextZ;
    });
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindows((curr) => ({
      ...curr,
      [id]: { ...curr[id], isMinimized: true, isMaximized: false },
    }));
  }, []);

  const maximizeWindow = useCallback((id: WindowId) => {
    setWindows((curr) => {
      const isMax = !curr[id].isMaximized;
      return {
        ...curr,
        [id]: { ...curr[id], isMaximized: isMax, isMinimized: false },
      };
    });
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setWindows((curr) => ({
      ...curr,
      [id]: { ...curr[id], isOpen: false, isMinimized: false, isMaximized: false },
    }));
  }, []);

  const restoreWindow = useCallback((id: WindowId) => {
    setTopZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) => ({
        ...curr,
        [id]: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: nextZ },
      }));
      return nextZ;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setWindows(INITIAL_WINDOW_STATE);
    setTopZIndex(10);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const minimizedList = Object.entries(windows)
    .filter(([_, state]) => !state.isOpen || state.isMinimized)
    .map(([id]) => id as WindowId);

  return {
    windows,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    restoreWindow,
    resetLayout,
    minimizedList,
  };
};
