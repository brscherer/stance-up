import type { PoseLandmark } from './types';

const LANDMARK_VALUES_PER_POINT = 4; // x, y, z, visibility
const TOTAL_LANDMARKS = 33;
export const FRAME_FEATURE_COUNT = TOTAL_LANDMARKS * LANDMARK_VALUES_PER_POINT; // 132

export function landmarkstoFeatureVector(landmarks: PoseLandmark[]): number[] {
  const vec: number[] = [];
  for (let i = 0; i < TOTAL_LANDMARKS; i++) {
    const lm = landmarks[i];
    if (lm) {
      vec.push(lm.x, lm.y, lm.z ?? 0, lm.visibility ?? 0);
    } else {
      vec.push(0, 0, 0, 0);
    }
  }
  return vec;
}

export class RingBuffer {
  private buffer: number[][] = [];
  private index = 0;

  constructor(private size: number) {}

  push(frame: number[]): void {
    this.buffer[this.index] = frame;
    this.index = (this.index + 1) % this.size;
  }

  get length(): number {
    return this.buffer.length;
  }

  isFull(): boolean {
    return this.buffer.length >= this.size;
  }

  snapshot(): number[][] {
    if (this.buffer.length < this.size) return [];
    const result: number[][] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[(this.index + i) % this.size]);
    }
    return result;
  }

  clear(): void {
    this.buffer = [];
    this.index = 0;
  }
}

export interface StrikeSample {
  strike: string;
  metadata: {
    timestamp: number;
    windowSize: number;
  };
  frames: number[][];
}
