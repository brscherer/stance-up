import type { StanceMetric, StanceAnalysisResult } from './types';

export interface RollingWindowConfig {
  windowMs: number;
}

export interface RollingWindow {
  addFrame(result: StanceAnalysisResult): void;
  getAggregated(currentTime?: number): StanceAnalysisResult | undefined;
  clear(): void;
}

interface FrameWithMetrics {
  timestampMs: number;
  overallScore: number;
  confidence: number;
  metrics: StanceMetric[];
}

function confidenceWeightedAverage(values: number[], weights: number[]): number {
  const sum = values.reduce((acc, v, i) => acc + v * weights[i], 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return weightSum === 0 ? 0 : sum / weightSum;
}

function aggregateMetric(frames: FrameWithMetrics[], metricId: string): StanceMetric {
  const values: number[] = [];
  const weights: number[] = [];
  let label = '';
  let message = '';
  let correction: string | undefined;

  for (const frame of frames) {
    const metric = frame.metrics.find(m => m.id === metricId);
    if (metric) {
      values.push(metric.score);
      weights.push(metric.confidence);
      label = metric.label;
      message = metric.message;
      correction = metric.correction;
    }
  }

  if (values.length === 0) {
    return { id: metricId, label, status: 'unknown', score: 0, confidence: 0, message: 'No data' };
  }

  const avgScore = Math.round(confidenceWeightedAverage(values, weights));
  const avgConfidence = weights.reduce((a, b) => a + b, 0) / weights.length;

  let status: StanceMetric['status'] = 'good';
  if (avgScore < 50) status = 'bad';
  else if (avgScore < 75) status = 'warn';

  return {
    id: metricId,
    label,
    status,
    score: avgScore,
    confidence: avgConfidence,
    message,
    correction,
  };
}

function computeStability(frames: FrameWithMetrics[], metricId: string, label: string): StanceMetric {
  if (frames.length < 2) {
    return { id: `stability-${metricId}`, label, status: 'unknown', score: 100, confidence: 0.5, message: 'Need more frames' };
  }

  const values = frames.map(f => {
    const m = f.metrics.find(m => m.id === metricId);
    return m ? m.score : null;
  }).filter((v): v is number => v !== null);

  if (values.length < 2) {
    return { id: `stability-${metricId}`, label, status: 'unknown', score: 100, confidence: 0.5, message: 'Need more frames' };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stabilityScore = Math.max(0, 100 - variance * 2);

  let status: StanceMetric['status'] = 'good';
  if (stabilityScore < 50) status = 'bad';
  else if (stabilityScore < 75) status = 'warn';

  return {
    id: `stability-${metricId}`,
    label,
    status,
    score: Math.round(stabilityScore),
    confidence: 0.8,
    message: stabilityScore > 75 ? 'Stable' : stabilityScore > 50 ? 'Some drift detected' : 'Unstable',
  };
}

export function createRollingWindow(config: RollingWindowConfig): RollingWindow {
  const { windowMs } = config;
  let frames: FrameWithMetrics[] = [];
  let lastKnownTime = 0;

  return {
    addFrame(result: StanceAnalysisResult): void {
      const now = result.timestampMs;
      lastKnownTime = now;
      frames.push({
        timestampMs: now,
        overallScore: result.overallScore,
        confidence: result.confidence,
        metrics: result.metrics,
      });

      frames = frames.filter(f => now - f.timestampMs <= windowMs);
    },

    getAggregated(currentTime?: number): StanceAnalysisResult | undefined {
      if (frames.length === 0) return undefined;

      const now = currentTime ?? lastKnownTime;
      const validFrames = frames.filter(f => now - f.timestampMs <= windowMs);

      if (validFrames.length === 0) return undefined;

      const overallScores = validFrames.map(f => f.overallScore);
      const confidences = validFrames.map(f => f.confidence);
      const overallScore = Math.round(confidenceWeightedAverage(overallScores, confidences));
      const confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

      const metricIds = new Set<string>();
      for (const frame of validFrames) {
        for (const metric of frame.metrics) {
          metricIds.add(metric.id);
        }
      }

      metricIds.add('stability-ankle');
      metricIds.add('stability-hip');
      metricIds.add('stability-head');
      metricIds.add('stability-hand');

      const metrics: StanceMetric[] = [];
      for (const metricId of metricIds) {
        if (metricId.startsWith('stability-')) {
          const baseId = metricId.replace('stability-', '');
          metrics.push(computeStability(validFrames, baseId, `Stability: ${baseId}`));
        } else {
          metrics.push(aggregateMetric(validFrames, metricId));
        }
      }

      const sortedMetrics = [...metrics]
        .filter(m => m.status === 'bad' || m.status === 'warn')
        .sort((a, b) => a.score - b.score);

      const topCues = sortedMetrics
        .slice(0, 3)
        .map(m => m.correction || m.message)
        .filter((c): c is string => !!c);

      return {
        timestampMs: now,
        overallScore,
        confidence,
        metrics,
        topCues,
      };
    },

    clear(): void {
      frames = [];
    },
  };
}