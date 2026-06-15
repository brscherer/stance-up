import { describe, expect, it } from 'vitest';
import { calculateOverallScore, rankIssues } from '../analysis/scoring';
import { generateFeedback } from '../analysis/feedback';
import type { StanceMetric, StanceAnalysisResult } from '../analysis/types';

describe('calculateOverallScore', () => {
  it('returns 0 for empty metrics', () => {
    expect(calculateOverallScore([])).toBe(0);
  });

  it('computes confidence-weighted average of metric scores', () => {
    const metrics: StanceMetric[] = [
      { id: 'm1', label: 'Metric 1', status: 'good', score: 90, confidence: 1.0, message: '', correction: undefined },
      { id: 'm2', label: 'Metric 2', status: 'good', score: 80, confidence: 1.0, message: '', correction: undefined },
    ];
    expect(calculateOverallScore(metrics)).toBe(85);
  });

  it('weights high-confidence metrics more heavily', () => {
    const metrics: StanceMetric[] = [
      { id: 'm1', label: 'Metric 1', status: 'good', score: 100, confidence: 1.0, message: '', correction: undefined },
      { id: 'm2', label: 'Metric 2', status: 'bad', score: 0, confidence: 0.1, message: '', correction: undefined },
    ];
    // (100*1 + 0*0.1) / 1.1 = 90.9 -> 91
    expect(calculateOverallScore(metrics)).toBe(91);
  });

  it('ignores unknown metrics (confidence 0)', () => {
    const metrics: StanceMetric[] = [
      { id: 'm1', label: 'Metric 1', status: 'good', score: 90, confidence: 1.0, message: '', correction: undefined },
      { id: 'm2', label: 'Metric 2', status: 'unknown', score: 0, confidence: 0, message: '', correction: undefined },
    ];
    expect(calculateOverallScore(metrics)).toBe(90);
  });
});

describe('rankIssues', () => {
  it('returns empty array for empty metrics', () => {
    expect(rankIssues([])).toEqual([]);
  });

  it('ranks bad status before warn before unknown', () => {
    const metrics: StanceMetric[] = [
      { id: 'good', label: 'Good', status: 'good', score: 90, confidence: 1.0, message: '', correction: undefined },
      { id: 'warn', label: 'Warn', status: 'warn', score: 70, confidence: 1.0, message: '', correction: 'Fix it' },
      { id: 'bad', label: 'Bad', status: 'bad', score: 30, confidence: 1.0, message: '', correction: 'Fix it now' },
      { id: 'unknown', label: 'Unknown', status: 'unknown', score: 0, confidence: 0, message: '', correction: undefined },
    ];
    const ranked = rankIssues(metrics);
    expect(ranked[0].id).toBe('bad');
    expect(ranked[1].id).toBe('warn');
    expect(ranked[2].id).toBe('unknown');
    expect(ranked[3].id).toBe('good');
  });

  it('within same status, lower score ranks higher (worse first)', () => {
    const metrics: StanceMetric[] = [
      { id: 'bad1', label: 'Bad 1', status: 'bad', score: 40, confidence: 1.0, message: '', correction: 'Fix' },
      { id: 'bad2', label: 'Bad 2', status: 'bad', score: 20, confidence: 1.0, message: '', correction: 'Fix' },
    ];
    const ranked = rankIssues(metrics);
    expect(ranked[0].id).toBe('bad2'); // worse score first
    expect(ranked[1].id).toBe('bad1');
  });

  it('within same status and score, higher confidence ranks higher', () => {
    const metrics: StanceMetric[] = [
      { id: 'lowConf', label: 'Low Conf', status: 'bad', score: 30, confidence: 0.5, message: '', correction: 'Fix' },
      { id: 'highConf', label: 'High Conf', status: 'bad', score: 30, confidence: 1.0, message: '', correction: 'Fix' },
    ];
    const ranked = rankIssues(metrics);
    expect(ranked[0].id).toBe('highConf');
  });
});

describe('generateFeedback', () => {
  it('returns empty cues for all-good metrics', () => {
    const result: StanceAnalysisResult = {
      timestampMs: Date.now(),
      overallScore: 95,
      confidence: 0.9,
      metrics: [
        { id: 'm1', label: 'Good', status: 'good', score: 95, confidence: 0.9, message: 'Good', correction: undefined },
      ],
      topCues: [],
    };
    const feedback = generateFeedback(result);
    expect(feedback.topCues).toEqual([]);
    expect(feedback.summary).toMatch(/solid|strong|excellent/i);
  });

  it('generates cues from bad and warn metrics with corrections', () => {
    const result: StanceAnalysisResult = {
      timestampMs: Date.now(),
      overallScore: 60,
      confidence: 0.9,
      metrics: [
        { id: 'm1', label: 'Bad', status: 'bad', score: 30, confidence: 0.9, message: 'Bad', correction: 'Fix this bad thing' },
        { id: 'm2', label: 'Warn', status: 'warn', score: 65, confidence: 0.9, message: 'Warn', correction: 'Fix this warn thing' },
        { id: 'm3', label: 'Good', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
      ],
      topCues: [],
    };
    const feedback = generateFeedback(result);
    expect(feedback.topCues).toContain('Fix this bad thing');
    expect(feedback.topCues).toContain('Fix this warn thing');
    expect(feedback.topCues.length).toBeLessThanOrEqual(3);
  });

  it('uses message when correction is not available', () => {
    const result: StanceAnalysisResult = {
      timestampMs: Date.now(),
      overallScore: 60,
      confidence: 0.9,
      metrics: [
        { id: 'm1', label: 'Bad', status: 'bad', score: 30, confidence: 0.9, message: 'Something is wrong', correction: undefined },
      ],
      topCues: [],
    };
    const feedback = generateFeedback(result);
    expect(feedback.topCues).toContain('Something is wrong');
  });

  it('includes overall score context in summary', () => {
    const result: StanceAnalysisResult = {
      timestampMs: Date.now(),
      overallScore: 75,
      confidence: 0.8,
      metrics: [
        { id: 'm1', label: 'Warn', status: 'warn', score: 70, confidence: 0.8, message: 'Slightly off', correction: 'Adjust' },
      ],
      topCues: [],
    };
    const feedback = generateFeedback(result);
    expect(feedback.summary).toContain('75');
  });
});
