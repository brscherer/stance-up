import type { PoseLandmark, StanceMetric } from './types';
import { POSE_LANDMARKS } from '../pose/landmarks';
import { getBodyScale, getVisibleLandmark, type VisibleLandmark } from '../pose/normalizeLandmarks';
import { t } from '../i18n/t';

function unknownMetric(id: string, labelKey: string, messageKey: string): StanceMetric {
  return {
    id,
    label: t(labelKey),
    status: 'unknown',
    score: 0,
    confidence: 0,
    message: t(messageKey),
    correction: t('metrics.unknownCorrection'),
  };
}

function buildMetric(
  id: string,
  labelKey: string,
  status: StanceMetric['status'],
  score: number,
  messageKey: string,
  correctionKey?: string,
): StanceMetric {
  return {
    id,
    label: t(labelKey),
    status,
    score,
    confidence: 1,
    message: t(messageKey),
    correction: correctionKey ? t(correctionKey) : undefined,
  };
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
    return unknownMetric('base-width', 'metrics.baseWidth.label', 'metrics.baseWidth.unknown');
  }

  const lateralWidth = Math.abs(leftAnkle.x - rightAnkle.x);
  const widthRatio = lateralWidth / scale.shoulderWidth;

  if (widthRatio < 0.35) {
    return buildMetric(
      'base-width',
      'metrics.baseWidth.label',
      'bad',
      35,
      'metrics.baseWidth.bad',
      'metrics.baseWidth.badCorrection',
    );
  }

  if (widthRatio > 1.9) {
    return buildMetric(
      'base-width',
      'metrics.baseWidth.label',
      'warn',
      65,
      'metrics.baseWidth.warn',
      'metrics.baseWidth.warnCorrection',
    );
  }

  return buildMetric('base-width', 'metrics.baseWidth.label', 'good', 92, 'metrics.baseWidth.good');
}

export function evaluateStanceLength(landmarks: PoseLandmark[]): StanceMetric {
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);
  const scale = getBodyScale(landmarks);

  if (!leftAnkle.visible || !rightAnkle.visible || scale.torsoLength === 0) {
    return unknownMetric('stance-length', 'metrics.stanceLength.label', 'metrics.stanceLength.unknown');
  }

  const forwardLength = Math.abs(leftAnkle.y - rightAnkle.y);
  const lengthRatio = forwardLength / scale.torsoLength;

  if (lengthRatio < 0.25) {
    return buildMetric(
      'stance-length',
      'metrics.stanceLength.label',
      'bad',
      35,
      'metrics.stanceLength.bad',
      'metrics.stanceLength.badCorrection',
    );
  }

  if (lengthRatio > 0.95) {
    return buildMetric(
      'stance-length',
      'metrics.stanceLength.label',
      'warn',
      65,
      'metrics.stanceLength.warn',
      'metrics.stanceLength.warnCorrection',
    );
  }

  return buildMetric('stance-length', 'metrics.stanceLength.label', 'good', 92, 'metrics.stanceLength.good');
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
    return unknownMetric('knee-softness', 'metrics.kneeSoftness.label', 'metrics.kneeSoftness.unknown');
  }

  const leftBend = perpendicularDistance(leftKnee, leftHip, leftAnkle) / scale.torsoLength;
  const rightBend = perpendicularDistance(rightKnee, rightHip, rightAnkle) / scale.torsoLength;
  const averageBend = (leftBend + rightBend) / 2;

  if (averageBend < 0.06) {
    return buildMetric(
      'knee-softness',
      'metrics.kneeSoftness.label',
      'bad',
      35,
      'metrics.kneeSoftness.bad',
      'metrics.kneeSoftness.badCorrection',
    );
  }

  if (averageBend > 0.5) {
    return buildMetric(
      'knee-softness',
      'metrics.kneeSoftness.label',
      'warn',
      65,
      'metrics.kneeSoftness.warn',
      'metrics.kneeSoftness.warnCorrection',
    );
  }

  return buildMetric('knee-softness', 'metrics.kneeSoftness.label', 'good', 92, 'metrics.kneeSoftness.good');
}

