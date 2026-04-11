import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Activity, TrendingUp, TrendingDown, Target, Shield, Zap, BarChart2, ArrowUp, ArrowDown, FlaskConical } from 'lucide-react';
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
      {/* Demo data notice */}
      <div className="flex items-center gap-2 px-1">
        <span className="flex items-center gap-1.5 text-[8px] text-muted-foreground/30 font-medium border border-border/20 rounded-md px-2 py-1">
          <FlaskConical className="h-2.5 w-2.5" />
          Demo Data — All indicators and signals are illustrative only
        </span>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overall Signal', value: 'Strong Buy', icon: TrendingUp, color: 'text-bull value-bull' },
          { label: 'Trend', value: 'Bullish', icon: Zap, color: 'text-bull' },
          { label: 'Support', value: '$184.20', icon: Shield, color: 'text-chart-accent' },
          { label: 'Resistance', value: '$195.60', icon: Target, color: 'text-chart-accent' },
        ].map((c, i) => (
          <div key={c.label} className="glass-card-hover rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40 font-medium">{c.label}</p>
              <c.icon className={`h-3.5 w-3.5 ${c.color.split(' ')[0]}/70`} />
            </div>
            <p className={`text-[15px] font-bold mt-2 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Signal Summary */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="h-3.5 w-3.5 text-primary/70" />
          <h2 className="section-header text-foreground/80">Signal Summary — AAPL</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Buy', count: summary.buy, color: 'text-bull', bg: 'bg-bull/8' },
            { label: 'Neutral', count: summary.neutral, color: 'text-chart-accent', bg: 'bg-chart-accent/8' },
            { label: 'Sell', count: summary.sell, color: 'text-bear', bg: 'bg-bear/8' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/15 border border-border/10">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden">
          <div className="bg-bull/70 transition-all" style={{ width: `${(summary.buy / 20) * 100}%` }} />
          <div className="bg-chart-accent/50 transition-all" style={{ width: `${(summary.neutral / 20) * 100}%` }} />
          <div className="bg-bear/70 transition-all" style={{ width: `${(summary.sell / 20) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {/* Trend Chart */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Price & Moving Averages</h2>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="taPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(220, 15%, 35%)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11, boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.5)' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#taPriceGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="ma20" stroke="hsl(var(--bull))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  <Area type="monotone" dataKey="ma50" stroke="hsl(var(--bear))" fill="none" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3 justify-center">
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-primary rounded" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">Price</span></div>
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-bull rounded border-dashed" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">MA20</span></div>
              <div className="flex items-center gap-1.5"><div className="h-0.5 w-5 bg-bear rounded" /><span className="text-[8px] text-muted-foreground/35 uppercase tracking-wider">MA50</span></div>
            </div>
          </div>

          {/* Oscillators */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Oscillators & Indicators</h2>
            </div>
            <div className="space-y-0.5">
              {indicators.map((ind, i) => (
                <div key={ind.name} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-accent/10 transition-colors animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                  <div>
                    <span className="text-[13px] text-foreground">{ind.name}</span>
                    <p className="text-[8px] text-muted-foreground/30 tracking-wider">{ind.desc}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-bold text-foreground tabular-nums">{ind.value}</span>
                    <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${ind.color} ${
                      ind.color === 'text-bull' ? 'bg-bull/8' : ind.color === 'text-bear' ? 'bg-bear/8' : 'bg-chart-accent/8'
                    }`}>{ind.signal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moving Averages */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-3.5 w-3.5 text-primary/70" />
              <h2 className="section-header text-foreground/80">Moving Averages</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
              {movingAverages.map(ma => (
                <div key={ma.name} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-accent/10 transition-colors">
                  <span className="text-[11px] text-foreground/70">{ma.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-foreground tabular-nums">{ma.value}</span>
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
            <Target className="h-3.5 w-3.5 text-primary/70" />
            <h2 className="section-header text-foreground/80">Pivot Points</h2>
          </div>
          <div className="space-y-1">
            {pivots.map(p => (
              <div
                key={p.label}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                  p.highlight ? 'bg-primary/8 border border-primary/15 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.15)]' : 'hover:bg-accent/10'
                }`}
              >
                <span className={`text-[11px] font-semibold ${
                  p.label.startsWith('R') ? 'text-bear/80' : p.label.startsWith('S') ? 'text-bull/80' : 'text-primary'
                }`}>{p.label}</span>
                <span className="text-[13px] font-bold text-foreground tabular-nums">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default TechnicalAnalysis;
