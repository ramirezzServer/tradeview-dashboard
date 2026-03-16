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
    <div className="glass-card rounded-lg p-3 text-xs shadow-2xl">
      <p className="mb-2 font-bold text-foreground text-[13px]">{d.date}</p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-1.5">
        {[
          ['Open', d.open],
          ['High', d.high],
          ['Low', d.low],
          ['Close', d.close],
        ].map(([label, val]) => (
          <div key={label as string} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground/50 text-[10px] uppercase tracking-wider">{label as string}</span>
            <span className="text-foreground font-semibold tabular-nums">${(val as number).toFixed(2)}</span>
          </div>
        ))}
        <div className="col-span-2 flex items-center justify-between gap-3 pt-1 border-t border-border/20">
          <span className="text-muted-foreground/50 text-[10px] uppercase tracking-wider">Volume</span>
          <span className="text-foreground font-semibold tabular-nums">{((d.volume) / 1e6).toFixed(1)}M</span>
        </div>
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
          <p className="text-[10px] text-muted-foreground/40 mt-0.5 tracking-wider">NASDAQ · Candlestick Chart</p>
        </div>
        <div className="flex gap-0.5 bg-secondary/30 rounded-lg p-0.5 border border-border/20">
          {TIMEFRAMES.map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-[10px] font-semibold rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-primary/15 text-primary shadow-[0_0_8px_-2px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground/50 hover:text-foreground'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      <div className="px-2 pb-1">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 8%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v.slice(5)}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(228, 18%, 6%)' }} />
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
            <Bar dataKey="volume" barSize={6} fillOpacity={0.25}>
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
