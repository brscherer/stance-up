import type { StanceMetric } from '../analysis/types';
import { useLocale } from '../i18n/LocaleProvider';
import { isVoiceMuted, setMuted } from '../audio/voiceFeedback';
import { useState } from 'react';

interface ScorePanelProps {
  overallScore: number;
  confidence: number;
  metrics: StanceMetric[];
  topCues: string[];
}

function getStatusColor(status: StanceMetric['status']): string {
  switch (status) {
    case 'good': return '#4ade80';
    case 'warn': return '#fbbf24';
    case 'bad': return '#f87171';
    default: return '#9ca3af';
  }
}

export function ScorePanel({ overallScore, confidence, metrics, topCues }: ScorePanelProps) {
  const { t } = useLocale();
  const [muted, setMutedState] = useState(isVoiceMuted());

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const statusLabels: Record<string, string> = {
    good: t('scorePanel.good'),
    warn: t('scorePanel.warn'),
    bad: t('scorePanel.bad'),
    unknown: t('scorePanel.unknown'),
  };

  return (
    <div className="score-panel" role="region" aria-label={t('scorePanel.stanceAnalysis')}>
      <div className="score-panel-header">
        <span className="score-panel-title">{t('scorePanel.stanceAnalysis')}</span>
        <button
          className="voice-toggle"
          onClick={toggleMute}
          aria-label={muted ? t('voice.unmute') : t('voice.mute')}
          title={muted ? t('voice.unmute') : t('voice.mute')}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      <div className="overall-score">
        <div className="score-circle" style={{ '--score-color': getStatusColor(
          overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warn' : 'bad'
        ) } as React.CSSProperties}>
          <span className="score-value">{overallScore}</span>
          <span className="score-label">{t('scorePanel.scoreLabel')}</span>
        </div>
        <div className="confidence">
          <span>{t('scorePanel.confidence')} {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {topCues.length > 0 && (
        <div className="top-cues" aria-live="polite">
          <h3>{t('scorePanel.focusOn')}</h3>
          <ul>
            {topCues.slice(0, 3).map((cue, i) => (
              <li key={i}>{cue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="metrics-grid">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="metric-chip"
            style={{ borderLeftColor: getStatusColor(metric.status) }}
          >
            <div className="metric-header">
              <span className="metric-badge">{statusLabels[metric.status]}</span>
              <span className="metric-name">{metric.label}</span>
              <span className="metric-score">{metric.score}</span>
            </div>
            {metric.correction && (
              <div className="metric-correction">{metric.correction}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}