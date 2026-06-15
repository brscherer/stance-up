import { describe, expect, it, vi } from 'vitest';
import { createRollingWindow } from '../analysis/rollingWindow';
import type { StanceAnalysisResult, StanceMetric, StanceMetricStatus } from '../analysis/types';

function createMockResult(overrides: Partial<StanceAnalysisResult> = {}): StanceAnalysisResult {
  return {
    timestampMs: Date.now(),
    overallScore: 85,
    confidence: 0.9,
    metrics: [
      { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
      { id: 'guard-position', label: 'Guard position', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
    ],
    topCues: [],
    ...overrides,
  };
}

describe('createRollingWindow', () => {
  it('starts empty and returns undefined before any frames', () => {
    const window = createRollingWindow({ windowMs: 5000 });
    expect(window.getAggregated()).toBeUndefined();
  });

  it('returns the single frame result when only one frame added', () => {
    const window = createRollingWindow({ windowMs: 5000 });
    const result = createMockResult({ overallScore: 80 });
    window.addFrame(result);

    const aggregated = window.getAggregated();
    expect(aggregated).toBeDefined();
    expect(aggregated!.overallScore).toBe(80);
  });

  it('averages multiple frames within the window', () => {
    const window = createRollingWindow({ windowMs: 5000 });
    window.addFrame(createMockResult({ overallScore: 80 }));
    window.addFrame(createMockResult({ overallScore: 90 }));

    const aggregated = window.getAggregated();
    expect(aggregated).toBeDefined();
    expect(aggregated!.overallScore).toBe(85);
  });

  it('a single noisy frame does not dominate - old frames expire', () => {
    const clock = vi.useFakeTimers();
    const window = createRollingWindow({ windowMs: 5000 });

    // Add a good frame at time 0
    clock.setSystemTime(0);
    window.addFrame(createMockResult({ overallScore: 90, timestampMs: 0 }));

    // Add a bad frame at time 1000
    clock.setSystemTime(1000);
    window.addFrame(createMockResult({ overallScore: 30, timestampMs: 1000 }));

    // At time 2000, both frames are in window, average should be 60
    clock.setSystemTime(2000);
    let aggregated = window.getAggregated(2000);
    expect(aggregated!.overallScore).toBe(60);

    // At time 6000, the first frame expires, only bad frame remains
    clock.setSystemTime(6000);
    aggregated = window.getAggregated(6000);
    expect(aggregated!.overallScore).toBe(30);

    clock.useRealTimers();
  });

  it('repeated hand drops reduce guard score over time', () => {
    const clock = vi.useFakeTimers();
    const window = createRollingWindow({ windowMs: 5000 });

    // Start with good guard
    clock.setSystemTime(0);
    window.addFrame(createMockResult({
      overallScore: 85,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
      ],
      timestampMs: 0,
    }));

    // Add frames with dropping guard
    clock.setSystemTime(1000);
    window.addFrame(createMockResult({
      overallScore: 70,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'bad', score: 40, confidence: 0.9, message: 'Dropped', correction: 'Keep hands up' },
      ],
      timestampMs: 1000,
    }));

    clock.setSystemTime(2000);
    window.addFrame(createMockResult({
      overallScore: 65,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'bad', score: 35, confidence: 0.9, message: 'Dropped', correction: 'Keep hands up' },
      ],
      timestampMs: 2000,
    }));

    // The aggregated guard score should reflect the repeated drops
    const aggregated = window.getAggregated();
    expect(aggregated).toBeDefined();
    const guardMetric = aggregated!.metrics.find(m => m.id === 'guard-position');
    expect(guardMetric).toBeDefined();
    expect(guardMetric!.score).toBeLessThan(70); // Should be pulled down by repeated drops

    clock.useRealTimers();
  });

  it('confidence-weighted average favors high-confidence frames', () => {
    const window = createRollingWindow({ windowMs: 5000 });
    window.addFrame(createMockResult({
      overallScore: 90,
      confidence: 0.9,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
      ],
    }));
    window.addFrame(createMockResult({
      overallScore: 50,
      confidence: 0.2,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'unknown', score: 50, confidence: 0.2, message: 'Unsure', correction: undefined },
      ],
    }));

    const aggregated = window.getAggregated();
    // High confidence frame should dominate
    expect(aggregated!.overallScore).toBeGreaterThan(80);
  });

  it('tracks stability metrics for ankle, hip, head, and hand drift', () => {
    const window = createRollingWindow({ windowMs: 5000 });
    const baseMetrics: StanceMetric[] = [
      { id: 'base-width', label: 'Base width', status: 'good' as StanceMetricStatus, score: 90, confidence: 0.9, message: 'Good', correction: undefined },
      { id: 'ankle', label: 'Ankle', status: 'good' as StanceMetricStatus, score: 85, confidence: 0.9, message: 'Good', correction: undefined },
      { id: 'hip', label: 'Hip', status: 'good' as StanceMetricStatus, score: 85, confidence: 0.9, message: 'Good', correction: undefined },
      { id: 'head', label: 'Head', status: 'good' as StanceMetricStatus, score: 85, confidence: 0.9, message: 'Good', correction: undefined },
      { id: 'hand', label: 'Hand', status: 'good' as StanceMetricStatus, score: 85, confidence: 0.9, message: 'Good', correction: undefined },
    ];
    window.addFrame(createMockResult({ overallScore: 85, metrics: baseMetrics }));
    window.addFrame(createMockResult({ overallScore: 85, metrics: baseMetrics }));

    const aggregated = window.getAggregated();
    expect(aggregated).toBeDefined();
    // Debug: log all metric IDs
    console.log('Aggregated metrics:', aggregated!.metrics.map(m => m.id));
    // Should include stability metrics
    expect(aggregated!.metrics.some(m => m.id === 'stability-ankle')).toBe(true);
    expect(aggregated!.metrics.some(m => m.id === 'stability-hip')).toBe(true);
    expect(aggregated!.metrics.some(m => m.id === 'stability-head')).toBe(true);
    expect(aggregated!.metrics.some(m => m.id === 'stability-hand')).toBe(true);
  });
});
