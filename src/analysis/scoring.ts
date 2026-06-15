import type { StanceMetric } from './types';

export function calculateOverallScore(metrics: StanceMetric[]): number {
  if (metrics.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const metric of metrics) {
    if (metric.confidence > 0) {
      weightedSum += metric.score * metric.confidence;
      totalWeight += metric.confidence;
    }
  }

  if (totalWeight === 0) return 0;

  return Math.round(weightedSum / totalWeight);
}

export function rankIssues(metrics: StanceMetric[]): StanceMetric[] {
  const statusOrder = { bad: 0, warn: 1, unknown: 2, good: 3 };

  return [...metrics].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    if (a.score !== b.score) return a.score - b.score;

    return b.confidence - a.confidence;
  });
}
