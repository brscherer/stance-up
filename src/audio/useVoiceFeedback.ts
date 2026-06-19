import { useEffect, useRef } from 'react';
import { speak, prime } from './voiceFeedback';
import { getLocale } from '../i18n/t';
import type { StanceAnalysisResult } from '../analysis/types';

const localeToVoice: Record<string, string> = {
  'en': 'en-US',
  'pt-BR': 'pt-BR',
};

const SPEAK_INTERVAL_MS = 8000;

export function useVoiceFeedback(
  latestResult: StanceAnalysisResult | null,
  isSessionActive: boolean,
): void {
  const lastSpokenRef = useRef<string>('');
  const lastSpokenAtRef = useRef<number>(0);

  useEffect(() => {
    if (!isSessionActive && latestResult) {
      const score = latestResult.overallScore;
      const msg = score >= 80 ? 'Session Complete' : 'Session Complete';
      speak(msg);
    }
  }, [isSessionActive, latestResult]);

  useEffect(() => {
    prime();
  }, []);

  useEffect(() => {
    if (!isSessionActive || !latestResult) return;

    const { topCues } = latestResult;
    if (!topCues || topCues.length === 0) return;

    const now = Date.now();
    const cue = topCues[0];
    if (cue === lastSpokenRef.current && now - lastSpokenAtRef.current < SPEAK_INTERVAL_MS) return;

    lastSpokenRef.current = cue;
    lastSpokenAtRef.current = now;

    const locale = getLocale();
    const voiceLang = localeToVoice[locale] || 'en-US';
    speak(cue, voiceLang);
  }, [latestResult, isSessionActive]);
}
