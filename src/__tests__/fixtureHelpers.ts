import type { PoseLandmark, StanceSide } from '../analysis/types';
import { POSE_LANDMARK_COUNT, POSE_LANDMARKS } from '../pose/landmarks';

interface FixtureOptions {
  stance: StanceSide;
}

const VISIBLE = 0.98;

function landmark(x: number, y: number, z = 0): PoseLandmark {
  return { x, y, z, visibility: VISIBLE, presence: VISIBLE };
}

export function createStanceLandmarkFixture({ stance }: FixtureOptions): PoseLandmark[] {
  const landmarks = Array.from({ length: POSE_LANDMARK_COUNT }, () => landmark(0.5, 0.5, 0));
  const isOrthodox = stance === 'orthodox';

  const leadX = isOrthodox ? 0.44 : 0.56;
  const rearX = isOrthodox ? 0.58 : 0.42;
  const leadFootY = 0.82;
  const rearFootY = 0.9;

  landmarks[POSE_LANDMARKS.NOSE] = landmark(0.5, 0.16, -0.02);
  landmarks[POSE_LANDMARKS.MOUTH_LEFT] = landmark(0.48, 0.2, -0.02);
  landmarks[POSE_LANDMARKS.MOUTH_RIGHT] = landmark(0.52, 0.2, -0.02);

  landmarks[POSE_LANDMARKS.LEFT_SHOULDER] = landmark(0.42, 0.31, 0);
  landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] = landmark(0.58, 0.32, 0);
  landmarks[POSE_LANDMARKS.LEFT_HIP] = landmark(0.45, 0.55, 0);
  landmarks[POSE_LANDMARKS.RIGHT_HIP] = landmark(0.56, 0.56, 0);

  landmarks[POSE_LANDMARKS.LEFT_ELBOW] = landmark(0.43, 0.4, -0.02);
  landmarks[POSE_LANDMARKS.RIGHT_ELBOW] = landmark(0.57, 0.41, -0.02);
  landmarks[POSE_LANDMARKS.LEFT_WRIST] = landmark(0.46, 0.25, -0.04);
  landmarks[POSE_LANDMARKS.RIGHT_WRIST] = landmark(0.55, 0.25, -0.04);

  landmarks[POSE_LANDMARKS.LEFT_KNEE] = landmark(isOrthodox ? leadX : rearX, isOrthodox ? 0.69 : 0.74, 0.01);
  landmarks[POSE_LANDMARKS.RIGHT_KNEE] = landmark(isOrthodox ? rearX : leadX, isOrthodox ? 0.74 : 0.69, 0.01);
  landmarks[POSE_LANDMARKS.LEFT_ANKLE] = landmark(isOrthodox ? leadX : rearX, isOrthodox ? leadFootY : rearFootY, 0.02);
  landmarks[POSE_LANDMARKS.RIGHT_ANKLE] = landmark(isOrthodox ? rearX : leadX, isOrthodox ? rearFootY : leadFootY, 0.02);
  landmarks[POSE_LANDMARKS.LEFT_HEEL] = landmark(isOrthodox ? leadX - 0.01 : rearX - 0.01, isOrthodox ? leadFootY + 0.02 : rearFootY + 0.02, 0.02);
  landmarks[POSE_LANDMARKS.RIGHT_HEEL] = landmark(isOrthodox ? rearX + 0.01 : leadX + 0.01, isOrthodox ? rearFootY + 0.02 : leadFootY + 0.02, 0.02);
  landmarks[POSE_LANDMARKS.LEFT_FOOT_INDEX] = landmark(isOrthodox ? leadX + 0.02 : rearX + 0.02, isOrthodox ? leadFootY - 0.01 : rearFootY - 0.01, 0.01);
  landmarks[POSE_LANDMARKS.RIGHT_FOOT_INDEX] = landmark(isOrthodox ? rearX - 0.02 : leadX - 0.02, isOrthodox ? rearFootY - 0.01 : leadFootY - 0.01, 0.01);

  return landmarks;
}
