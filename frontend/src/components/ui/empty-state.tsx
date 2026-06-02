import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 px-5 text-center', className)}>
      {icon && <div className="mb-3 text-muted-foreground/35">{icon}</div>}
      <p className="text-app-sm font-semibold text-foreground/80">{title}</p>
      {description && <p className="text-app-xs text-muted-foreground/40 mt-1 max-w-sm leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" size="sm" variant="outline" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
