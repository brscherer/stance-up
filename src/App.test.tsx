import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock CameraView to avoid needing real camera
vi.mock('./camera/CameraView', () => ({
  CameraView: ({ onFrame }: { onFrame: (result: unknown) => void }) => {
    // Simulate a frame result after a short delay
    setTimeout(() => {
      onFrame({
        timestampMs: Date.now(),
        overallScore: 78,
        confidence: 0.85,
        metrics: [
          { id: 'base-width', label: 'Base width', status: 'good', score: 90, confidence: 0.9, message: 'Good', correction: undefined },
          { id: 'knee-softness', label: 'Knee softness', status: 'bad', score: 35, confidence: 0.9, message: 'Too straight', correction: 'Soften knees' },
        ],
        topCues: ['Soften knees'],
      });
    }, 100);

    return <div data-testid="camera-view">Camera Active</div>;
  },
}));

describe('App', () => {
  it('renders the landing screen', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /stance up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start camera setup/i })).toBeInTheDocument();
  });

  it('navigates to setup screen when start button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start camera setup/i }));

    expect(screen.getByText(/camera setup/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('navigates to analyzing when start camera clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start camera setup/i }));
    await user.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });
  });

  it('shows score panel when analyzing', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start camera setup/i }));
    await user.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(screen.getByText(/78/)).toBeInTheDocument();
    });
  });

  it('navigates to summary when end session clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /start camera setup/i }));
    await user.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /end session/i }));

    await waitFor(() => {
      expect(screen.getByText(/session complete/i)).toBeInTheDocument();
    });
  });
});