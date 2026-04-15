import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileBarChart, DollarSign, BarChart2, Activity, Wifi, WifiOff, FlaskConical } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useFinnhubProfile } from '@/hooks/useFinnhubProfile';
import { useFinnhubEarnings } from '@/hooks/useFinnhubEarnings';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

// ─── Fallback data (shown when Finnhub unavailable) ───────────────────────────

const mockKeyMetrics = [
  { label: 'Revenue (TTM)', value: '$383.3B', change: '+8.2%', positive: true },
  { label: 'Net Income',    value: '$97.0B',  change: '+12.4%', positive: true },
  { label: 'EPS (TTM)',     value: '$6.42',   change: '+10.8%', positive: true },
  { label: 'Market Cap',    value: '$2.94T',  change: '+18.6%', positive: true },
  { label: 'P/E Ratio',     value: '29.6x',   change: 'vs 28.2x avg', positive: false, neutral: true },
  { label: 'Dividend Yield',value: '0.52%',   change: '$0.96/yr',   positive: true, neutral: true },
];

const mockValuationMetrics = [
  { label: 'P/E (Forward)', key: 'peTTM' },
  { label: 'PEG Ratio',     key: 'pegRatio' },
  { label: 'P/S Ratio',     key: 'psTTM' },
  { label: 'P/B Ratio',     key: 'pbAnnual' },
  { label: 'EV/EBITDA',     key: 'evEbitda' },
  { label: 'Free Cash Flow',key: 'freeCashFlowTTM' },
  { label: 'Debt/Equity',   key: 'totalDebtToEquityQuarterly' },
  { label: 'Current Ratio', key: 'currentRatioQuarterly' },
  { label: 'ROE',           key: 'roeTTM' },
  { label: 'ROA',           key: 'roaRfy' },
  { label: 'Gross Margin',  key: 'grossMarginTTM' },
  { label: 'Operating Margin', key: 'operatingMarginTTM' },
  { label: 'Net Margin',    key: 'netProfitMarginTTM' },
  { label: 'Beta',          key: 'beta' },
  { label: 'Shares Outstanding', key: 'shareOutstanding' },
  { label: '52W High',      key: '52WeekHigh' },
];

