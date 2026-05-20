import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Settings as SettingsIcon, Monitor, Bell, Eye, Clock, Palette,
  Layout, User, LogOut, Loader2, AlertCircle, CheckCircle2, RotateCcw,
} from 'lucide-react';
import { SETTINGS_DEFAULTS, useSettings, PartialSettings } from '@/hooks/useSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// ─── Controlled Toggle ────────────────────────────────────────────────────────

interface ToggleProps {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isSaving?: boolean;
}

function Toggle({ label, desc, value, onChange, isSaving }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground/35">{desc}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {isSaving && <Loader2 className="h-2.5 w-2.5 animate-spin text-primary/40" />}
        <button
          onClick={() => onChange(!value)}
          className={`relative h-5 w-9 rounded-full transition-all duration-250 ${
            value ? 'bg-primary shadow-[0_0_8px_-2px_hsl(var(--primary)/0.3)]' : 'bg-secondary/40'
          }`}
        >
          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-foreground transition-transform duration-250 ${value ? 'translate-x-4' : ''}`} />
        </button>
      </div>
    </div>
  );
}

// ─── Controlled SelectOption ──────────────────────────────────────────────────

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

// ─── Save status ──────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Settings page ─────────────────────────────────────────────────────────────

const Settings = () => {
  const { settings, isLoading, updateSettings, resetSettings, isSaving, isResetting } = useSettings();
  const push = usePushNotifications();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError]   = useState<string | null>(null);

  // ── Derived display values from settings ──────────────────────────────────

  const resMap: Record<string, string> = {
    '1': '1m', '5': '5m', '15': '15m', '60': '1h', D: '1D', W: '1W', M: '1M',
  };
  const resMapBack: Record<string, string> = {
    '1m': '1', '5m': '5', '15m': '15', '1h': '60', '1D': 'D', '1W': 'W', '1M': 'M',
  };

  const theme          = settings?.theme === 'light' ? 'Light' : 'Dark';
  const density        = settings?.density        ?? SETTINGS_DEFAULTS.density!;
  const fontSize       = settings?.font_size      ?? SETTINGS_DEFAULTS.font_size!;
  const chartTimeframe = settings?.chart_timeframe ?? SETTINGS_DEFAULTS.chart_timeframe!;
  const resolution     = resMap[settings?.default_resolution ?? SETTINGS_DEFAULTS.default_resolution!] ?? '1D';
  const newsCategory   = settings?.preferred_news_category ?? SETTINGS_DEFAULTS.preferred_news_category!;

  const notifs  = settings?.notifications   ?? SETTINGS_DEFAULTS.notifications!;
  const wlPrefs = settings?.watchlist_prefs ?? SETTINGS_DEFAULTS.watchlist_prefs!;
  const dashP   = settings?.dashboard_prefs ?? SETTINGS_DEFAULTS.dashboard_prefs!;
  const appP    = settings?.appearance_prefs ?? SETTINGS_DEFAULTS.appearance_prefs!;

  // ── Unified save wrapper (surfaces status in the banner) ─────────────────

  const save = async (updates: PartialSettings) => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await updateSettings(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
      setSaveStatus('error');
    }
  };

  const handleReset = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await resetSettings();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to reset.');
      setSaveStatus('error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      await push.subscribe();
    } else {
      await push.unsubscribe();
    }
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

          {saveStatus === 'saved' && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-bull/70">
              <CheckCircle2 className="h-3.5 w-3.5" /> Settings saved.
            </div>
          )}
          {saveStatus === 'error' && saveError && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-bear/70">
              <AlertCircle className="h-3.5 w-3.5" /> {saveError}
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
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Display */}
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
                onChange={v => save({ theme: v === 'Light' ? 'light' : 'dark' })}
                isSaving={isSaving}
              />
              <SelectOption
                label="Density"
                desc="UI element spacing"
                options={['Compact', 'Normal', 'Relaxed']}
                value={density}
                onChange={v => save({ density: v as PartialSettings['density'] })}
                isSaving={isSaving}
              />
              <SelectOption
                label="Font Size"
                desc="Base text size"
                options={['Small', 'Medium', 'Large']}
                value={fontSize}
                onChange={v => save({ font_size: v as PartialSettings['font_size'] })}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Bell className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Notifications</h3>
            </div>
            <div className="divide-y divide-border/8">
              <div className="py-3">
                {push.isSupported ? (
                  <>
                    <Toggle
                      label="Enable Push Notifications"
                      desc={`Browser permission: ${push.permission}`}
                      value={push.isSubscribed}
                      onChange={handlePushToggle}
                      isSaving={push.isBusy}
                    />
                    {push.error && (
                      <p className="text-[10px] text-bear/70 pb-2">{push.error}</p>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-[13px] text-foreground">Enable Push Notifications</p>
                    <p className="text-[9px] text-muted-foreground/35">Not supported by your browser</p>
                  </div>
                )}
              </div>
              <Toggle
                label="Price Alerts"
                desc="Get notified when assets hit target prices"
                value={notifs.price_alerts ?? true}
                onChange={v => save({ notifications: { ...notifs, price_alerts: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="News Updates"
                desc="Breaking market news notifications"
                value={notifs.news_updates ?? true}
                onChange={v => save({ notifications: { ...notifs, news_updates: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Portfolio Changes"
                desc="Significant P&L movement alerts"
                value={notifs.portfolio_changes ?? true}
                onChange={v => save({ notifications: { ...notifs, portfolio_changes: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Earnings Reminders"
                desc="Upcoming earnings date alerts"
                value={notifs.earnings_reminders ?? false}
                onChange={v => save({ notifications: { ...notifs, earnings_reminders: v } })}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Watchlist */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Eye className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Watchlist</h3>
            </div>
            <div className="divide-y divide-border/8">
              <Toggle
                label="Live Price Updates"
                desc="Real-time ticker simulation"
                value={wlPrefs.live_price_updates ?? true}
                onChange={v => save({ watchlist_prefs: { ...wlPrefs, live_price_updates: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Flash Animations"
                desc="Price change flash effects"
                value={wlPrefs.flash_animations ?? true}
                onChange={v => save({ watchlist_prefs: { ...wlPrefs, flash_animations: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Show Sparklines"
                desc="Mini trend charts in watchlist"
                value={wlPrefs.show_sparklines ?? true}
                onChange={v => save({ watchlist_prefs: { ...wlPrefs, show_sparklines: v } })}
                isSaving={isSaving}
              />
              <SelectOption
                label="Sort By"
                desc="Default sort order"
                options={['Symbol', 'Change']}
                value={wlPrefs.sort_by === 'Volume' ? 'Change' : (wlPrefs.sort_by ?? SETTINGS_DEFAULTS.watchlist_prefs!.sort_by!)}
                onChange={v => save({ watchlist_prefs: { ...wlPrefs, sort_by: v } })}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Default Timeframe */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Default Timeframe</h3>
            </div>
            <div className="divide-y divide-border/8">
              <SelectOption
                label="Chart Timeframe"
                desc="Default chart period"
                options={['1D', '1W', '1M', '3M']}
                value={chartTimeframe}
                onChange={v => save({ chart_timeframe: v as PartialSettings['chart_timeframe'] })}
                isSaving={isSaving}
              />
              <SelectOption
                label="Candle Interval"
                desc="Default candle interval"
                options={['1m', '5m', '15m', '1h', '1D', '1W', '1M']}
                value={resolution}
                onChange={v => save({ default_resolution: (resMapBack[v] ?? 'D') as PartialSettings['default_resolution'] })}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Dashboard */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '250ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Layout className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Dashboard</h3>
            </div>
            <div className="divide-y divide-border/8">
              <Toggle
                label="AI Predictions"
                desc="Show AI forecast card"
                value={dashP.ai_predictions ?? true}
                onChange={v => save({ dashboard_prefs: { ...dashP, ai_predictions: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Market Movers"
                desc="Show top gainers/losers"
                value={dashP.market_movers ?? true}
                onChange={v => save({ dashboard_prefs: { ...dashP, market_movers: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Daily Range"
                desc="Show daily range indicator"
                value={dashP.daily_range ?? true}
                onChange={v => save({ dashboard_prefs: { ...dashP, daily_range: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Volume Bars"
                desc="Show volume on chart"
                value={dashP.volume_bars ?? true}
                onChange={v => save({ dashboard_prefs: { ...dashP, volume_bars: v } })}
                isSaving={isSaving}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="glass-card rounded-xl p-5 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/8 border border-primary/10">
                <Palette className="h-3.5 w-3.5 text-primary/70" />
              </div>
              <h3 className="section-header text-foreground/80">Appearance</h3>
            </div>
            <div className="divide-y divide-border/8">
              <SelectOption
                label="Accent Color"
                desc="Primary accent color"
                options={['Blue', 'Cyan', 'Green', 'Purple']}
                value={appP.accent_color ?? 'Blue'}
                onChange={v => save({ appearance_prefs: { ...appP, accent_color: v } })}
                isSaving={isSaving}
              />
              <SelectOption
                label="Chart Style"
                desc="Chart rendering style"
                options={['Candles', 'Line', 'Area']}
                value={appP.chart_style ?? 'Candles'}
                onChange={v => save({ appearance_prefs: { ...appP, chart_style: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Glow Effects"
                desc="Card glow on hover"
                value={appP.glow_effects ?? true}
                onChange={v => save({ appearance_prefs: { ...appP, glow_effects: v } })}
                isSaving={isSaving}
              />
              <Toggle
                label="Animations"
                desc="Entrance and transition effects"
                value={appP.animations ?? true}
                onChange={v => save({ appearance_prefs: { ...appP, animations: v } })}
                isSaving={isSaving}
              />
              <SelectOption
                label="News Category"
                desc="Default news feed category"
                options={['general', 'forex', 'crypto', 'merger']}
                value={newsCategory}
                onChange={v => save({ preferred_news_category: v as PartialSettings['preferred_news_category'] })}
                isSaving={isSaving}
              />
            </div>
          </div>

        </div>

        {/* Reset to Defaults */}
        <div className="glass-card rounded-xl p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: '350ms' }}>
          <div>
            <p className="text-[13px] text-foreground font-medium">Reset to Defaults</p>
            <p className="text-[9px] text-muted-foreground/35 mt-0.5">Restore all settings to their original values</p>
          </div>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-bear/70 hover:text-bear border border-bear/15 hover:border-bear/30 hover:bg-bear/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isResetting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RotateCcw className="h-3.5 w-3.5" />
            }
            Reset
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
