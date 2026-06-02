import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LegalPage from '@/pages/LegalPage';

describe('LegalPage', () => {
  it('renders the privacy policy with practical data handling copy', () => {
    render(
      <MemoryRouter>
        <LegalPage kind="privacy" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByText(/account\/profile data/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /legal links/i })).toBeInTheDocument();
  });

  it('renders the market disclaimer as not financial advice', () => {
    render(
      <MemoryRouter>
        <LegalPage kind="disclaimer" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /market data disclaimer/i })).toBeInTheDocument();
    expect(screen.getByText(/nothing in tradeview dashboard is financial/i)).toBeInTheDocument();
  });
});
