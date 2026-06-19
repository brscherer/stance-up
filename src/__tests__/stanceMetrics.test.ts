import { describe, expect, it } from 'vitest';
import {
  evaluateBaseWidth,
  evaluateGuardPosition,
  evaluateHeadPosture,
  evaluateKneeSoftness,
  evaluateShoulderHipAlignment,
  evaluateStanceLength,
  evaluateWeightBalance,
} from '../analysis/stanceMetrics';
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

describe('evaluateGuardPosition', () => {
  it('scores the default fixture as a good guard', () => {
    expect(evaluateGuardPosition(createStanceLandmarkFixture({ stance: 'orthodox' }))).toMatchObject({
      id: 'guard-position',
      status: 'good',
    });
  });

  it('warns when a hand drops below the chin line', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.RIGHT_WRIST] = { ...landmarks[POSE_LANDMARKS.RIGHT_WRIST], y: 0.42 };

    const metric = evaluateGuardPosition(landmarks);

    expect(metric.status).toBe('bad');
    expect(metric.correction).toMatch(/hand.*dropping|guard/i);
  });

  it('returns unknown when wrist landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_WRIST] = { ...landmarks[POSE_LANDMARKS.LEFT_WRIST], visibility: 0.1 };

    expect(evaluateGuardPosition(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});

describe('evaluateHeadPosture', () => {
  it('scores the default fixture as good head posture', () => {
    expect(evaluateHeadPosture(createStanceLandmarkFixture({ stance: 'orthodox' }))).toMatchObject({
      id: 'head-posture',
      status: 'good',
    });
  });

  it('warns when the head drifts far outside the stance centerline', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.NOSE] = { ...landmarks[POSE_LANDMARKS.NOSE], x: 0.68 };

    const metric = evaluateHeadPosture(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/head|chin/i);
  });

  it('returns unknown when the nose landmark is unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.NOSE] = { ...landmarks[POSE_LANDMARKS.NOSE], visibility: 0.1 };

    expect(evaluateHeadPosture(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});

describe('evaluateWeightBalance', () => {
  it('scores the default fixture as good weight balance', () => {
    expect(evaluateWeightBalance(createStanceLandmarkFixture({ stance: 'orthodox' }))).toMatchObject({
      id: 'weight-balance',
      status: 'good',
    });
  });

  it('warns when hips drift far over one leg', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_HIP] = { ...landmarks[POSE_LANDMARKS.LEFT_HIP], x: 0.35 };
    landmarks[POSE_LANDMARKS.RIGHT_HIP] = { ...landmarks[POSE_LANDMARKS.RIGHT_HIP], x: 0.38 };

    const metric = evaluateWeightBalance(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/center/i);
  });

  it('returns unknown when hip landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_HIP] = { ...landmarks[POSE_LANDMARKS.LEFT_HIP], visibility: 0.1 };

    expect(evaluateWeightBalance(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});

describe('evaluateShoulderHipAlignment', () => {
  it('scores the default fixture as good shoulder and hip alignment', () => {
    expect(evaluateShoulderHipAlignment(createStanceLandmarkFixture({ stance: 'orthodox' }))).toMatchObject({
      id: 'shoulder-hip-alignment',
      status: 'good',
    });
  });

  it('warns when the stance appears too square', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_HIP] = { ...landmarks[POSE_LANDMARKS.LEFT_HIP], x: 0.39 };
    landmarks[POSE_LANDMARKS.RIGHT_HIP] = { ...landmarks[POSE_LANDMARKS.RIGHT_HIP], x: 0.61 };

    const metric = evaluateShoulderHipAlignment(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/square|angle/i);
  });

  it('warns when the stance appears too bladed', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER] = { ...landmarks[POSE_LANDMARKS.LEFT_SHOULDER], x: 0.48 };
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] = { ...landmarks[POSE_LANDMARKS.RIGHT_SHOULDER], x: 0.52 };

    const metric = evaluateShoulderHipAlignment(landmarks);

    expect(metric.status).toBe('warn');
    expect(metric.correction).toMatch(/sideways|open/i);
  });

  it('returns unknown when shoulder landmarks are unavailable', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER] = { ...landmarks[POSE_LANDMARKS.LEFT_SHOULDER], visibility: 0.1 };

    expect(evaluateShoulderHipAlignment(landmarks)).toMatchObject({ status: 'unknown', confidence: 0 });
  });
});
