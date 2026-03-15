import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Eye, TrendingUp, TrendingDown, Search, Star, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTickerSimulation } from '@/hooks/useTickerSimulation';
import { watchlistAssets } from '@/data/mockStockData';
import { Input } from '@/components/ui/input';
import { WatchlistAsset } from '@/types/stock';

const extendedAssets: WatchlistAsset[] = [
  ...watchlistAssets,
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 425.52, change: 3.56, changePercent: 0.84, type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.15, change: 2.02, changePercent: 1.12, type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms', price: 502.30, change: 10.72, changePercent: 2.18, type: 'stock' },
  { symbol: 'SOL', name: 'Solana', price: 148.62, change: -3.41, changePercent: -2.24, type: 'crypto' },
];

const volumeMap: Record<string, string> = {
  AAPL: '67.8M', TSLA: '112.4M', NVDA: '48.2M', BTC: '$42.1B', ETH: '$18.7B',
  MSFT: '22.1M', AMZN: '35.6M', META: '19.8M', SOL: '$3.2B',
};

const mcapMap: Record<string, string> = {
  AAPL: '$2.94T', TSLA: '$791B', NVDA: '$2.17T', BTC: '$1.91T', ETH: '$462B',
  MSFT: '$3.16T', AMZN: '$1.88T', META: '$1.28T', SOL: '$64.2B',
};

const sparkData: Record<string, number[]> = {
  AAPL: [186, 187, 188, 187.5, 189, 189.8],
  TSLA: [254, 252, 250, 249, 248, 248.4],
  NVDA: [870, 875, 878, 880, 879, 882],
  BTC: [96200, 96800, 97100, 97000, 97400, 97430],
  ETH: [3890, 3870, 3860, 3850, 3845, 3842],
  MSFT: [422, 423, 424, 424.5, 425, 425.5],
  AMZN: [180, 180.5, 181, 181.8, 182, 182.2],
  META: [492, 495, 498, 500, 501, 502],
  SOL: [152, 151, 150, 149.5, 149, 148.6],
};

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 56;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'hsl(var(--bull))' : 'hsl(var(--bear))'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FilterTab = 'all' | 'stocks' | 'crypto';

const Watchlist = () => {
  const { assets, flashMap } = useTickerSimulation(extendedAssets);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = assets.filter(a => {
    const matchesSearch = a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'stocks' && a.type === 'stock') || (filter === 'crypto' && a.type === 'crypto');
    return matchesSearch && matchesFilter;
  });

  const totalAssets = assets.length;
  const dailyGain = assets.reduce((sum, a) => sum + a.change * (a.type === 'crypto' ? 0.1 : 10), 0);
  const best = [...assets].sort((a, b) => b.changePercent - a.changePercent)[0];

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'stocks', label: 'Stocks' },
    { key: 'crypto', label: 'Crypto' },
  ];

  return (
    <DashboardLayout title="Watchlist">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Assets', value: totalAssets.toString(), icon: Eye, sub: 'Tracked' },
            { label: 'Daily Gain/Loss', value: `${dailyGain >= 0 ? '+' : ''}$${Math.abs(dailyGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: dailyGain >= 0 ? ArrowUpRight : ArrowDownRight, color: dailyGain >= 0 ? 'text-bull' : 'text-bear' },
            { label: 'Best Performer', value: best ? `${best.symbol} ${best.changePercent >= 0 ? '+' : ''}${best.changePercent.toFixed(2)}%` : '—', icon: TrendingUp, color: 'text-bull' },
          ].map((c, i) => (
            <div key={c.label} className="glass-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{c.label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
                  <c.icon className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className={`text-lg font-bold mt-2 tabular-nums ${c.color || 'text-foreground'}`}>{c.value}</p>
              {c.sub && <p className="text-[10px] text-muted-foreground/40 mt-0.5">{c.sub}</p>}
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 h-9 bg-secondary/40 border-border/30 text-sm"
              />
            </div>
            <div className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    filter === t.key
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/20">
            <Star className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Active Watchlist</h2>
            <span className="ml-auto text-[10px] text-muted-foreground/40">{filtered.length} assets</span>
          </div>

          {/* Header Row */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_80px_80px] gap-2 px-5 py-2.5 text-[9px] uppercase tracking-wider text-muted-foreground/40 font-semibold border-b border-border/10">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">Change</span>
            <span className="text-right">Vol / MCap</span>
            <span className="text-center">Trend</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-border/10">
            {filtered.map((a, i) => {
              const positive = a.changePercent >= 0;
              const flash = flashMap[a.symbol];
              return (
                <div
                  key={a.symbol}
                  className={`grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_80px_80px] gap-2 items-center px-5 py-3 transition-all duration-200 hover:bg-accent/20 animate-fade-up ${
                    flash === 'bull' ? 'flash-bull' : flash === 'bear' ? 'flash-bear' : ''
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Asset info */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-secondary/60 border border-border/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-foreground">{a.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{a.symbol}</p>
                      <p className="text-[10px] text-muted-foreground/50">{a.name}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-right text-sm font-bold text-foreground tabular-nums">
                    ${a.type === 'crypto' ? a.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : a.price.toFixed(2)}
                  </p>

                  {/* Change */}
                  <div className="hidden md:flex items-center justify-end gap-1.5">
                    {positive ? <TrendingUp className="h-3 w-3 text-bull" /> : <TrendingDown className="h-3 w-3 text-bear" />}
                    <span className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{a.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Volume / MCap */}
                  <div className="hidden md:block text-right">
                    <p className="text-[11px] text-foreground tabular-nums">{volumeMap[a.symbol] || '—'}</p>
                    <p className="text-[9px] text-muted-foreground/40">{mcapMap[a.symbol] || '—'}</p>
                  </div>

                  {/* Sparkline */}
                  <div className="hidden md:flex justify-center">
                    {sparkData[a.symbol] && <MiniSparkline data={sparkData[a.symbol]} positive={positive} />}
                  </div>

                  {/* Action */}
                  <div className="hidden md:flex justify-end">
                    <button className="text-[10px] font-semibold text-primary/70 hover:text-primary border border-primary/15 hover:border-primary/30 rounded-md px-2.5 py-1 transition-colors">
                      Trade
                    </button>
                  </div>

                  {/* Mobile change display */}
                  <div className="md:hidden text-right">
                    <p className={`text-xs font-semibold tabular-nums ${positive ? 'text-bull' : 'text-bear'}`}>
                      {positive ? '+' : ''}{a.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
