import { usePreferences } from '../store/preferencesStore';

export function speakAurelia(text: string, onEnd: () => void, onStart?: () => void) {
  const prefs = usePreferences.getState();
  if (!prefs.voice || prefs.muted || !('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(voice => /zira|aria|sonia|samantha|jenny/i.test(voice.name)) ?? voices.find(voice => voice.lang.startsWith('en')) ?? null;
  utterance.rate = .88; utterance.pitch = .96; utterance.volume = prefs.voiceVolume * prefs.master;
  utterance.onstart = () => onStart?.(); utterance.onend = onEnd; utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
  return true;
}
