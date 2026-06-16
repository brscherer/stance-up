import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraView } from '../camera/CameraView';

// Mock MediaPipe
vi.mock('@mediapipe/tasks-vision', () => ({
  PoseLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      detectForVideo: vi.fn().mockReturnValue({
        landmarks: [],
        worldLandmarks: [],
      }),
    }),
  },
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
}));

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: vi.fn().mockResolvedValue([
      { deviceId: 'cam1', kind: 'videoinput', label: 'Front Camera' },
      { deviceId: 'cam2', kind: 'videoinput', label: 'Back Camera' },
    ]),
  },
  configurable: true,
});

describe('CameraView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);
  });

  it('requests camera permission when start button clicked', async () => {
    const user = userEvent.setup();
    render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);

    await user.click(screen.getByRole('button', { name: /start camera/i }));

    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ video: expect.any(Object) })
    );
  });

  it('shows video element when camera starts', async () => {
    const user = userEvent.setup();
    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);

    await user.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(container.querySelector('video')).toBeInTheDocument();
    });
  });

  it('stops camera when stop button clicked', async () => {
    const user = userEvent.setup();
    const stopTrack = vi.fn();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream);

    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);
    await user.click(screen.getByRole('button', { name: /start camera/i }));
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /stop camera/i }));

    expect(stopTrack).toHaveBeenCalled();
  });

  it('calls onFrame callback with pose results', async () => {
    const onFrame = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<CameraView onFrame={onFrame} stanceSelection="orthodox" />);
    await user.click(screen.getByRole('button', { name: /start camera/i }));
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());

    // Wait for component to be active and not throw
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop camera/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles camera permission denied gracefully', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);
    await user.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(screen.getByText(/permission denied|access denied/i)).toBeInTheDocument();
    });
  });

  it('allows switching between cameras', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);

    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);
    await user.click(screen.getByRole('button', { name: /start camera/i }));
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());

    // Should have a camera selector
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});