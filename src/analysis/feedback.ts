import type { StanceAnalysisResult } from './types';
import { t } from '../i18n/t';

export interface FeedbackResult {
  topCues: string[];
  summary: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFeedback(result: StanceAnalysisResult): FeedbackResult {
  const { overallScore, metrics } = result;

  const issues = metrics
    .filter(m => m.status === 'bad' || m.status === 'warn')
    .sort((a, b) => a.score - b.score);

  const topCues = issues
    .slice(0, 3)
    .map(m => m.correction || m.message)
    .filter((c): c is string => !!c);

  let summary: string;
  if (overallScore >= 80) {
    summary = pickRandom([t('feedback.good0'), t('feedback.good1'), t('feedback.good2')]);
  } else if (overallScore >= 60) {
    summary = pickRandom([t('feedback.warn0'), t('feedback.warn1'), t('feedback.warn2')]);
  } else {
    summary = pickRandom([t('feedback.bad0'), t('feedback.bad1'), t('feedback.bad2')]);
  }

  summary += ` ${t('feedback.scoreSuffix')} ${overallScore}/100.`;

  return { topCues, summary };
}
