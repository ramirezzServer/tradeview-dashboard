import { Clock } from 'lucide-react';
import { useTimeAgo, FreshnessTier } from '@/hooks/useTimeAgo';

interface FreshnessBadgeProps {
  /** Epoch-ms of when the data was last fetched. Pass null to show "–". */
  fetchedAt: number | null | undefined;
  /** Whether to also show "Live · Provider" label when fresh */
  provider?: string;
  className?: string;
}

const tierClass: Record<FreshnessTier, string> = {
  fresh: 'text-bull/60',
  aging: 'text-chart-accent/60',
  stale: 'text-muted-foreground/35',
};

/**
 * A small badge that shows "Updated Xm ago" with colour-coded freshness.
 * Refreshes every 10 s without causing parent re-renders.
 */
export function FreshnessBadge({ fetchedAt, provider, className = '' }: FreshnessBadgeProps) {
  const { timeAgo, tier } = useTimeAgo(fetchedAt ?? null);

  if (!timeAgo) {
    return (
      <span className={`flex items-center gap-1 text-[8px] text-muted-foreground/30 ${className}`}>
        <Clock className="h-2.5 w-2.5" /> —
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 text-[8px] font-medium ${tierClass[tier]} ${className}`}>
      <Clock className="h-2.5 w-2.5" />
      {provider && tier === 'fresh' ? `${provider} · ` : ''}
      {timeAgo}
    </span>
  );
}
