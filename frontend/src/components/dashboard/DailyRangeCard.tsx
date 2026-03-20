import { statsOverview } from '@/data/mockStockData';

export function DailyRangeCard() {
  const { currentPrice, fiftyTwoWeekLow, fiftyTwoWeekHigh } = statsOverview;
  const dayLow = currentPrice - 2.45;
  const dayHigh = currentPrice + 1.82;
  const dayRange = dayHigh - dayLow;
  const dayPos = ((currentPrice - dayLow) / dayRange) * 100;
  const yearRange = fiftyTwoWeekHigh - fiftyTwoWeekLow;
  const yearPos = ((currentPrice - fiftyTwoWeekLow) / yearRange) * 100;

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <h3 className="section-header text-foreground/80">Price Range</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-muted-foreground/50 tabular-nums">
          <span>Day Range</span>
          <span>${dayLow.toFixed(2)} — ${dayHigh.toFixed(2)}</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bear/50 via-chart-accent/60 to-bull/50 transition-all duration-700"
            style={{ width: `${dayPos}%` }}
          />
          {/* Current price marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70 rounded-full"
            style={{ left: `${dayPos}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[9px] text-muted-foreground/50 tabular-nums">
          <span>52W Range</span>
          <span>${fiftyTwoWeekLow.toFixed(2)} — ${fiftyTwoWeekHigh.toFixed(2)}</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bear/50 via-chart-accent/60 to-bull/50 transition-all duration-700"
            style={{ width: `${yearPos}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground/70 rounded-full"
            style={{ left: `${yearPos}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/15">
        {[
          { label: 'Open', value: `$${(currentPrice - 0.56).toFixed(2)}` },
          { label: 'Prev Close', value: `$${(currentPrice - 2.34).toFixed(2)}` },
          { label: 'Avg Volume', value: '58.2M' },
        ].map(item => (
          <div key={item.label} className="text-center">
            <p className="text-[8px] text-muted-foreground/35 uppercase tracking-[0.12em]">{item.label}</p>
            <p className="text-[11px] font-bold text-foreground mt-0.5 tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
