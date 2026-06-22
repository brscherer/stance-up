import { useEffect, useRef, useState, useCallback } from 'react';
import { requestCameraPermission, stopCameraStream } from '../camera/cameraPermissions';
import { createPoseLandmarker } from '../pose/poseLandmarker';
import { LiveOverlay, type DisplayRect } from './LiveOverlay';
import { RingBuffer, landmarkstoFeatureVector, type StrikeSample } from '../analysis/strikePreprocessing';
import type { StrikeType, PoseLandmark } from '../analysis/types';
import { useLocale } from '../i18n/LocaleProvider';

const STRIKE_TYPES: StrikeType[] = ['jab', 'cross', 'hook', 'uppercut', 'roundhouse', 'teep', 'knee', 'check'];
const WINDOW_SIZE = 45;
const RECORD_DURATION_MS = 3000;
const TARGET_SAMPLES = 10;

interface StrikeRecorderProps {
  onClose: () => void;
}

export function StrikeRecorder({ onClose }: StrikeRecorderProps) {
  const { t } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const poseLandmarkerRef = useRef<Awaited<ReturnType<typeof createPoseLandmarker>> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ringRef = useRef(new RingBuffer(WINDOW_SIZE));
  const [bufferFull, setBufferFull] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [latestLandmarks, setLatestLandmarks] = useState<PoseLandmark[]>([]);
  const [displayRect, setDisplayRect] = useState<DisplayRect>({ width: 640, height: 480, offsetX: 0, offsetY: 0 });
  const [activeStrike, setActiveStrike] = useState<StrikeType>('jab');
  const [samples, setSamples] = useState<StrikeSample[]>([]);
  const [recording, setRecording] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'recording' | 'saving'>('idle');
  const [countdownValue, setCountdownValue] = useState(0);

  const updateDisplayRect = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !video.videoWidth || !video.videoHeight) return;
    const rect = container.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const videoAspect = vw / vh;
    const containerAspect = cw / ch;
    let w: number, h: number, ox: number, oy: number;
    if (videoAspect > containerAspect) {
      h = ch; w = ch * videoAspect; ox = (cw - w) / 2; oy = 0;
    } else {
      w = cw; h = cw / videoAspect; ox = 0; oy = (ch - h) / 2;
    }
    setDisplayRect({ width: w, height: h, offsetX: ox, offsetY: oy });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    const observer = new ResizeObserver(updateDisplayRect);
    observer.observe(container);
    video.addEventListener('loadedmetadata', updateDisplayRect);
    video.addEventListener('resize', updateDisplayRect);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', updateDisplayRect);
      video.removeEventListener('resize', updateDisplayRect);
    };
  }, [updateDisplayRect]);

  const processFrameRef = useRef<(() => void) | null>(null);

  const processFrame = useCallback(async () => {
    if (!videoRef.current || !poseLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => processFrameRef.current?.());
      return;
    }
    try {
      const results = poseLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
      const raw = results.landmarks[0] || [];
      const landmarks: PoseLandmark[] = raw.map((lm: { x: number; y: number; z?: number; visibility?: number }) => ({
        x: lm.x, y: lm.y, z: lm.z ?? 0, visibility: lm.visibility ?? 1,
      }));
      setLatestLandmarks(landmarks);
      ringRef.current.push(landmarkstoFeatureVector(landmarks));
      if (ringRef.current.isFull()) setBufferFull(true);
    } catch {
      // skip frame
    }
    animationFrameRef.current = requestAnimationFrame(() => processFrameRef.current?.());
  }, []);

  useEffect(() => {
    processFrameRef.current = processFrame;
  }, [processFrame]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await requestCameraPermission({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) { stopCameraStream(stream); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (!poseLandmarkerRef.current) {
          poseLandmarkerRef.current = await createPoseLandmarker();
        }
        setIsReady(true);
        animationFrameRef.current = requestAnimationFrame(() => processFrameRef.current?.());
      } catch {
        // camera failed
      }
    })();
    return () => {
      cancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    };
  }, [processFrame]);

  const countForType = (type: StrikeType) => samples.filter(s => s.strike === type).length;
  const allComplete = STRIKE_TYPES.every(t => countForType(t) >= TARGET_SAMPLES);

  const startRecording = () => {
    if (recording || !ringRef.current.isFull()) return;
    setRecording(true);
    setPhase('countdown');
    setCountdownValue(3);
    ringRef.current.clear();

    let count = 3;
    const countInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countInterval);
        setPhase('recording');
        setCountdownValue(0);
        const savedFrames: number[][] = [];

        const collectInterval = setInterval(() => {
          const snap = ringRef.current.snapshot();
          if (snap.length >= WINDOW_SIZE) {
            savedFrames.push(...snap.slice(-WINDOW_SIZE));
          }
        }, 100);

        setTimeout(() => {
          clearInterval(collectInterval);
          const snap = ringRef.current.snapshot();
          if (snap.length >= WINDOW_SIZE) {
            const sample: StrikeSample = {
              strike: activeStrike,
              metadata: { timestamp: Date.now(), windowSize: WINDOW_SIZE },
              frames: snap,
            };
            setSamples(prev => [...prev, sample]);
          }
          setPhase('idle');
          setRecording(false);
        }, RECORD_DURATION_MS);
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  };

  const exportData = () => {
    const json = JSON.stringify(samples, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strike-training-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="strike-recorder">
      <div ref={containerRef} className="recorder-video-container">
        <video ref={videoRef} autoPlay playsInline muted />
        {latestLandmarks.length > 0 && (
          <LiveOverlay landmarks={latestLandmarks} displayRect={displayRect} />
        )}
      </div>

      <div className="recorder-ui">
        <div className="recorder-header">
          <h2>{t('recorder.heading')}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="strike-grid">
          {STRIKE_TYPES.map(type => {
            const count = countForType(type);
            const isActive = type === activeStrike;
            const done = count >= TARGET_SAMPLES;
            return (
              <button
                key={type}
                className={`strike-chip${isActive ? ' active' : ''}${done ? ' done' : ''}`}
                onClick={() => { if (!recording) setActiveStrike(type); }}
                disabled={recording || done}
              >
                <span className="strike-name">{t(`strikes.${type}`)}</span>
                <span className="strike-count">{count}/{TARGET_SAMPLES}</span>
              </button>
            );
          })}
        </div>

        <div className="recorder-status">
          {phase === 'countdown' && (
            <div className="countdown">{countdownValue > 0 ? countdownValue : t('recorder.go')}</div>
          )}
          {phase === 'recording' && (
            <div className="recording-indicator">{t('recorder.recording')}</div>
          )}
          {phase === 'idle' && isReady && !allComplete && (
            <button
              className="record-button"
              onClick={startRecording}
              disabled={!bufferFull}
            >
              {bufferFull ? t('recorder.record') : t('recorder.waiting')}
            </button>
          )}
          {allComplete && (
            <div className="all-done">
              <p>{t('recorder.allDone')}</p>
              <button className="export-button" onClick={exportData}>
                {t('recorder.export')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
