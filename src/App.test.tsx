import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the landing screen and acknowledges camera setup start', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole('heading', { name: /stance up/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /start camera setup/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/camera integration is the next deliverable/i);
  });
});