export function evaluateGuardPosition(landmarks: PoseLandmark[]): StanceMetric {
  const leftWrist = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_WRIST);
  const rightWrist = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_WRIST);
  const nose = getVisibleLandmark(landmarks, POSE_LANDMARKS.NOSE);
  const leftShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);

  if (![leftWrist, rightWrist, nose, leftShoulder, rightShoulder].every((landmark) => landmark.visible)) {
    return unknownMetric('guard-position', 'metrics.guardPosition.label', 'metrics.guardPosition.unknown');
  }

  const shoulderLineY = (leftShoulder.y + rightShoulder.y) / 2;
  const guardLimitY = nose.y + (shoulderLineY - nose.y) * 0.75;
  const droppedHands = [leftWrist, rightWrist].filter((wrist) => wrist.y > guardLimitY).length;

  if (droppedHands > 0) {
    return buildMetric(
      'guard-position',
      'metrics.guardPosition.label',
      'bad',
      droppedHands === 2 ? 30 : 45,
      droppedHands === 2 ? 'metrics.guardPosition.badBoth' : 'metrics.guardPosition.badOne',
      'metrics.guardPosition.badCorrection',
    );
  }

  return buildMetric('guard-position', 'metrics.guardPosition.label', 'good', 92, 'metrics.guardPosition.good');
}

export function evaluateHeadPosture(landmarks: PoseLandmark[]): StanceMetric {
  const nose = getVisibleLandmark(landmarks, POSE_LANDMARKS.NOSE);
  const leftShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const scale = getBodyScale(landmarks);

  if (![nose, leftShoulder, rightShoulder].every((landmark) => landmark.visible) || scale.shoulderWidth === 0) {
    return unknownMetric('head-posture', 'metrics.headPosture.label', 'metrics.headPosture.unknown');
  }

  const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  const lateralDriftRatio = Math.abs(nose.x - shoulderCenterX) / scale.shoulderWidth;

  if (lateralDriftRatio > 0.75) {
    return buildMetric(
      'head-posture',
      'metrics.headPosture.label',
      'warn',
      65,
      'metrics.headPosture.warn',
      'metrics.headPosture.warnCorrection',
    );
  }

  return buildMetric('head-posture', 'metrics.headPosture.label', 'good', 92, 'metrics.headPosture.good');
}

export function evaluateWeightBalance(landmarks: PoseLandmark[]): StanceMetric {
  const leftHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);
  const scale = getBodyScale(landmarks);

  if (!leftHip.visible || !rightHip.visible || !leftAnkle.visible || !rightAnkle.visible || scale.shoulderWidth === 0) {
    return unknownMetric('weight-balance', 'metrics.weightBalance.label', 'metrics.weightBalance.unknown');
  }

  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const ankleMidX = (leftAnkle.x + rightAnkle.x) / 2;
  const lateralShift = Math.abs(hipMidX - ankleMidX) / scale.shoulderWidth;

  if (lateralShift > 0.25) {
    return buildMetric(
      'weight-balance',
      'metrics.weightBalance.label',
      'warn',
      60,
      'metrics.weightBalance.warn',
      'metrics.weightBalance.warnCorrection',
    );
  }

  return buildMetric('weight-balance', 'metrics.weightBalance.label', 'good', 92, 'metrics.weightBalance.good');
}

export function evaluateShoulderHipAlignment(landmarks: PoseLandmark[]): StanceMetric {
  const leftShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const scale = getBodyScale(landmarks);

  if (![leftShoulder, rightShoulder, leftHip, rightHip].every((landmark) => landmark.visible) || scale.hipWidth === 0) {
    return unknownMetric('shoulder-hip-alignment', 'metrics.shoulderHipAlignment.label', 'metrics.shoulderHipAlignment.unknown');
  }

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  const hipWidth = Math.abs(leftHip.x - rightHip.x);
  const ratio = shoulderWidth / hipWidth;

  if (ratio < 0.65) {
    return buildMetric(
      'shoulder-hip-alignment',
      'metrics.shoulderHipAlignment.label',
      'warn',
      65,
      'metrics.shoulderHipAlignment.warnSideways',
      'metrics.shoulderHipAlignment.warnSidewaysCorrection',
    );
  }

  if (ratio < 1.15) {
    return buildMetric(
      'shoulder-hip-alignment',
      'metrics.shoulderHipAlignment.label',
      'warn',
      65,
      'metrics.shoulderHipAlignment.warnSquare',
      'metrics.shoulderHipAlignment.warnSquareCorrection',
    );
  }

  return buildMetric('shoulder-hip-alignment', 'metrics.shoulderHipAlignment.label', 'good', 92, 'metrics.shoulderHipAlignment.good');
}
