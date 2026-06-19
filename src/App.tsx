import { useState, useCallback } from 'react';
import { CameraView } from './camera/CameraView';
import { SetupChecklist } from './ui/SetupChecklist';
import { ScorePanel } from './ui/ScorePanel';
import { SessionSummary } from './ui/SessionSummary';
import { LocaleProvider, LocaleToggle, useLocale } from './i18n/LocaleProvider';
import type { StanceAnalysisResult, StanceSelection } from './analysis/types';

type AppState = 'landing' | 'setup' | 'analyzing' | 'summary';

function AppContent() {
  const { t } = useLocale();
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
        <LocaleToggle />
        <section className="hero-card" aria-labelledby="app-title">
          <p className="eyebrow">{t('app.eyebrow')}</p>
          <h1 id="app-title">{t('app.title')}</h1>
          <p className="lede">{t('app.lede')}</p>
          <button type="button" onClick={() => setState('setup')}>
            {t('app.startButton')}
          </button>
          <p className="privacy-note">{t('app.privacyNote')}</p>
        </section>
      </main>
    );
  }

  if (state === 'setup') {
    return (
      <main className="app-shell">
        <LocaleToggle />
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
        <LocaleToggle />
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
            {t('app.endSession')}
          </button>
        </div>
      </main>
    );
  }

  if (state === 'summary') {
    return (
      <main className="app-shell">
        <LocaleToggle />
        <SessionSummary
          results={sessionResults}
          onClose={handleCloseSummary}
        />
      </main>
    );
  }

  return null;
}

function App() {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
}

export default App;