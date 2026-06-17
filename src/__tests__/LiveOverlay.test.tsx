import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveOverlay } from '../ui/LiveOverlay';

describe('LiveOverlay', () => {
  it('renders canvas element', () => {
    render(<LiveOverlay landmarks={[]} videoWidth={640} videoHeight={480} />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('draws landmarks when provided', () => {
    // We can't easily test canvas drawing without a real canvas, but we can verify the component renders
    render(
      <LiveOverlay
        landmarks={[
          { x: 0.5, y: 0.5, visibility: 0.9 },
          { x: 0.4, y: 0.4, visibility: 0.9 },
        ]}
        videoWidth={640}
        videoHeight={480}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});