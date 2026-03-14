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
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Price Range</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-muted-foreground/70">
          <span>Day Range</span>
          <span>${dayLow.toFixed(2)} — ${dayHigh.toFixed(2)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bear/60 via-chart-accent to-bull/60 transition-all"
            style={{ width: `${dayPos}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-muted-foreground/70">
          <span>52W Range</span>
          <span>${fiftyTwoWeekLow.toFixed(2)} — ${fiftyTwoWeekHigh.toFixed(2)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bear/60 via-chart-accent to-bull/60 transition-all"
            style={{ width: `${yearPos}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Open', value: `$${(currentPrice - 0.56).toFixed(2)}` },
          { label: 'Prev Close', value: `$${(currentPrice - 2.34).toFixed(2)}` },
          { label: 'Avg Volume', value: '58.2M' },
        ].map(item => (
          <div key={item.label} className="text-center">
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{item.label}</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
