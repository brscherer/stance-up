import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance: PoseLandmarker | null = null;

export async function createPoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });

  return poseLandmarkerInstance;
}

export function getPoseLandmarker(): PoseLandmarker | null {
  return poseLandmarkerInstance;
}

export function disposePoseLandmarker(): void {
  if (poseLandmarkerInstance) {
    poseLandmarkerInstance.close();
    poseLandmarkerInstance = null;
  }
}
