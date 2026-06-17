import { useState, useCallback } from 'react';
import { CameraView } from './camera/CameraView';
import { SetupChecklist } from './ui/SetupChecklist';
// import { LiveOverlay } from './ui/LiveOverlay'; // Used in future
import { ScorePanel } from './ui/ScorePanel';
import { SessionSummary } from './ui/SessionSummary';
import type { StanceAnalysisResult, StanceSelection } from './analysis/types';

type AppState = 'landing' | 'setup' | 'analyzing' | 'summary';

function App() {
  const [state, setState] = useState<AppState>('landing');
  const [stanceSelection, setStanceSelection] = useState<StanceSelection>('orthodox');
  const [latestResult, setLatestResult] = useState<StanceAnalysisResult | null>(null);
  const [sessionResults, setSessionResults] = useState<StanceAnalysisResult[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFrame = useCallback((result: StanceAnalysisResult) => {
    setLatestResult(result);
    if (isSessionActive) {
      setSessionResults(prev => [...prev, result]);
    }
  }, [isSessionActive]);

  const handleStartCamera = useCallback(() => {
    setError(null);
    setState('analyzing');
    setIsSessionActive(true);
    setSessionResults([]);
  }, []);

  const handleStopSession = useCallback(() => {
    setIsSessionActive(false);
    setState('summary');
  }, []);

  const handleCloseSummary = useCallback(() => {
    setState('setup');
    setLatestResult(null);
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
  }, []);

  if (state === 'landing') {
    return (
      <main className="app-shell">
        <section className="hero-card" aria-labelledby="app-title">
          <p className="eyebrow">Muay Thai stance coach</p>
          <h1 id="app-title">Stance Up</h1>
          <p className="lede">
            Use your camera locally to check stance fundamentals and get clear cues for your next round.
          </p>
          <button type="button" onClick={() => setState('setup')}>
            Start Camera Setup
          </button>
          <p className="privacy-note">
            Camera frames are processed locally in your browser. No video is uploaded or stored.
          </p>
        </section>
      </main>
    );
  }

  if (state === 'setup') {
    return (
      <main className="app-shell">
        <SetupChecklist
          stanceSelection={stanceSelection}
          onStanceChange={setStanceSelection}
          onStart={handleStartCamera}
          error={error}
        />
      </main>
    );
  }

  if (state === 'analyzing') {
    return (
      <main className="app-shell analyzing">
        <CameraView
          onFrame={handleFrame}
          stanceSelection={stanceSelection}
          onError={handleError}
        />
        {latestResult && (
          <div className="analysis-overlay">
            <ScorePanel
              overallScore={latestResult.overallScore}
              confidence={latestResult.confidence}
              metrics={latestResult.metrics}
              topCues={latestResult.topCues}
            />
          </div>
        )}
        <div className="session-controls">
          <button onClick={handleStopSession} className="stop-button">
            End Session
          </button>
        </div>
      </main>
    );
  }

  if (state === 'summary') {
    return (
      <main className="app-shell">
        <SessionSummary
          results={sessionResults}
          onClose={handleCloseSummary}
        />
      </main>
    );
  }

  return null;
}

export default App;