import { Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { predictionData } from '@/data/mockStockData';

export function AIPredictionCard() {
  const prices = predictionData.map(d => d.predicted);
  const min = Math.floor(Math.min(...prices) - 2);
  const max = Math.ceil(Math.max(...prices) + 2);

  return (
    <div className="glass-card rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">AI Prediction</h3>
          </div>
          <Badge variant="secondary" className="text-[9px] font-medium bg-primary/10 text-primary/80 border-primary/10">
            Powered by Claude AI
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1">AAPL · 7-day forecast</p>
      </div>
      <div className="relative px-1 pb-2">
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={predictionData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 40%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 40%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(225, 22%, 7%)',
                border: '1px solid hsl(225, 15%, 12%)',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 8px 30px -12px hsl(0 0% 0% / 0.5)',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Predicted']}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#predGrad)"
              dot={{ r: 2.5, fill: 'hsl(217, 91%, 60%)', strokeWidth: 0 }}
              activeDot={{ r: 4, stroke: 'hsl(217, 91%, 60%)', strokeWidth: 2, fill: 'hsl(225, 22%, 7%)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
