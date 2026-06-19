import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraView } from '../camera/CameraView';

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

  it('auto-requests camera permission on mount', async () => {
    render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({ video: expect.any(Object) })
      );
    });
  });

  it('shows video element when camera starts', async () => {
    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);

    await waitFor(() => {
      expect(container.querySelector('video')).toBeInTheDocument();
    });
  });

  it('stops camera when stop button clicked', async () => {
    const stopTrack = vi.fn();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: stopTrack }],
    } as unknown as MediaStream);

    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /stop camera/i }));

    expect(stopTrack).toHaveBeenCalled();
  });

  it('calls onFrame callback with pose results', async () => {
    const onFrame = vi.fn();
    const { container } = render(<CameraView onFrame={onFrame} stanceSelection="orthodox" />);
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());
  });

  it('handles camera permission denied gracefully', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);

    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });
  });

  it('allows switching between cameras', async () => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    } as unknown as MediaStream);

    const { container } = render(<CameraView onFrame={vi.fn()} stanceSelection="orthodox" />);
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument());

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
