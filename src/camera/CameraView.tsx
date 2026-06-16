import { useEffect, useRef, useState, useCallback } from 'react';
import { requestCameraPermission, enumerateCameras, stopCameraStream } from './cameraPermissions';
import { createPoseLandmarker } from '../pose/poseLandmarker';
import type { StanceAnalysisResult } from '../analysis/types';
import { createRollingWindow } from '../analysis/rollingWindow';
import { evaluateBaseWidth, evaluateGuardPosition, evaluateHeadPosture, evaluateKneeSoftness, evaluateShoulderHipAlignment, evaluateStanceLength } from '../analysis/stanceMetrics';
import { detectStanceOrientation } from '../analysis/stanceOrientation';
import { normalizeLandmarks } from '../pose/normalizeLandmarks';
import type { PoseLandmark } from '../analysis/types';

interface CameraViewProps {
  onFrame: (result: StanceAnalysisResult) => void;
  stanceSelection: 'orthodox' | 'southpaw' | 'auto';
  onError?: (error: string) => void;
}

interface LandmarkResult {
  landmarks: Array<{ x: number; y: number; z: number; visibility?: number; presence?: number }>;
}

export function CameraView({ onFrame, stanceSelection, onError }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<Awaited<ReturnType<typeof createPoseLandmarker>> | null>(null);
  const rollingWindowRef = useRef<ReturnType<typeof createRollingWindow> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const analyzeFrame = useCallback((landmarks: LandmarkResult['landmarks']) => {
    const poseLandmarks: PoseLandmark[] = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z ?? 0,
      visibility: lm.visibility ?? 1,
      presence: lm.presence ?? 1,
    }));

    const normalized = normalizeLandmarks(poseLandmarks);
    detectStanceOrientation(poseLandmarks, stanceSelection);

    const metrics = [
      evaluateBaseWidth(poseLandmarks),
      evaluateStanceLength(poseLandmarks),
      evaluateKneeSoftness(poseLandmarks),
      evaluateGuardPosition(poseLandmarks),
      evaluateHeadPosture(poseLandmarks),
      evaluateShoulderHipAlignment(poseLandmarks),
    ];

    const result: StanceAnalysisResult = {
      timestampMs: Date.now(),
      overallScore: 0,
      confidence: normalized.confidence,
      metrics,
      topCues: [],
    };

    if (rollingWindowRef.current) {
      rollingWindowRef.current.addFrame(result);
      const aggregated = rollingWindowRef.current.getAggregated();
      if (aggregated) {
        onFrame(aggregated);
      }
    }
  }, [onFrame, stanceSelection]);

  const processVideoRef = useRef<(() => void) | null>(null);

  const processVideo = useCallback(async () => {
    if (!videoRef.current || !poseLandmarkerRef.current || !isActive) return;

    try {
      const video = videoRef.current;
      const results = poseLandmarkerRef.current.detectForVideo(video, performance.now());
      analyzeFrame(results.landmarks[0] || []);
    } catch (err) {
      console.error('Pose detection error:', err);
    }

    animationFrameRef.current = requestAnimationFrame(() => processVideoRef.current?.());
  }, [analyzeFrame, isActive]);

  // Update ref when processVideo changes
  useEffect(() => {
    processVideoRef.current = processVideo;
  }, [processVideo]);

  const startCamera = async (deviceId?: string) => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await requestCameraPermission(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const deviceList = await enumerateCameras();
      setCameras(deviceList);
      if (deviceList.length > 0 && !selectedCameraId) {
        setSelectedCameraId(deviceList[0].deviceId);
      }

      setIsActive(true);

      // Initialize pose landmarker
      if (!poseLandmarkerRef.current) {
        poseLandmarkerRef.current = await createPoseLandmarker();
      }

      // Initialize rolling window (5 seconds)
      rollingWindowRef.current = createRollingWindow({ windowMs: 5000 });

      animationFrameRef.current = requestAnimationFrame(processVideo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start camera';
      setError(message);
      onError?.(message);
    }
  };

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    stopCameraStream(streamRef.current);
    streamRef.current = null;
    setIsActive(false);
  }, []);

  const switchCamera = async (deviceId: string) => {
    stopCamera();
    await startCamera(deviceId);
  };

  useEffect(() => {
    enumerateCameras().then(setCameras);

    return () => {
      stopCamera();
      if (poseLandmarkerRef.current) {
        // MediaPipe cleanup would go here
      }
    };
  }, [stopCamera]);

  if (!isActive) {
    return (
      <div className="camera-setup">
        <h2>Camera Setup</h2>
        <p>Position your camera to capture your full body in frame.</p>
        <div className="setup-checklist">
          <label>
            <input type="checkbox" /> Full body visible
          </label>
          <label>
            <input type="checkbox" /> Hands visible
          </label>
          <label>
            <input type="checkbox" /> Feet visible
          </label>
          <label>
            <input type="checkbox" /> Good lighting
          </label>
          <label>
            <input type="checkbox" /> Stable camera
          </label>
        </div>
        <div className="stance-selector">
          <label>
            Stance:
            <select
              value={stanceSelection}
              onChange={() => {
                // Parent handles stance selection
              }}
            >
              <option value="orthodox">Orthodox (left lead)</option>
              <option value="southpaw">Southpaw (right lead)</option>
              <option value="auto">Auto-detect</option>
            </select>
          </label>
        </div>
        <button onClick={() => startCamera(selectedCameraId || undefined)} disabled={isActive}>
          Start Camera
        </button>
        {error && <div className="error" role="alert">{error}</div>}
      </div>
    );
  }

  return (
    <div className="camera-view">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} className="overlay" />
      </div>
      <div className="controls">
        <select
          value={selectedCameraId}
          onChange={e => switchCamera(e.target.value)}
          aria-label="Select camera"
        >
          {cameras.map(cam => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
        <button onClick={stopCamera}>Stop Camera</button>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  );
}
