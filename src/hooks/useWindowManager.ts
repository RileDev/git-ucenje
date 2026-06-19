import { useCallback, useState } from 'react';
import type { WindowState } from '../types';

export function useWindowManager(initial: WindowState[]) {
  const [windows, setWindows] = useState<WindowState[]>(initial);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => ({
      ...w,
      active: w.id === id,
      isMinimized: w.id === id ? false : w.isMinimized,
    })));
  }, []);

  const toggleWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const nextOpen = !w.isOpen;
        return { ...w, isOpen: nextOpen, isMinimized: false, active: nextOpen };
      }
      return { ...w, active: false };
    }));
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isOpen: false } : w)));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true, active: false } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  }, []);

  return {
    windows,
    setWindows,
    focusWindow,
    toggleWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
  };
}
