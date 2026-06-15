import { describe, expect, it } from 'vitest';
import { evaluateBaseWidth, evaluateKneeSoftness, evaluateStanceLength } from '../analysis/stanceMetrics';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { createStanceLandmarkFixture } from './fixtureHelpers';

describe('evaluateBaseWidth', () => {
  it('scores the default fixture as a good base width', () => {
    const metric = evaluateBaseWidth(createStanceLandmarkFixture({ stance: 'orthodox' }));

    expect(metric).toMatchObject({ id: 'base-width', status: 'good' });
    expect(metric.score).toBeGreaterThanOrEqual(85);
    expect(metric.correction).toBeUndefined();
  });

  it('warns when the feet are too close together laterally', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], x: 0.5 };
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { ...landmarks[POSE_LANDMARKS.RIGHT_ANKLE], x: 0.52 };

    const metric = evaluateBaseWidth(landmarks);

    expect(metric.status).toBe('bad');
    expect(metric.correction).toMatch(/widen/i);
  });

  it('warns when the feet are too wide laterally', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], x: 0.34 };
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { ...landmarks[POSE_LANDMARKS.RIGHT_ANKLE], x: 0.72 };

    const metric = evaluateBaseWidth(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/closer/i);
  });

  it('returns unknown when ankle landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], visibility: 0.1 };

    expect(evaluateBaseWidth(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});

describe('evaluateStanceLength', () => {
  it('scores the default fixture as a good stance length', () => {
    const metric = evaluateStanceLength(createStanceLandmarkFixture({ stance: 'orthodox' }));

    expect(metric).toMatchObject({ id: 'stance-length', status: 'good' });
    expect(metric.score).toBeGreaterThanOrEqual(85);
  });

  it('warns when the stance is too square front-to-back', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], y: 0.86 };
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { ...landmarks[POSE_LANDMARKS.RIGHT_ANKLE], y: 0.88 };

    const metric = evaluateStanceLength(landmarks);

    expect(metric.status).toBe('bad');
    expect(metric.correction).toMatch(/rear foot back|not square/i);
  });

  it('warns when the stance is too long', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], y: 0.68 };
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { ...landmarks[POSE_LANDMARKS.RIGHT_ANKLE], y: 0.95 };

    const metric = evaluateStanceLength(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/shorten/i);
  });

  it('returns unknown when ankle landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = { ...landmarks[POSE_LANDMARKS.RIGHT_ANKLE], visibility: 0.1 };

    expect(evaluateStanceLength(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});

describe('evaluateKneeSoftness', () => {
  it('scores the default fixture as good knee softness', () => {
    const metric = evaluateKneeSoftness(createStanceLandmarkFixture({ stance: 'orthodox' }));

    expect(metric).toMatchObject({ id: 'knee-softness', status: 'good' });
    expect(metric.score).toBeGreaterThanOrEqual(85);
  });

  it('warns when both knees appear too straight', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_KNEE] = { ...landmarks[POSE_LANDMARKS.LEFT_KNEE], x: 0.44, y: 0.685 };
    landmarks[POSE_LANDMARKS.RIGHT_KNEE] = { ...landmarks[POSE_LANDMARKS.RIGHT_KNEE], x: 0.58, y: 0.725 };

    const metric = evaluateKneeSoftness(landmarks);

    expect(metric.status).toBe('bad');
    expect(metric.correction).toMatch(/soften/i);
  });

  it('warns when the stance is too deep', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_KNEE] = { ...landmarks[POSE_LANDMARKS.LEFT_KNEE], x: 0.34, y: 0.72 };
    landmarks[POSE_LANDMARKS.RIGHT_KNEE] = { ...landmarks[POSE_LANDMARKS.RIGHT_KNEE], x: 0.72, y: 0.78 };

    const metric = evaluateKneeSoftness(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/rise/i);
  });

  it('returns unknown when knee landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_KNEE] = { ...landmarks[POSE_LANDMARKS.LEFT_KNEE], visibility: 0.1 };

    expect(evaluateKneeSoftness(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});
