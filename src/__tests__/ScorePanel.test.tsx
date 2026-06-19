import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { LocaleProvider } from '../i18n/LocaleProvider';
import { ScorePanel } from '../ui/ScorePanel';

function Wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

function renderWithLocale(ui: ReactElement) {
  return render(ui, { wrapper: Wrapper });
}
import type { StanceMetric } from '../analysis/types';

describe('ScorePanel', () => {
  const mockMetrics: StanceMetric[] = [
    { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
    { id: 'stance-length', label: 'Stance length', status: 'warn', score: 70, confidence: 0.8, message: 'Too short', correction: 'Step back' },
    { id: 'knee-softness', label: 'Knee softness', status: 'bad', score: 35, confidence: 0.9, message: 'Too straight', correction: 'Soften knees' },
    { id: 'guard-position', label: 'Guard position', status: 'good', score: 92, confidence: 0.95, message: 'Good', correction: undefined },
    { id: 'head-posture', label: 'Head posture', status: 'good', score: 88, confidence: 0.9, message: 'Good', correction: undefined },
    { id: 'shoulder-hip-alignment', label: 'Shoulder/hip alignment', status: 'warn', score: 65, confidence: 0.8, message: 'Too square', correction: 'Angle stance' },
  ];

  it('renders overall score', () => {
    renderWithLocale(<ScorePanel overallScore={78} confidence={0.85} metrics={mockMetrics} topCues={['Soften knees', 'Step back']} />);

    expect(screen.getByText(/78/)).toBeInTheDocument();
  });

  it('renders top cues', () => {
    renderWithLocale(<ScorePanel overallScore={78} confidence={0.85} metrics={mockMetrics} topCues={['Soften knees', 'Step back']} />);

    const topCues = screen.getByText(/focus on:/i).closest('div');
    expect(topCues).toBeInTheDocument();
    expect(topCues!.textContent).toContain('Soften knees');
    expect(topCues!.textContent).toContain('Step back');
  });

  it('renders metric chips with correct colors', () => {
    renderWithLocale(<ScorePanel overallScore={78} confidence={0.85} metrics={mockMetrics} topCues={[]} />);

    expect(screen.getByText(/Base width/)).toBeInTheDocument();
    expect(screen.getByText(/Stance length/)).toBeInTheDocument();
    expect(screen.getByText(/Knee softness/)).toBeInTheDocument();
  });

  it('shows confidence indicator', () => {
    renderWithLocale(<ScorePanel overallScore={78} confidence={0.85} metrics={mockMetrics} topCues={[]} />);

    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });
});
