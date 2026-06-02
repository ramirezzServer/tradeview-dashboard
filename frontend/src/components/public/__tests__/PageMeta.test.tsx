import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageMeta } from '@/components/public/PageMeta';

describe('PageMeta', () => {
  it('updates document title, description, and robots meta', () => {
    render(
      <PageMeta
        title="Privacy Policy | TradeView Dashboard"
        description="Privacy details for TradeView."
        robots="noindex,nofollow"
      />,
    );

    expect(document.title).toBe('Privacy Policy | TradeView Dashboard');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Privacy details for TradeView.');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  });
});
