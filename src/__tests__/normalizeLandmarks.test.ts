import { describe, expect, it } from 'vitest';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { getBodyScale, getVisibleLandmark, normalizeLandmarks } from '../pose/normalizeLandmarks';
import { createStanceLandmarkFixture } from './fixtureHelpers';

describe('normalizeLandmarks', () => {
  it('returns visible landmarks and body scale references for a complete fixture', () => {
    const normalized = normalizeLandmarks(createStanceLandmarkFixture({ stance: 'orthodox' }));

    expect(normalized.confidence).toBeGreaterThan(0.9);
    expect(normalized.scale.shoulderWidth).toBeGreaterThan(0);
    expect(normalized.scale.hipWidth).toBeGreaterThan(0);
    expect(normalized.scale.torsoLength).toBeGreaterThan(0);
    expect(normalized.scale.ankleDistance).toBeGreaterThan(0);
    expect(normalized.landmark(POSE_LANDMARKS.LEFT_WRIST)).toMatchObject({ visible: true });
  });

  it('marks missing landmarks as not visible instead of throwing', () => {
    const normalized = normalizeLandmarks([]);

    expect(normalized.confidence).toBe(0);
    expect(normalized.landmark(POSE_LANDMARKS.LEFT_WRIST)).toMatchObject({ visible: false });
  });

  it('marks low-visibility landmarks as not visible', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.RIGHT_WRIST] = { ...landmarks[POSE_LANDMARKS.RIGHT_WRIST], visibility: 0.1 };

    expect(getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_WRIST)).toMatchObject({ visible: false });
  });

  it('returns zero scale values when required landmarks are unavailable', () => {
    const scale = getBodyScale([]);

    expect(scale).toEqual({ shoulderWidth: 0, hipWidth: 0, torsoLength: 0, ankleDistance: 0 });
  });
});
