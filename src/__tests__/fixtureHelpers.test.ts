import { describe, expect, it } from 'vitest';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { createStanceLandmarkFixture } from './fixtureHelpers';

describe('createStanceLandmarkFixture', () => {
  it('creates a complete orthodox fixture with required stance landmarks', () => {
    const fixture = createStanceLandmarkFixture({ stance: 'orthodox' });

    expect(fixture).toHaveLength(33);

    const requiredLandmarks = [
      POSE_LANDMARKS.NOSE,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_WRIST,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];

    for (const landmarkIndex of requiredLandmarks) {
      expect(fixture[landmarkIndex].visibility).toBeGreaterThanOrEqual(0.95);
    }
  });

  it('places the left foot forward for orthodox and right foot forward for southpaw', () => {
    const orthodox = createStanceLandmarkFixture({ stance: 'orthodox' });
    const southpaw = createStanceLandmarkFixture({ stance: 'southpaw' });

    expect(orthodox[POSE_LANDMARKS.LEFT_ANKLE].y).toBeLessThan(orthodox[POSE_LANDMARKS.RIGHT_ANKLE].y);
    expect(southpaw[POSE_LANDMARKS.RIGHT_ANKLE].y).toBeLessThan(southpaw[POSE_LANDMARKS.LEFT_ANKLE].y);
  });
});
