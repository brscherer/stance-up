import { describe, expect, it } from 'vitest';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { detectStanceOrientation } from '../analysis/stanceOrientation';
import { createStanceLandmarkFixture } from './fixtureHelpers';

describe('detectStanceOrientation', () => {
  it('returns user-selected orthodox with full confidence', () => {
    const result = detectStanceOrientation(createStanceLandmarkFixture({ stance: 'southpaw' }), 'orthodox');

    expect(result).toEqual({ stance: 'orthodox', confidence: 1, source: 'user' });
  });

  it('returns user-selected southpaw with full confidence', () => {
    const result = detectStanceOrientation(createStanceLandmarkFixture({ stance: 'orthodox' }), 'southpaw');

    expect(result).toEqual({ stance: 'southpaw', confidence: 1, source: 'user' });
  });

  it('auto-detects orthodox when the left ankle is forward', () => {
    const result = detectStanceOrientation(createStanceLandmarkFixture({ stance: 'orthodox' }), 'auto');

    expect(result.stance).toBe('orthodox');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.source).toBe('auto');
  });

  it('auto-detects southpaw when the right ankle is forward', () => {
    const result = detectStanceOrientation(createStanceLandmarkFixture({ stance: 'southpaw' }), 'auto');

    expect(result.stance).toBe('southpaw');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.source).toBe('auto');
  });

  it('returns unknown when foot landmarks are not visible enough', () => {
    const landmarks = createStanceLandmarkFixture({ stance: 'orthodox' });
    landmarks[POSE_LANDMARKS.LEFT_ANKLE] = { ...landmarks[POSE_LANDMARKS.LEFT_ANKLE], visibility: 0.1 };

    const result = detectStanceOrientation(landmarks, 'auto');

    expect(result).toEqual({ stance: 'unknown', confidence: 0, source: 'unknown' });
  });
});
