import { FlaskConical } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { predictionData } from '@/data/mockStockData';

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// This card shows a SIMULATED price forecast for illustration purposes only.
// The data is generated from a random walk seeded at a fixed price — it is NOT
// produced by any AI model and does NOT reflect any real price prediction.
// A genuine AI forecast would require integrating an ML inference service.
// ──────────────────────────────────────────────────────────────────────────────

export function AIPredictionCard() {
  const prices = predictionData.map(d => d.predicted);
  const min = Math.floor(Math.min(...prices) - 2);
  const max = Math.ceil(Math.max(...prices) + 2);

  return (
    <div className="glass-card rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-primary/3 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/12 glow-border">
              <FlaskConical className="h-3 w-3 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-foreground">Price Forecast</h3>
          </div>
          {/* Honest label: this is simulated, not a real AI prediction */}
          <Badge
            variant="secondary"
            className="text-[8px] font-semibold bg-secondary/40 text-muted-foreground/40 border-border/20 tracking-wider uppercase"
          >
            Simulated
          </Badge>
        </div>
        <p className="text-[9px] text-muted-foreground/40 mt-1 tracking-wider">
          AAPL · 7-day illustrative forecast
        </p>
      </div>
      <div className="relative px-1 pb-2">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={predictionData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.5)',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Simulated']}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="4 3"
              fill="url(#predGrad)"
              dot={{ r: 2.5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
              activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
