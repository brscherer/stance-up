import type { StanceMetric } from '../analysis/types';

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

function getStatusLabel(status: StanceMetric['status']): string {
  switch (status) {
    case 'good': return '✓';
    case 'warn': return '⚠';
    case 'bad': return '✗';
    default: return '?';
  }
}

export function ScorePanel({ overallScore, confidence, metrics, topCues }: ScorePanelProps) {
  return (
    <div className="score-panel" role="region" aria-label="Stance analysis">
      <div className="overall-score">
        <div className="score-circle" style={{ '--score-color': getStatusColor(
          overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warn' : 'bad'
        ) } as React.CSSProperties}>
          <span className="score-value">{overallScore}</span>
          <span className="score-label">/100</span>
        </div>
        <div className="confidence">
          <span>Confidence: {Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {topCues.length > 0 && (
        <div className="top-cues" aria-live="polite">
          <h3>Focus on:</h3>
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
              <span className="metric-badge">{getStatusLabel(metric.status)}</span>
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