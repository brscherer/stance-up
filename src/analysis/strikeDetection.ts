import * as tf from '@tensorflow/tfjs';
import type { PoseLandmark, StrikeType } from './types';

const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;

let model: tf.LayersModel | null = null;
let isLoaded = false;

const STRIKE_LABELS: StrikeType[] = [
  'jab', 'cross', 'hook', 'uppercut',
  'roundhouse', 'teep', 'knee', 'check',
];

export interface StrikePrediction {
  type: StrikeType;
  confidence: number;
}

function coords(lm: PoseLandmark): [number, number, number] {
  return [lm.x, lm.y, lm.z ?? 0];
}

function vec3Sub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vec3Len(v: [number, number, number]): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalizeFrame(landmarks: PoseLandmark[]): number[] {
  const hipMid: [number, number, number] = [
    (landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 2,
    (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2,
    ((landmarks[LEFT_HIP].z ?? 0) + (landmarks[RIGHT_HIP].z ?? 0)) / 2,
  ];
  const shoulderMid: [number, number, number] = [
    (landmarks[LEFT_SHOULDER].x + landmarks[RIGHT_SHOULDER].x) / 2,
    (landmarks[LEFT_SHOULDER].y + landmarks[RIGHT_SHOULDER].y) / 2,
    ((landmarks[LEFT_SHOULDER].z ?? 0) + (landmarks[RIGHT_SHOULDER].z ?? 0)) / 2,
  ];
  const torsoHeight = vec3Len(vec3Sub(shoulderMid, hipMid)) || 1;

  const out: number[] = [];
  for (const lm of landmarks) {
    const c = coords(lm);
    const centered = vec3Sub(c, hipMid);
    out.push(centered[0] / torsoHeight, centered[1] / torsoHeight, centered[2] / torsoHeight);
  }
  return out;
}

export async function loadStrikeModel(): Promise<void> {
  if (isLoaded) return;
  try {
    model = await tf.loadLayersModel('/models/strike-classifier/model.json');
    isLoaded = true;
    tf.engine().startScope();
  } catch (err) {
    console.warn('Strike model not found — run Colab and place export in public/models/strike-classifier/', err);
  }
}

export function isStrikeModelLoaded(): boolean {
  return isLoaded;
}

export function predictStrike(window: PoseLandmark[][]): StrikePrediction | null {
  if (!model || window.length < 45) return null;

  const features = window.map(normalizeFrame);
  const input = tf.tensor3d([features], [1, 45, 99]);
  const output = model.predict(input) as tf.Tensor;
  const probs = Array.from(output.dataSync());
  const maxIdx = probs.indexOf(Math.max(...probs));
  const confidence = probs[maxIdx];

  input.dispose();
  output.dispose();

  if (confidence < 0.5 || maxIdx >= STRIKE_LABELS.length) return null;
  return { type: STRIKE_LABELS[maxIdx], confidence };
}
