import type { PoseLandmark, StanceMetric } from './types';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { getBodyScale, getVisibleLandmark, type VisibleLandmark } from '../pose/normalizeLandmarks';

function unknownMetric(id: string, label: string, message: string): StanceMetric {
  return {
    id,
    label,
    status: 'unknown',
    score: 0,
    confidence: 0,
    message,
    correction: 'Move so both feet are visible before judging this stance detail.',
  };
}

function buildMetric(
  id: string,
  label: string,
  status: StanceMetric['status'],
  score: number,
  message: string,
  correction?: string,
): StanceMetric {
  return { id, label, status, score, confidence: 1, message, correction };
}

function perpendicularDistance(point: VisibleLandmark, lineStart: VisibleLandmark, lineEnd: VisibleLandmark): number {
  const numerator = Math.abs(
    (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x,
  );
  const denominator = Math.hypot(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x);

  return denominator === 0 ? 0 : numerator / denominator;
}

export function evaluateBaseWidth(landmarks: PoseLandmark[]): StanceMetric {
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);
  const scale = getBodyScale(landmarks);

  if (!leftAnkle.visible || !rightAnkle.visible || scale.shoulderWidth === 0) {
    return unknownMetric('base-width', 'Base width', 'Not enough foot or shoulder visibility to judge base width.');
  }

  const lateralWidth = Math.abs(leftAnkle.x - rightAnkle.x);
  const widthRatio = lateralWidth / scale.shoulderWidth;

  if (widthRatio < 0.35) {
    return buildMetric(
      'base-width',
      'Base width',
      'bad',
      35,
      'Your feet appear too close together laterally.',
      'Widen your base so your feet are not lined up and you feel harder to push over sideways.',
    );
  }

  if (widthRatio > 1.9) {
    return buildMetric(
      'base-width',
      'Base width',
      'warn',
      65,
      'Your feet appear very wide laterally.',
      'Bring your feet slightly closer so you can step quickly without feeling stuck.',
    );
  }

  return buildMetric('base-width', 'Base width', 'good', 92, 'Your base width looks balanced for a Muay Thai stance.');
}

export function evaluateStanceLength(landmarks: PoseLandmark[]): StanceMetric {
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);
  const scale = getBodyScale(landmarks);

  if (!leftAnkle.visible || !rightAnkle.visible || scale.torsoLength === 0) {
    return unknownMetric('stance-length', 'Stance length', 'Not enough foot or torso visibility to judge stance length.');
  }

  const forwardLength = Math.abs(leftAnkle.y - rightAnkle.y);
  const lengthRatio = forwardLength / scale.torsoLength;

  if (lengthRatio < 0.25) {
    return buildMetric(
      'stance-length',
      'Stance length',
      'bad',
      35,
      'Your stance appears too square front-to-back.',
      'Step your rear foot back slightly so you are not square and can move from a fighting stance.',
    );
  }

  if (lengthRatio > 0.95) {
    return buildMetric(
      'stance-length',
      'Stance length',
      'warn',
      65,
      'Your stance appears too long front-to-back.',
      'Shorten the stance so you can check, teep, and step without dragging your rear leg.',
    );
  }

  return buildMetric('stance-length', 'Stance length', 'good', 92, 'Your front-to-back stance length looks mobile.');
}

export function evaluateKneeSoftness(landmarks: PoseLandmark[]): StanceMetric {
  const leftHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const leftKnee = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_KNEE);
  const rightKnee = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_KNEE);
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);
  const scale = getBodyScale(landmarks);

  const required = [leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
  if (required.some((landmark) => !landmark.visible) || scale.torsoLength === 0) {
    return unknownMetric('knee-softness', 'Knee softness', 'Not enough hip, knee, or ankle visibility to judge knee bend.');
  }

  const leftBend = perpendicularDistance(leftKnee, leftHip, leftAnkle) / scale.torsoLength;
  const rightBend = perpendicularDistance(rightKnee, rightHip, rightAnkle) / scale.torsoLength;
  const averageBend = (leftBend + rightBend) / 2;

  if (averageBend < 0.06) {
    return buildMetric(
      'knee-softness',
      'Knee softness',
      'bad',
      35,
      'Your knees appear too straight for an athletic stance.',
      'Soften your knees. Think athletic bounce, not standing tall.',
    );
  }

  if (averageBend > 0.5) {
    return buildMetric(
      'knee-softness',
      'Knee softness',
      'warn',
      65,
      'Your stance appears deeper than needed for mobile Muay Thai movement.',
      'Rise a little. Muay Thai stance should be mobile, not a squat.',
    );
  }

  return buildMetric('knee-softness', 'Knee softness', 'good', 92, 'Your knees look softly bent and ready to move.');
}
