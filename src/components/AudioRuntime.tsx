import { useEffect } from 'react';
import { sound } from '../utils/audioSynth';
import { usePreferences } from '../store/preferencesStore';

export function AudioRuntime() {
  const prefs = usePreferences();
  useEffect(() => {
    const unlock = () => sound.initialize();
    const click = (event: MouseEvent) => { if ((event.target as HTMLElement).closest('button,a,[role="tab"]')) sound.playClick(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('click', click);
    document.addEventListener('visibilitychange', sound.visibility);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); window.removeEventListener('click', click); document.removeEventListener('visibilitychange', sound.visibility); };
  }, []);
  useEffect(() => {
    sound.sync();
    document.documentElement.dataset.scanlines = String(prefs.scanlines);
    document.documentElement.dataset.reducedMotion = String(prefs.reducedMotion);
    if (prefs.muted || !prefs.voice) window.speechSynthesis?.cancel();
  }, [prefs]);
  return null;
}