const mockValuationValues: Record<string, string> = {
  'P/E (Forward)': '27.8x', 'PEG Ratio': '2.14', 'P/S Ratio': '7.66x', 'P/B Ratio': '48.2x',
  'EV/EBITDA': '22.4x', 'Free Cash Flow': '$112.4B', 'Debt/Equity': '1.52', 'Current Ratio': '1.07',
  'ROE': '160.8%', 'ROA': '28.4%', 'Gross Margin': '46.2%', 'Operating Margin': '30.8%',
  'Net Margin': '25.3%', 'Beta': '1.24', 'Shares Outstanding': '15.46B', '52W High': '$199.62',
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatMetricValue(key: string, val: number | null): string {
  if (val === null || val === undefined) return '—';
  if (key.includes('Margin') || key === 'roeTTM' || key === 'roaRfy') return `${val.toFixed(1)}%`;
  if (key === 'freeCashFlowTTM') {
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    return `$${(val / 1e6).toFixed(0)}M`;
  }
  if (key === 'shareOutstanding') return `${(val / 1e3).toFixed(2)}B`;
  if (val > 100) return val.toFixed(0);
  return val.toFixed(2);
}

function quarterLabel(period: string): string {
  // period = "YYYY-MM-DD" — map month to quarter
  const [year, month] = period.split('-').map(Number);
  const q = Math.ceil(month / 3);
  return `Q${q} ${year}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SYMBOL = 'AAPL';

const FinancialSnapshot = () => {
  const { data: profileData, loading: profileLoading, isLive: profileLive } = useFinnhubProfile(SYMBOL);
  const { data: earnings,    loading: earningsLoading, isLive: earningsLive } = useFinnhubEarnings(SYMBOL);

  const loading = profileLoading || earningsLoading;

  // Key metrics — prefer live profile
  const keyMetrics = profileLive && profileData.profile
    ? [
        { label: 'Company',    value: profileData.profile.name,  change: profileData.profile.exchange, positive: true, neutral: true },
        { label: 'Industry',   value: profileData.profile.finnhubIndustry, change: profileData.profile.country, positive: true, neutral: true },
        {
          label: 'Market Cap',
          value: profileData.profile.marketCapitalization > 1000
            ? `$${(profileData.profile.marketCapitalization / 1000).toFixed(2)}T`
            : `$${profileData.profile.marketCapitalization.toFixed(0)}B`,
          change: 'Live', positive: true, neutral: true,
        },
        { label: 'Shares Out', value: `${(profileData.profile.shareOutstanding / 1000).toFixed(2)}B`, change: 'Float', positive: true, neutral: true },
        { label: 'IPO Date',   value: profileData.profile.ipo, change: profileData.profile.currency, positive: true, neutral: true },
        { label: 'Exchange',   value: profileData.profile.exchange, change: profileData.profile.country, positive: true, neutral: true },
      ]
    : mockKeyMetrics;

  // Valuation metrics — prefer live
  const valuationData = mockValuationMetrics.map(m => ({
    label: m.label,
    value: profileLive && profileData.metrics[m.key] !== undefined && profileData.metrics[m.key] !== null
      ? formatMetricValue(m.key, profileData.metrics[m.key] as number)
      : mockValuationValues[m.label] || '—',
    isLive: profileLive && profileData.metrics[m.key] !== undefined && profileData.metrics[m.key] !== null,
  }));

  // Earnings chart — prefer real data
  const revenueChart = earningsLive && earnings.length > 0
    ? earnings
        .slice()
        .sort((a, b) => a.period.localeCompare(b.period)) // oldest first for chart
        .map(e => ({ q: quarterLabel(e.period), eps: e.actual ?? e.estimate ?? 0, isEstimate: e.actual === null }))
    : [
        { q: 'Q1 24', eps: 1.53, isEstimate: false }, { q: 'Q2 24', eps: 1.40, isEstimate: false },
        { q: 'Q3 24', eps: 1.64, isEstimate: false }, { q: 'Q4 24', eps: 2.18, isEstimate: false },
        { q: 'Q1 25', eps: 1.65, isEstimate: true  }, { q: 'Q2 25', eps: 1.43, isEstimate: true  },
      ];

  // Earnings history table
  const earningsTable = earningsLive && earnings.length > 0
    ? earnings.slice(0, 6).map(e => ({
        quarter:   quarterLabel(e.period),
        eps:       e.actual !== null ? `$${e.actual.toFixed(2)}` : '—',
        estimate:  e.estimate !== null ? `$${e.estimate.toFixed(2)}` : '—',
        surprise:  e.surprisePercent !== null ? `${e.surprisePercent >= 0 ? '+' : ''}${e.surprisePercent.toFixed(2)}%` : '—',
        positive:  (e.surprisePercent ?? 0) >= 0,
        isLive:    true,
      }))
    : [
        { quarter: 'Q1 2025', eps: '$1.52', estimate: '$1.48', surprise: '+3.1%', positive: true, isLive: false },
        { quarter: 'Q2 2025', eps: '$1.40', estimate: '$1.38', surprise: '+1.5%', positive: true, isLive: false },
        { quarter: 'Q3 2025', eps: '$1.64', estimate: '$1.60', surprise: '+2.8%', positive: true, isLive: false },
        { quarter: 'Q4 2025', eps: '$2.18', estimate: '$2.09', surprise: '+4.2%', positive: true, isLive: false },
      ];

  return (
    <DashboardLayout title="Financial Snapshot">
      <div className="p-4 lg:p-6 space-y-4">

        {/* Data source indicators */}
        <div className="flex items-center gap-3 px-1 flex-wrap">
          {profileLive ? (
            <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
              <Wifi className="h-2.5 w-2.5" /> Fundamentals · Finnhub live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
              <WifiOff className="h-2.5 w-2.5" /> Profile unavailable
            </span>
          )}
          {earningsLive ? (
            <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium">
              <Wifi className="h-2.5 w-2.5" /> Earnings EPS · Finnhub live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
              <FlaskConical className="h-2.5 w-2.5" /> Earnings illustrative
            </span>
          )}
          <span className="flex items-center gap-1 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-1.5 py-0.5">
            <FlaskConical className="h-2.5 w-2.5" /> Analyst consensus illustrative
          </span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-secondary/20" />)
          ) : (
            keyMetrics.map((f, i) => (
              <div key={f.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                {/* Company logo in first card when live */}
                {i === 0 && profileLive && profileData.profile && (
                  <CompanyLogo
                    logoUrl={profileData.profile.logo}
                    symbol={SYMBOL}
                    size="sm"
                    className="mb-2"
                  />
                )}
                <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35 font-medium">{f.label}</p>
                <p className="text-sm font-bold text-foreground mt-1 tabular-nums truncate">{f.value}</p>
                <p className={`text-[9px] font-semibold mt-1 ${f.neutral ? 'text-muted-foreground/40' : f.positive ? 'text-bull' : 'text-bear'}`}>
                  {f.change}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-4">
            {/* EPS Chart */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">EPS History — {SYMBOL}</h2>
                <span className="ml-auto text-[9px] text-muted-foreground/30">
                  {earningsLive ? 'Earnings per share (actual)' : 'Illustrative data'}
                </span>
              </div>
              {loading ? (
                <Skeleton className="h-52 w-full rounded-lg bg-secondary/20" />
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChart} barCategoryGap="20%">
                      <XAxis dataKey="q" tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false}
                        tickFormatter={v => `$${v.toFixed(2)}`} width={40} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11, boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.5)' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(value: number, _: string, entry: { payload?: { isEstimate?: boolean } }) => [
                          `$${value.toFixed(2)}${entry.payload?.isEstimate ? ' (est.)' : ''}`,
                          'EPS',
                        ]}
                      />
                      <Bar dataKey="eps" radius={[4, 4, 0, 0]}>
                        {revenueChart.map((item, i) => (
                          <Cell
                            key={i}
                            fill={item.isEstimate
                              ? 'hsl(var(--primary) / 0.2)'
                              : 'hsl(var(--primary))'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {earningsLive && (
                <p className="text-[8px] text-muted-foreground/25 mt-2">
                  Faded bars = estimate. Data: Finnhub /stock/earnings.
                </p>
              )}
            </div>

            {/* Earnings History */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-border/15">
                <FileBarChart className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Earnings History</h2>
                {earningsLive ? (
                  <span className="flex items-center gap-1 text-[8px] text-bull/60 font-medium ml-1">
                    <Wifi className="h-2.5 w-2.5" /> Live
                  </span>
                ) : (
                  <span className="text-[8px] text-muted-foreground/25 ml-1 font-medium">(Illustrative)</span>
                )}
              </div>
              <div className="hidden md:grid grid-cols-4 gap-2 px-5 py-2.5 text-[8px] uppercase tracking-[0.14em] text-muted-foreground/30 font-semibold border-b border-border/10">
                <span>Quarter</span>
                <span className="text-right">EPS Actual</span>
                <span className="text-right">Estimate</span>
                <span className="text-right">Surprise</span>
              </div>
              <div className="divide-y divide-border/8">
                {loading
                  ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 mx-5 my-2 rounded-lg bg-secondary/20" />)
                  : earningsTable.map((q, i) => (
                    <div key={q.quarter} className="grid grid-cols-2 md:grid-cols-4 gap-2 py-3 px-5 items-center hover:bg-accent/10 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <span className="text-[13px] font-semibold text-foreground">{q.quarter}</span>
                      <span className="hidden md:block text-right text-[11px] font-bold text-foreground tabular-nums">{q.eps}</span>
                      <span className="text-right text-[11px] text-foreground/60 tabular-nums">{q.estimate}</span>
                      <span className={`hidden md:block text-right text-[11px] font-semibold tabular-nums ${
                        q.positive ? 'text-bull' : 'text-bear'
                      }`}>{q.surprise}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column — Valuation & Analyst */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Valuation & Fundamentals</h2>
                {profileLive ? (
                  <span className="ml-auto flex items-center gap-1 text-[8px] text-bull/60">
                    <Wifi className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </div>
              {loading ? (
                <div className="space-y-1">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-7 rounded-lg bg-secondary/20" />)}
                </div>
              ) : (
                <div className="space-y-0">
                  {valuationData.map(m => (
                    <div key={m.label} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/10 transition-colors">
                      <span className="text-[10px] text-muted-foreground/45">{m.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-foreground tabular-nums">{m.value}</span>
                        {!m.isLive && (
                          <span className="text-[7px] text-muted-foreground/20">est.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analyst Consensus — always illustrative */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-3.5 w-3.5 text-primary/70" />
                <h2 className="section-header text-foreground/80">Analyst Consensus</h2>
                <span className="ml-auto flex items-center gap-1 text-[8px] text-muted-foreground/25 font-medium">
                  <FlaskConical className="h-2.5 w-2.5" /> Illustrative
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Buy',  count: 28, color: 'text-bull',         bg: 'bg-bull/8' },
                  { label: 'Hold', count: 8,  color: 'text-chart-accent', bg: 'bg-chart-accent/8' },
                  { label: 'Sell', count: 2,  color: 'text-bear',         bg: 'bg-bear/8' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-secondary/15 border border-border/10">
                    <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden">
                <div className="bg-bull/70" style={{ width: '73.7%' }} />
                <div className="bg-chart-accent/50" style={{ width: '21.1%' }} />
                <div className="bg-bear/70" style={{ width: '5.2%' }} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[9px] text-muted-foreground/35">Target Price</span>
                <span className="text-[13px] font-bold text-foreground tabular-nums">$210.50</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/35">Upside</span>
                <span className="text-[13px] font-bold text-bull tabular-nums value-bull">+10.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancialSnapshot;
