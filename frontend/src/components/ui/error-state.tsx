import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Tidak bisa memuat data', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('rounded-xl border border-bear/15 bg-bear/5 p-5 text-center', className)} role="alert">
      <AlertCircle className="mx-auto h-5 w-5 text-bear/70" aria-hidden="true" />
      <p className="mt-2 text-app-sm font-semibold text-foreground/85">{title}</p>
      <p className="mt-1 text-app-xs text-muted-foreground/55">{message}</p>
      {onRetry && (
        <Button type="button" size="sm" variant="outline" onClick={onRetry} className="mt-4">
          Coba lagi
        </Button>
      )}
    </div>
  );
}
