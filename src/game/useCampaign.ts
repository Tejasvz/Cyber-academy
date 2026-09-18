import { useCallback, useRef, useState } from 'react';
import { newCampaign, parseCampaign, type Campaign } from './campaign';

export function useCampaign(userId: string) {
  const key = `project-veil:save:${userId}`;
  const [saveError, setSaveError] = useState('');
  const [campaign, setCampaign] = useState<Campaign>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return parseCampaign(raw);
      const completed = JSON.parse(localStorage.getItem(`project-veil:campaign:${userId}`) ?? '[]');
      return parseCampaign(JSON.stringify({ ...newCampaign(), completed, active: localStorage.getItem(`project-veil:active-mission:${userId}`), ending: localStorage.getItem(`project-veil:ending:${userId}`) }));
    } catch { return newCampaign(); }
  });
  const currentSave = useRef(campaign);
  const update = useCallback((transform: (current: Campaign) => Campaign) => {
    const next = transform(currentSave.current);
    currentSave.current = next;
    try { localStorage.setItem(key, JSON.stringify(next)); setSaveError(''); }
    catch { setSaveError('Local save unavailable. Keep this tab open to retain this session.'); }
    setCampaign(next);
  }, [key]);
  const submitSpeedrunBenchmark = useCallback(async (missionId: string, timeSeconds: number, tracePercent: number) => {
    const entry = { missionId, timeSeconds, tracePercent, timestamp: Date.now() };
    try {
      const existing = JSON.parse(localStorage.getItem(`project-veil:speedruns:${userId}`) ?? '[]');
      localStorage.setItem(`project-veil:speedruns:${userId}`, JSON.stringify([...existing, entry]));
      // Optional cloud leaderboard sync attempt
      await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    } catch { /* Local first fallback */ }
  }, [userId]);

  return { campaign, update, saveError, submitSpeedrunBenchmark };
}

