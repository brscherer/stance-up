import type { PoseLandmark, StanceSelection, StanceSide } from './types';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { getVisibleLandmark } from '../pose/normalizeLandmarks';

export type DetectedStance = StanceSide | 'unknown';
export type StanceOrientationSource = 'user' | 'auto' | 'unknown';

export interface StanceOrientationResult {
  stance: DetectedStance;
  confidence: number;
  source: StanceOrientationSource;
}

const MIN_FORWARD_SEPARATION = 0.025;

export function detectStanceOrientation(
  landmarks: PoseLandmark[],
  selection: StanceSelection,
): StanceOrientationResult {
  if (selection === 'orthodox' || selection === 'southpaw') {
    return { stance: selection, confidence: 1, source: 'user' };
  }

  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);

  if (!leftAnkle.visible || !rightAnkle.visible) {
    return { stance: 'unknown', confidence: 0, source: 'unknown' };
  }

  const forwardSeparation = Math.abs(leftAnkle.y - rightAnkle.y);

  if (forwardSeparation < MIN_FORWARD_SEPARATION) {
    return { stance: 'unknown', confidence: 0.25, source: 'unknown' };
  }

  const stance: StanceSide = leftAnkle.y < rightAnkle.y ? 'orthodox' : 'southpaw';
  const confidence = Math.min(1, forwardSeparation / 0.12);

  return { stance, confidence, source: 'auto' };
}
