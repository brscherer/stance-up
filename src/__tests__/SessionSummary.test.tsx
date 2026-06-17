import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionSummary } from '../ui/SessionSummary';
import type { StanceAnalysisResult } from '../analysis/types';

describe('SessionSummary', () => {
  const mockResults: StanceAnalysisResult[] = [
    {
      timestampMs: 1000,
      overallScore: 75,
      confidence: 0.85,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'warn', score: 70, confidence: 0.8, message: 'Dropping', correction: 'Keep hands up' },
        { id: 'knee-softness', label: 'Knee softness', status: 'bad', score: 35, confidence: 0.9, message: 'Too straight', correction: 'Soften knees' },
      ],
      topCues: ['Soften knees', 'Keep hands up'],
    },
    {
      timestampMs: 2000,
      overallScore: 80,
      confidence: 0.9,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'warn', score: 70, confidence: 0.8, message: 'Dropping', correction: 'Keep hands up' },
        { id: 'knee-softness', label: 'Knee softness', status: 'bad', score: 35, confidence: 0.9, message: 'Too straight', correction: 'Soften knees' },
      ],
      topCues: ['Soften knees', 'Keep hands up'],
    },
    {
      timestampMs: 3000,
      overallScore: 82,
      confidence: 0.88,
      metrics: [
        { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'guard-position', label: 'Guard position', status: 'good', score: 85, confidence: 0.9, message: 'Good', correction: undefined },
        { id: 'knee-softness', label: 'Knee softness', status: 'warn', score: 65, confidence: 0.8, message: 'Better', correction: 'Keep softening' },
      ],
      topCues: ['Keep softening'],
    },
  ];

  it('renders average score', () => {
    render(<SessionSummary results={mockResults} onClose={vi.fn()} />);

    // Average of 75, 80, 82 = 79
    expect(screen.getByText(/79/)).toBeInTheDocument();
  });

  it('renders best and worst metrics', () => {
    render(<SessionSummary results={mockResults} onClose={vi.fn()} />);

    expect(screen.getByText(/best/i)).toBeInTheDocument();
    expect(screen.getByText(/needs work/i)).toBeInTheDocument();
  });

  it('shows top recurring cues', () => {
    render(<SessionSummary results={mockResults} onClose={vi.fn()} />);

    // 'Soften knees' appears in all 3, 'Keep hands up' in 2
    expect(screen.getByText(/soften knees/i)).toBeInTheDocument();
    expect(screen.getByText(/keep hands up/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<SessionSummary results={mockResults} onClose={onClose} />);

    const button = screen.getByRole('button', { name: /close/i });
    button.click();

    expect(onClose).toHaveBeenCalled();
  });

  it('shows session duration', () => {
    render(<SessionSummary results={mockResults} onClose={vi.fn()} />);

    // 3000ms - 1000ms = 2000ms = 2 seconds
    expect(screen.getByText(/2\.0\s*s/)).toBeInTheDocument();
  });
});
