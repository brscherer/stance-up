import type { StanceAnalysisResult } from './types';

export interface FeedbackResult {
  topCues: string[];
  summary: string;
}

const GOOD_SUMMARIES = [
  'Your stance looks solid — keep maintaining these fundamentals.',
  'Strong stance fundamentals. Stay consistent with this structure.',
  'Excellent base. Your Muay Thai stance is well-structured.',
];

const WARN_SUMMARIES = [
  'Your stance has room for improvement. Focus on the cues below.',
  'Decent foundation, but a few adjustments will sharpen your stance.',
  'You\'re close — dial in these details for a tighter stance.',
];

const BAD_SUMMARIES = [
  'Your stance needs work. Start with the top cues below.',
  'Significant stance issues detected. Address the priority corrections.',
  'Reset your stance and focus on the fundamentals first.',
];

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
    summary = pickRandom(GOOD_SUMMARIES);
  } else if (overallScore >= 60) {
    summary = pickRandom(WARN_SUMMARIES);
  } else {
    summary = pickRandom(BAD_SUMMARIES);
  }

  summary += ` Overall score: ${overallScore}/100.`;

  return { topCues, summary };
}
