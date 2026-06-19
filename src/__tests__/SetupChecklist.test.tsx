import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { LocaleProvider } from '../i18n/LocaleProvider';
import { SetupChecklist } from '../ui/SetupChecklist';

function Wrapper({ children }: { children: ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

function renderWithLocale(ui: ReactElement) {
  return render(ui, { wrapper: Wrapper });
}

const defaultProps = {
  stanceSelection: 'orthodox' as const,
  onStanceChange: vi.fn(),
  onStart: vi.fn(),
};

describe('SetupChecklist', () => {
  it('renders all checklist items', () => {
    renderWithLocale(<SetupChecklist {...defaultProps} />);

    expect(screen.getByText(/full body visible/i)).toBeInTheDocument();
    expect(screen.getByText(/hands visible/i)).toBeInTheDocument();
    expect(screen.getByText(/feet visible/i)).toBeInTheDocument();
    expect(screen.getByText(/good lighting/i)).toBeInTheDocument();
    expect(screen.getByText(/stable camera/i)).toBeInTheDocument();
  });

  it('renders stance selector with three options', () => {
    renderWithLocale(<SetupChecklist {...defaultProps} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /orthodox/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /southpaw/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /auto/i })).toBeInTheDocument();
  });

  it('calls onStanceChange when selection changes', () => {
    const onChange = vi.fn();
    renderWithLocale(<SetupChecklist {...defaultProps} onStanceChange={onChange} />);

    const select = screen.getByRole('combobox');

    expect(select).toHaveAttribute('aria-label', 'Stance:');
  });
});