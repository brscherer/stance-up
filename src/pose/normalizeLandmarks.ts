import type { PoseLandmark } from '../analysis/types';
import { POSE_LANDMARKS } from './landmarks';

export interface VisibleLandmark extends PoseLandmark {
  visible: boolean;
}

export interface BodyScale {
  shoulderWidth: number;
  hipWidth: number;
  torsoLength: number;
  ankleDistance: number;
}

export interface NormalizedLandmarks {
  confidence: number;
  scale: BodyScale;
  landmark: (index: number) => VisibleLandmark;
}

const MIN_VISIBILITY = 0.5;
const REQUIRED_CONFIDENCE_LANDMARKS = [
  POSE_LANDMARKS.NOSE,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.LEFT_KNEE,
  POSE_LANDMARKS.RIGHT_KNEE,
  POSE_LANDMARKS.LEFT_ANKLE,
  POSE_LANDMARKS.RIGHT_ANKLE,
  POSE_LANDMARKS.LEFT_WRIST,
  POSE_LANDMARKS.RIGHT_WRIST,
];

function distance(a: PoseLandmark | undefined, b: PoseLandmark | undefined): number {
  if (!a || !b) return 0;

  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function midpoint(a: PoseLandmark | undefined, b: PoseLandmark | undefined): PoseLandmark | undefined {
  if (!a || !b) return undefined;

  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
    presence: Math.min(a.presence ?? 1, b.presence ?? 1),
  };
}

function isVisible(landmark: PoseLandmark | undefined): boolean {
  if (!landmark) return false;

  return (landmark.visibility ?? 1) >= MIN_VISIBILITY && (landmark.presence ?? 1) >= MIN_VISIBILITY;
}

export function getVisibleLandmark(landmarks: PoseLandmark[], index: number): VisibleLandmark {
  const candidate: PoseLandmark | undefined = landmarks[index];

  if (!candidate) {
    return { x: 0, y: 0, z: 0, visibility: 0, presence: 0, visible: false };
  }

  if (!isVisible(candidate)) {
    return {
      x: candidate.x,
      y: candidate.y,
      z: candidate.z ?? 0,
      visibility: candidate.visibility ?? 0,
      presence: candidate.presence ?? 0,
      visible: false,
    };
  }

  return { ...candidate, visible: true };
}

export function getBodyScale(landmarks: PoseLandmark[]): BodyScale {
  const leftShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER);
  const rightShoulder = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_SHOULDER);
  const leftHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP);
  const rightHip = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_HIP);
  const leftAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.LEFT_ANKLE);
  const rightAnkle = getVisibleLandmark(landmarks, POSE_LANDMARKS.RIGHT_ANKLE);

  const shoulderMidpoint = midpoint(leftShoulder.visible ? leftShoulder : undefined, rightShoulder.visible ? rightShoulder : undefined);
  const hipMidpoint = midpoint(leftHip.visible ? leftHip : undefined, rightHip.visible ? rightHip : undefined);

  return {
    shoulderWidth: leftShoulder.visible && rightShoulder.visible ? distance(leftShoulder, rightShoulder) : 0,
    hipWidth: leftHip.visible && rightHip.visible ? distance(leftHip, rightHip) : 0,
    torsoLength: shoulderMidpoint && hipMidpoint ? distance(shoulderMidpoint, hipMidpoint) : 0,
    ankleDistance: leftAnkle.visible && rightAnkle.visible ? distance(leftAnkle, rightAnkle) : 0,
  };
}

export function normalizeLandmarks(landmarks: PoseLandmark[]): NormalizedLandmarks {
  const visibleCount = REQUIRED_CONFIDENCE_LANDMARKS.filter((index) => getVisibleLandmark(landmarks, index).visible).length;

  return {
    confidence: visibleCount / REQUIRED_CONFIDENCE_LANDMARKS.length,
    scale: getBodyScale(landmarks),
    landmark: (index: number) => getVisibleLandmark(landmarks, index),
  };
}
