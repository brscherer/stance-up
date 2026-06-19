import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveOverlay } from '../ui/LiveOverlay';

describe('LiveOverlay', () => {
  it('renders canvas element', () => {
    render(<LiveOverlay landmarks={[]} displayRect={{ width: 640, height: 480, offsetX: 0, offsetY: 0 }} />);

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('draws landmarks when provided', () => {
    render(
      <LiveOverlay
        landmarks={[
          { x: 0.5, y: 0.5, visibility: 0.9 },
          { x: 0.4, y: 0.4, visibility: 0.9 },
        ]}
        displayRect={{ width: 640, height: 480, offsetX: 0, offsetY: 0 }}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});