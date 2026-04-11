import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Settings as SettingsIcon, Monitor, Bell, Eye, Clock, Palette,
  Layout, User, LogOut, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useSettings, PartialSettings } from '@/hooks/useSettings';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Local-only Toggle (state lives in component, not persisted) ──────────────

interface ToggleProps { label: string; desc: string; defaultOn?: boolean; localOnly?: boolean }

function Toggle({ label, desc, defaultOn = false, localOnly = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/35">
          {desc}
          {localOnly && <span className="ml-1 text-muted-foreground/25">(session only)</span>}
        </p>
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

// ─── Controlled SelectOption (can be local or backend-driven) ─────────────────

interface SelectProps {
  label: string;
  desc: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  isSaving?: boolean;
}

function SelectOption({ label, desc, options, value, onChange, isSaving }: SelectProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/35">{desc}</p>
      </div>
      <div className="flex gap-0.5 items-center">
        {isSaving && <Loader2 className="h-2.5 w-2.5 animate-spin text-primary/40 mr-1" />}
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
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

// ─── Local-only SelectOption ──────────────────────────────────────────────────

interface LocalSelectProps { label: string; desc: string; options: string[]; defaultValue?: string }

function LocalSelectOption({ label, desc, options, defaultValue }: LocalSelectProps) {
  const [value, setValue] = useState(defaultValue || options[0]);
  return <SelectOption label={label} desc={desc} options={options} value={value} onChange={setValue} />;
}

// ─── Save status banner ───────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Settings page ─────────────────────────────────────────────────────────────

const Settings = () => {
  const { settings, isLoading, updateSettings, isSaving } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Backend-driven state — initialised from API response
  const [theme, setTheme] = useState<'Dark' | 'Light'>('Dark');
  const [resolution, setResolution] = useState('1D');
  const [newsCategory, setNewsCategory] = useState('general');

  // Map backend values → display values once loaded
  useEffect(() => {
    if (!settings) return;
    setTheme(settings.theme === 'light' ? 'Light' : 'Dark');
    const resMap: Record<string, string> = { '1': '1m', '5': '5m', '15': '15m', '60': '1h', D: '1D', W: '1W', M: '1M' };
    setResolution(resMap[settings.default_resolution] ?? '1D');
    setNewsCategory(settings.preferred_news_category ?? 'general');
  }, [settings]);

  // Persist a settings change and surface the result to the user
  const save = async (updates: PartialSettings) => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await updateSettings(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.';
      setSaveError(msg);
      setSaveStatus('error');
    }
  };

  const handleThemeChange = (v: string) => {
    setTheme(v as 'Dark' | 'Light');
    save({ theme: v === 'Light' ? 'light' : 'dark' });
  };

  const handleResolutionChange = (v: string) => {
    setResolution(v);
    const resMap: Record<string, string> = { '1m': '1', '5m': '5', '15m': '15', '1h': '60', '1D': 'D', '1W': 'W', '1M': 'M' };
    save({ default_resolution: (resMap[v] ?? 'D') as PartialSettings['default_resolution'] });
  };

  const handleNewsCategoryChange = (v: string) => {
    setNewsCategory(v);
    save({ preferred_news_category: v as PartialSettings['preferred_news_category'] });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="p-4 lg:p-6 space-y-4">
        {/* Header */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <SettingsIcon className="h-4 w-4 text-primary/70" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-foreground">Preferences</h2>
                <p className="text-[9px] text-muted-foreground/35 tracking-wider">Customize your trading terminal experience</p>
              </div>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/40" />}
          </div>

          {/* Save status feedback */}
          {saveStatus === 'saved' && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-bull/70">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Settings saved.
            </div>
          )}
          {saveStatus === 'error' && saveError && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-bear/70">
              <AlertCircle className="h-3.5 w-3.5" />
              {saveError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Account */}
          <div className="glass-card rounded-xl p-5 animate-fade-up">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <User className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Account</h3>
            </div>
            <div className="divide-y divide-border/8">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-[13px] text-foreground">{user?.name ?? '—'}</p>
                  <p className="text-[9px] text-muted-foreground/35">{user?.email ?? '—'}</p>
                </div>
              </div>
              <div className="py-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-[11px] font-semibold text-bear/70 hover:text-bear transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Display — theme is backend-backed */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Monitor className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Display</h3>
            </div>
            <div className="divide-y divide-border/8">
              <SelectOption
                label="Theme"
                desc="Application color theme"
                options={['Dark', 'Light']}
                value={theme}
                onChange={handleThemeChange}
                isSaving={isSaving}
              />
              <LocalSelectOption label="Density"   desc="UI element spacing (session only)"  options={['Compact', 'Normal', 'Relaxed']} defaultValue="Normal" />
              <LocalSelectOption label="Font Size"  desc="Base text size (session only)"      options={['Small', 'Medium', 'Large']}    defaultValue="Medium" />
            </div>
          </div>

          {/* Notifications — local-only, not persisted */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Bell className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Notifications</h3>
            </div>
            <div className="divide-y divide-border/8">
              <Toggle label="Price Alerts"       desc="Get notified when assets hit target prices"    localOnly defaultOn />
              <Toggle label="News Updates"        desc="Breaking market news notifications"             localOnly defaultOn />
              <Toggle label="Portfolio Changes"   desc="Significant P&L movement alerts"               localOnly defaultOn />
              <Toggle label="Earnings Reminders"  desc="Upcoming earnings date alerts"                 localOnly />
            </div>
          </div>

          {/* Watchlist — local-only */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Eye className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Watchlist</h3>
            </div>
            <div className="divide-y divide-border/8">
              <Toggle label="Live Price Updates"   desc="Real-time ticker simulation"        localOnly defaultOn />
              <Toggle label="Flash Animations"     desc="Price change flash effects"         localOnly defaultOn />
              <Toggle label="Show Sparklines"      desc="Mini trend charts in watchlist"     localOnly defaultOn />
              <LocalSelectOption label="Sort By" desc="Default sort order (session only)" options={['Symbol', 'Change', 'Volume']} defaultValue="Change" />
            </div>
          </div>

          {/* Default Timeframe — resolution is backend-backed */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Default Timeframe</h3>
            </div>
            <div className="divide-y divide-border/8">
              <LocalSelectOption label="Chart Timeframe" desc="Default chart period (session only)"   options={['1D', '1W', '1M', '3M']} defaultValue="1M" />
              <SelectOption
                label="Candle Interval"
                desc="Default candle interval"
                options={['1m', '5m', '15m', '1h', '1D', '1W', '1M']}
                value={resolution}
                onChange={handleResolutionChange}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Dashboard — local-only */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Layout className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Dashboard</h3>
            </div>
            <div className="divide-y divide-border/8">
              <Toggle label="AI Predictions"  desc="Show AI forecast card (session only)"          localOnly defaultOn />
              <Toggle label="Market Movers"   desc="Show top gainers/losers (session only)"         localOnly defaultOn />
              <Toggle label="Daily Range"     desc="Show daily range indicator (session only)"      localOnly defaultOn />
              <Toggle label="Volume Bars"     desc="Show volume on chart (session only)"            localOnly defaultOn />
            </div>
          </div>

          {/* Appearance + News Category (news category is backend-backed) */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Palette className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Appearance</h3>
            </div>
            <div className="divide-y divide-border/8">
              <LocalSelectOption label="Accent Color" desc="Primary accent color (session only)"    options={['Blue', 'Cyan', 'Green', 'Purple']} defaultValue="Blue" />
              <LocalSelectOption label="Chart Style"  desc="Chart rendering style (session only)"   options={['Candles', 'Line', 'Area']}         defaultValue="Candles" />
              <Toggle label="Glow Effects"   desc="Card glow on hover (session only)"              localOnly defaultOn />
              <Toggle label="Animations"     desc="Entrance and transition effects (session only)"  localOnly defaultOn />
              <SelectOption
                label="News Category"
                desc="Default news feed category"
                options={['general', 'forex', 'crypto', 'merger']}
                value={newsCategory}
                onChange={handleNewsCategoryChange}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
