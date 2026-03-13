import { Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { predictionData } from '@/data/mockStockData';

export function AIPredictionCard() {
  const prices = predictionData.map(d => d.predicted);
  const min = Math.floor(Math.min(...prices) - 2);
  const max = Math.ceil(Math.max(...prices) + 2);

  return (
    <Card className="border-border bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Price Prediction
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-medium">
            Powered by Claude AI
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">AAPL · 7-day forecast</p>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={predictionData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[min, max]}
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 20%, 8%)',
                border: '1px solid hsl(220, 16%, 16%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Predicted']}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(217, 91%, 60%)' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {predictionData.map(d => (
            <div key={d.date} className="text-center">
              <p className="text-[10px] text-muted-foreground">{d.date.slice(4)}</p>
              <p className="text-xs font-medium text-foreground">${d.predicted.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
