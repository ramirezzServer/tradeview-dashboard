import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoadingButton } from '@/components/ui/loading-button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

describe('UX components', () => {
  it('LoadingButton disables and exposes busy state while loading', () => {
    render(<LoadingButton loading loadingLabel="Saving...">Save</LoadingButton>);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('EmptyState renders helpful content and action', async () => {
    const onAction = vi.fn();

    render(<EmptyState title="No holdings yet" description="Add your first position." actionLabel="Add holding" onAction={onAction} />);

    expect(screen.getByText('No holdings yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first position.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add holding/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('ErrorState renders retry action', async () => {
    const onRetry = vi.fn();

    render(<ErrorState message="Data market sedang tidak tersedia." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Data market sedang tidak tersedia.');
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ConfirmDialog calls confirm from destructive action', async () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Remove AAPL?"
        description="This removes AAPL."
        confirmLabel="Remove"
        onOpenChange={() => undefined}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
