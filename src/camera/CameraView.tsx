import { useEffect, useRef, useState, useCallback } from 'react';
import { requestCameraPermission, enumerateCameras, stopCameraStream } from './cameraPermissions';
import { createPoseLandmarker } from '../pose/poseLandmarker';
import type { StanceAnalysisResult } from '../analysis/types';
import { createRollingWindow } from '../analysis/rollingWindow';
import { evaluateBaseWidth, evaluateGuardPosition, evaluateHeadPosture, evaluateKneeSoftness, evaluateShoulderHipAlignment, evaluateStanceLength, evaluateWeightBalance } from '../analysis/stanceMetrics';
import { detectStanceOrientation } from '../analysis/stanceOrientation';
import { normalizeLandmarks } from '../pose/normalizeLandmarks';
import type { PoseLandmark } from '../analysis/types';
import { LiveOverlay } from '../ui/LiveOverlay';
import { t } from '../i18n/t';

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
  const poseLandmarkerRef = useRef<Awaited<ReturnType<typeof createPoseLandmarker>> | null>(null);
  const rollingWindowRef = useRef<ReturnType<typeof createRollingWindow> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [latestLandmarks, setLatestLandmarks] = useState<PoseLandmark[]>([]);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });

  const analyzeFrame = useCallback((landmarks: LandmarkResult['landmarks']) => {
    const poseLandmarks: PoseLandmark[] = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z ?? 0,
      visibility: lm.visibility ?? 1,
      presence: lm.presence ?? 1,
    }));

    setLatestLandmarks(poseLandmarks);

    const normalized = normalizeLandmarks(poseLandmarks);
    detectStanceOrientation(poseLandmarks, stanceSelection);

    const metrics = [
      evaluateBaseWidth(poseLandmarks),
      evaluateStanceLength(poseLandmarks),
      evaluateKneeSoftness(poseLandmarks),
      evaluateGuardPosition(poseLandmarks),
      evaluateHeadPosture(poseLandmarks),
      evaluateShoulderHipAlignment(poseLandmarks),
      evaluateWeightBalance(poseLandmarks),
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

  useEffect(() => {
    processVideoRef.current = processVideo;
  }, [processVideo]);

  useEffect(() => {
    if (!videoRef.current || !isActive) return;
    const video = videoRef.current;
    const handleResize = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoSize({ width: video.videoWidth, height: video.videoHeight });
      }
    };
    video.addEventListener('loadedmetadata', handleResize);
    video.addEventListener('resize', handleResize);
    return () => {
      video.removeEventListener('loadedmetadata', handleResize);
      video.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

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

      if (!poseLandmarkerRef.current) {
        poseLandmarkerRef.current = await createPoseLandmarker();
      }

      rollingWindowRef.current = createRollingWindow({ windowMs: 5000 });

      animationFrameRef.current = requestAnimationFrame(processVideo);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('camera.failedToStart');
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
    setLatestLandmarks([]);
  }, []);

  const switchCamera = async (deviceId: string) => {
    stopCamera();
    await startCamera(deviceId);
  };

  useEffect(() => {
    enumerateCameras().then(setCameras);

    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="camera-view">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        {latestLandmarks.length > 0 && (
          <LiveOverlay
            landmarks={latestLandmarks}
            videoWidth={videoSize.width}
            videoHeight={videoSize.height}
          />
        )}
      </div>
      <div className="controls">
        <select
          value={selectedCameraId}
          onChange={e => switchCamera(e.target.value)}
          aria-label={t('camera.selectCamera')}
        >
          {cameras.map(cam => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
        <button onClick={stopCamera}>{t('camera.stopCamera')}</button>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
    </div>
  );
}
