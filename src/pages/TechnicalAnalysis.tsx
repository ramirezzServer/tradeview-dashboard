import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Activity, TrendingUp, TrendingDown, Target, Shield, Zap, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const trendData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  price: 178 + Math.sin(i * 0.3) * 5 + i * 0.3 + Math.random() * 2,
  ma20: 178 + i * 0.35,
  ma50: 176 + i * 0.28,
}));

const indicators = [
  { name: 'RSI (14)', value: '62.4', signal: 'Neutral', color: 'text-chart-accent', desc: 'Relative Strength Index' },
  { name: 'MACD (12,26,9)', value: '1.82', signal: 'Bullish', color: 'text-bull', desc: 'Moving Average Convergence' },
  { name: 'Stochastic %K', value: '78.3', signal: 'Neutral', color: 'text-chart-accent', desc: 'Stochastic Oscillator' },
  { name: 'Williams %R', value: '-21.7', signal: 'Overbought', color: 'text-bear', desc: 'Williams Percent Range' },
  { name: 'CCI (20)', value: '128.4', signal: 'Bullish', color: 'text-bull', desc: 'Commodity Channel Index' },
  { name: 'ADX (14)', value: '34.2', signal: 'Strong Trend', color: 'text-bull', desc: 'Average Directional Index' },
  { name: 'ATR (14)', value: '3.42', signal: 'Normal', color: 'text-chart-accent', desc: 'Average True Range' },
  { name: 'OBV', value: '142.8M', signal: 'Rising', color: 'text-bull', desc: 'On-Balance Volume' },
];

const movingAverages = [
  { name: 'SMA (10)', value: '$188.42', signal: 'Buy', positive: true },
  { name: 'SMA (20)', value: '$186.18', signal: 'Buy', positive: true },
  { name: 'SMA (50)', value: '$184.20', signal: 'Buy', positive: true },
  { name: 'SMA (100)', value: '$180.56', signal: 'Buy', positive: true },
  { name: 'SMA (200)', value: '$176.50', signal: 'Buy', positive: true },
  { name: 'EMA (10)', value: '$188.90', signal: 'Buy', positive: true },
  { name: 'EMA (20)', value: '$187.04', signal: 'Buy', positive: true },
  { name: 'EMA (50)', value: '$184.82', signal: 'Buy', positive: true },
];

const summary = { buy: 14, neutral: 4, sell: 2 };
const pivots = [
  { label: 'R3', value: '$198.40' },
  { label: 'R2', value: '$195.60' },
  { label: 'R1', value: '$192.80' },
  { label: 'Pivot', value: '$190.00', highlight: true },
  { label: 'S1', value: '$187.20' },
  { label: 'S2', value: '$184.40' },
  { label: 'S3', value: '$181.60' },
];

const TechnicalAnalysis = () => (
  <DashboardLayout title="Technical Analysis">
    <div className="p-4 lg:p-6 space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Signal', value: 'Strong Buy', icon: TrendingUp, color: 'text-bull' },
          { label: 'Trend', value: 'Bullish', icon: Zap, color: 'text-bull' },
          { label: 'Support', value: '$184.20', icon: Shield, color: 'text-chart-accent' },
          { label: 'Resistance', value: '$195.60', icon: Target, color: 'text-chart-accent' },
        ].map((c, i) => (
          <div key={c.label} className="glass-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">{c.label}</p>
              <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
            </div>
            <p className={`text-sm font-bold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Signal Summary */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Signal Summary — AAPL</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Buy', count: summary.buy, color: 'text-bull', bg: 'bg-bull/10' },
            { label: 'Neutral', count: summary.neutral, color: 'text-chart-accent', bg: 'bg-chart-accent/10' },
            { label: 'Sell', count: summary.sell, color: 'text-bear', bg: 'bg-bear/10' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/20">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mt-1">{s.label}</p>
              <div className={`h-1 w-10 mx-auto mt-2 rounded-full ${s.bg}`} />
            </div>
          ))}
        </div>
        {/* Ratio bar */}
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-bull transition-all" style={{ width: `${(summary.buy / 20) * 100}%` }} />
          <div className="bg-chart-accent transition-all" style={{ width: `${(summary.neutral / 20) * 100}%` }} />
          <div className="bg-bear transition-all" style={{ width: `${(summary.sell / 20) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {/* Trend Chart */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Price & Moving Averages</h2>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="taPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#taPriceGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="ma20" stroke="hsl(var(--bull))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="ma50" stroke="hsl(var(--bear))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-primary rounded" /><span className="text-[9px] text-muted-foreground/50">Price</span></div>
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-bull rounded border-dashed" /><span className="text-[9px] text-muted-foreground/50">MA20</span></div>
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-4 bg-bear rounded" /><span className="text-[9px] text-muted-foreground/50">MA50</span></div>
            </div>
          </div>

          {/* Oscillators */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Oscillators & Indicators</h2>
            </div>
            <div className="space-y-1">
              {indicators.map((ind, i) => (
                <div key={ind.name} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-accent/20 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <div>
                    <span className="text-sm text-foreground">{ind.name}</span>
                    <p className="text-[9px] text-muted-foreground/40">{ind.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{ind.value}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${ind.color} ${
                      ind.color === 'text-bull' ? 'bg-bull/10' : ind.color === 'text-bear' ? 'bg-bear/10' : 'bg-chart-accent/10'
                    }`}>{ind.signal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moving Averages */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Moving Averages</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {movingAverages.map((ma, i) => (
                <div key={ma.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/20 transition-colors">
                  <span className="text-xs text-foreground">{ma.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-foreground tabular-nums">{ma.value}</span>
                    <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${ma.positive ? 'text-bull' : 'text-bear'}`}>
                      {ma.positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                      {ma.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pivot Points */}
        <div className="glass-card rounded-xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Pivot Points</h2>
          </div>
          <div className="space-y-1">
            {pivots.map(p => (
              <div
                key={p.label}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                  p.highlight ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/20'
                }`}
              >
                <span className={`text-xs font-semibold ${
                  p.label.startsWith('R') ? 'text-bear' : p.label.startsWith('S') ? 'text-bull' : 'text-primary'
                }`}>{p.label}</span>
                <span className="text-sm font-bold text-foreground tabular-nums">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default TechnicalAnalysis;
