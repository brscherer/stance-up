import type { StanceAnalysisResult } from '../analysis/types';

interface SessionSummaryProps {
  results: StanceAnalysisResult[];
  onClose: () => void;
}

function aggregateMetrics(results: StanceAnalysisResult[]): Map<string, { scores: number[]; confidences: number[]; label: string }> {
  const map = new Map<string, { scores: number[]; confidences: number[]; label: string }>();

  for (const result of results) {
    for (const metric of result.metrics) {
      const existing = map.get(metric.id) || { scores: [], confidences: [], label: metric.label };
      existing.scores.push(metric.score);
      existing.confidences.push(metric.confidence);
      map.set(metric.id, existing);
    }
  }

  return map;
}

function countCues(results: StanceAnalysisResult[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const result of results) {
    for (const cue of result.topCues) {
      map.set(cue, (map.get(cue) || 0) + 1);
    }
  }

  return map;
}

export function SessionSummary({ results, onClose }: SessionSummaryProps) {
  if (results.length === 0) {
    return (
      <div className="session-summary">
        <h2>Session Summary</h2>
        <p>No data collected yet.</p>
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    );
  }

  const firstTimestamp = results[0].timestampMs;
  const lastTimestamp = results[results.length - 1].timestampMs;
  const durationMs = lastTimestamp - firstTimestamp;
  const durationSec = (durationMs / 1000).toFixed(1);

  const avgScore = Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length);
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

  const aggregated = aggregateMetrics(results);
  const cueCounts = countCues(results);

  // Find best and worst metrics
  const metricAverages = Array.from(aggregated.entries()).map(([id, data]) => ({
    id,
    label: data.label,
    avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    avgConfidence: data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length,
  }));

  const sortedMetrics = [...metricAverages].sort((a, b) => b.avgScore - a.avgScore);
  const bestMetric = sortedMetrics[0];
  const worstMetric = sortedMetrics[sortedMetrics.length - 1];

  // Top 3 recurring cues
  const topCues = Array.from(cueCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cue, count]) => ({ cue, count }));

  return (
    <div className="session-summary" role="dialog" aria-label="Session summary">
      <div className="summary-header">
        <h2>Session Complete</h2>
        <button onClick={onClose} className="close-button" aria-label="Close">✕</button>
      </div>

      <div className="summary-stats">
        <div className="stat">
          <span className="stat-value">{avgScore}</span>
          <span className="stat-label">Average Score</span>
        </div>
        <div className="stat">
          <span className="stat-value">{Math.round(avgConfidence * 100)}%</span>
          <span className="stat-label">Avg Confidence</span>
        </div>
        <div className="stat">
          <span className="stat-value">{durationSec}s</span>
          <span className="stat-label">Duration</span>
        </div>
        <div className="stat">
          <span className="stat-value">{results.length}</span>
          <span className="stat-label">Frames</span>
        </div>
      </div>

      <div className="summary-section">
        <h3>Best: {bestMetric.label} ({bestMetric.avgScore})</h3>
        <h3>Needs Work: {worstMetric.label} ({worstMetric.avgScore})</h3>
      </div>

      {topCues.length > 0 && (
        <div className="summary-section">
          <h3>Top Focus Areas</h3>
          <ul className="cue-list">
            {topCues.map(({ cue, count }, i) => (
              <li key={i}>
                <span className="cue-text">{cue}</span>
                <span className="cue-count">({count}x)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="summary-actions">
        <button onClick={onClose} className="primary-button">Done</button>
      </div>

      <p className="privacy-note">
        Session data is stored locally only. No video or pose data leaves your device.
      </p>
    </div>
  );
}