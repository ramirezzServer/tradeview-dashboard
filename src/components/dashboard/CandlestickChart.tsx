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
} from 'recharts';
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
    <div className="glass-card rounded-lg p-3 text-xs">
      <p className="mb-1.5 font-semibold text-foreground">{d.date}</p>
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
        fill: bullish ? 'hsl(152, 69%, 46%)' : 'hsl(0, 72%, 51%)',
        wickHigh: d.high,
        wickLow: d.low,
        bodyBottom: Math.min(d.open, d.close),
        bodyHeight: Math.abs(d.close - d.open),
      };
    });
    return { chartData: mapped, minPrice: min, maxPrice: max };
  }, [timeframe]);

  return (
    <div className="glass-card rounded-xl overflow-hidden gradient-border">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">AAPL — Apple Inc.</h2>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">NASDAQ · Candlestick Chart</p>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
          {TIMEFRAMES.map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-[11px] font-medium rounded-md ${
                timeframe === tf
                  ? 'bg-primary/20 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      <div className="px-2 pb-1">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 15%, 10%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(220, 15%, 40%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v.slice(5)}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 10, fill: 'hsl(220, 15%, 40%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(225, 18%, 8%)' }} />
            <Bar dataKey="high" barSize={1} stackId="wick" fillOpacity={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
            <Bar dataKey="bodyHeight" barSize={8} fillOpacity={0.9} stackId="body" yAxisId={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={50}>
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Bar dataKey="volume" barSize={6} fillOpacity={0.3}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
