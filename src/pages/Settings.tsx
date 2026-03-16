import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings as SettingsIcon, Monitor, Bell, Eye, Clock, Palette, Layout } from 'lucide-react';

interface ToggleProps { label: string; desc: string; defaultOn?: boolean }

function Toggle({ label, desc, defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/35">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative h-5 w-9 rounded-full transition-all duration-250 ${on ? 'bg-primary shadow-[0_0_8px_-2px_hsl(var(--primary)/0.3)]' : 'bg-secondary/40'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-foreground transition-transform duration-250 ${on ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );
}

interface SelectProps { label: string; desc: string; options: string[]; defaultValue?: string }

function SelectOption({ label, desc, options, defaultValue }: SelectProps) {
  const [value, setValue] = useState(defaultValue || options[0]);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/35">{desc}</p>
      </div>
      <div className="flex gap-0.5">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => setValue(opt)}
            className={`px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all ${
              value === opt
                ? 'bg-primary/12 text-primary border border-primary/15 shadow-[0_0_8px_-2px_hsl(var(--primary)/0.15)]'
                : 'text-muted-foreground/40 hover:text-foreground bg-secondary/20 border border-transparent'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const sections = [
  {
    icon: Monitor, title: 'Display',
    content: (
      <>
        <SelectOption label="Theme" desc="Application color theme" options={['Dark', 'Light', 'System']} defaultValue="Dark" />
        <SelectOption label="Density" desc="UI element spacing" options={['Compact', 'Normal', 'Relaxed']} defaultValue="Normal" />
        <SelectOption label="Font Size" desc="Base text size" options={['Small', 'Medium', 'Large']} defaultValue="Medium" />
      </>
    ),
  },
  {
    icon: Bell, title: 'Notifications',
    content: (
      <>
        <Toggle label="Price Alerts" desc="Get notified when assets hit target prices" defaultOn />
        <Toggle label="News Updates" desc="Breaking market news notifications" defaultOn />
        <Toggle label="Portfolio Changes" desc="Significant P&L movement alerts" defaultOn />
        <Toggle label="Earnings Reminders" desc="Upcoming earnings date alerts" />
      </>
    ),
  },
  {
    icon: Eye, title: 'Watchlist',
    content: (
      <>
        <Toggle label="Live Price Updates" desc="Real-time ticker simulation" defaultOn />
        <Toggle label="Flash Animations" desc="Price change flash effects" defaultOn />
        <Toggle label="Show Sparklines" desc="Mini trend charts in watchlist" defaultOn />
        <SelectOption label="Sort By" desc="Default watchlist sort order" options={['Symbol', 'Change', 'Volume']} defaultValue="Change" />
      </>
    ),
  },
  {
    icon: Clock, title: 'Default Timeframe',
    content: (
      <>
        <SelectOption label="Chart Timeframe" desc="Default chart period" options={['1D', '1W', '1M', '3M']} defaultValue="1M" />
        <SelectOption label="Candle Interval" desc="Default candle interval" options={['1m', '5m', '15m', '1h', '1D']} defaultValue="1D" />
      </>
    ),
  },
  {
    icon: Layout, title: 'Dashboard',
    content: (
      <>
        <Toggle label="AI Predictions" desc="Show AI forecast card" defaultOn />
        <Toggle label="Market Movers" desc="Show top gainers/losers" defaultOn />
        <Toggle label="Daily Range" desc="Show daily range indicator" defaultOn />
        <Toggle label="Volume Bars" desc="Show volume on chart" defaultOn />
      </>
    ),
  },
  {
    icon: Palette, title: 'Appearance',
    content: (
      <>
        <SelectOption label="Accent Color" desc="Primary accent color" options={['Blue', 'Cyan', 'Green', 'Purple']} defaultValue="Blue" />
        <SelectOption label="Chart Style" desc="Chart rendering style" options={['Candles', 'Line', 'Area']} defaultValue="Candles" />
        <Toggle label="Glow Effects" desc="Card glow on hover" defaultOn />
        <Toggle label="Animations" desc="Entrance and transition effects" defaultOn />
      </>
    ),
  },
];

const Settings = () => (
  <DashboardLayout title="Settings">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
            <SettingsIcon className="h-4 w-4 text-primary/70" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Preferences</h2>
            <p className="text-[9px] text-muted-foreground/35 tracking-wider">Customize your trading terminal experience</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((s, i) => (
          <div
            key={s.title}
            className="glass-card rounded-xl p-5 animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <s.icon className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">{s.title}</h3>
            </div>
            <div className="divide-y divide-border/8">
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default Settings;
