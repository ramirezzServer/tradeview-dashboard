import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ohlcvData } from '@/data/mockStockData';
import { OHLCVData } from '@/types/stock';

type Timeframe = '1W' | '1M' | '3M';

const TIMEFRAMES: Timeframe[] = ['1W', '1M', '3M'];

const sliceData = (tf: Timeframe): OHLCVData[] => {
  const len = ohlcvData.length;
  if (tf === '1W') return ohlcvData.slice(Math.max(0, len - 5));
  if (tf === '1M') return ohlcvData.slice(Math.max(0, len - 22));
  return ohlcvData;
};

interface CandleData extends OHLCVData {
  fill: string;
  wickHigh: number;
  wickLow: number;
  bodyBottom: number;
  bodyHeight: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload as CandleData;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{d.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
        <span>Open</span><span className="text-foreground font-medium">${d.open.toFixed(2)}</span>
        <span>High</span><span className="text-foreground font-medium">${d.high.toFixed(2)}</span>
        <span>Low</span><span className="text-foreground font-medium">${d.low.toFixed(2)}</span>
        <span>Close</span><span className="text-foreground font-medium">${d.close.toFixed(2)}</span>
        <span>Volume</span><span className="text-foreground font-medium">{(d.volume / 1e6).toFixed(1)}M</span>
      </div>
    </div>
  );
}

export function CandlestickChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>('3M');

  const { chartData, minPrice, maxPrice } = useMemo(() => {
    const raw = sliceData(timeframe);
    const prices = raw.flatMap(d => [d.low, d.high]);
    const min = Math.floor(Math.min(...prices) - 2);
    const max = Math.ceil(Math.max(...prices) + 2);

    const mapped: CandleData[] = raw.map(d => {
      const bullish = d.close >= d.open;
      return {
        ...d,
        fill: bullish ? 'hsl(142, 71%, 45%)' : 'hsl(0, 72%, 51%)',
        wickHigh: d.high,
        wickLow: d.low,
        bodyBottom: Math.min(d.open, d.close),
        bodyHeight: Math.abs(d.close - d.open),
      };
    });
    return { chartData: mapped, minPrice: min, maxPrice: max };
  }, [timeframe]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">AAPL — Apple Inc.</CardTitle>
          <p className="text-xs text-muted-foreground">NASDAQ · Candlestick</p>
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v.slice(5)}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(220, 16%, 12%)' }} />
            {/* Wicks as thin bars from low to high */}
            <Bar dataKey="high" barSize={1} stackId="wick" fillOpacity={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
            {/* Body bars */}
            <Bar dataKey="bodyHeight" barSize={8} fillOpacity={0.9} stackId="body" yAxisId={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        {/* Volume mini bar */}
        <ResponsiveContainer width="100%" height={60}>
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Bar dataKey="volume" barSize={6} fillOpacity={0.4}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
