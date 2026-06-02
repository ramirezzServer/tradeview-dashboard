import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import NotFound from '@/pages/NotFound';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

describe('NotFound', () => {
  it('renders a clear sign-in return action for public users', () => {
    render(
      <MemoryRouter initialEntries={['/missing']}>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/login');
  });
});
