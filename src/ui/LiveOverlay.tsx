import { useEffect, useRef } from 'react';
import type { PoseLandmark } from '../analysis/types';

interface LiveOverlayProps {
  landmarks: PoseLandmark[];
  videoWidth: number;
  videoHeight: number;
}

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  [11, 12], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
];

const LANDMARK_RADIUS = 4;
const CONNECTION_WIDTH = 2;
const VISIBILITY_THRESHOLD = 0.5;

export function LiveOverlay({ landmarks, videoWidth, videoHeight }: LiveOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (!landmarks || landmarks.length === 0) return;

    ctx.strokeStyle = 'rgba(240, 90, 40, 0.8)';
    ctx.lineWidth = CONNECTION_WIDTH;
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (!start || !end) continue;
      if ((start.visibility ?? 0) < VISIBILITY_THRESHOLD) continue;
      if ((end.visibility ?? 0) < VISIBILITY_THRESHOLD) continue;

      const sx = start.x * videoWidth;
      const sy = start.y * videoHeight;
      const ex = end.x * videoWidth;
      const ey = end.y * videoHeight;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    ctx.fillStyle = '#f05a28';

    for (const landmark of landmarks) {
      if ((landmark.visibility ?? 0) < VISIBILITY_THRESHOLD) continue;

      const x = landmark.x * videoWidth;
      const y = landmark.y * videoHeight;

      ctx.beginPath();
      ctx.arc(x, y, LANDMARK_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [landmarks, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={videoWidth}
      height={videoHeight}
      className="pose-overlay"
      role="img"
      aria-hidden="true"
    />
  );
}