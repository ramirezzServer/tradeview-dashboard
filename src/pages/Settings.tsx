import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings as SettingsIcon, Monitor, Bell, Shield, Palette } from 'lucide-react';

const settingsSections = [
  { icon: Monitor, title: 'Display', description: 'Theme, layout density, chart preferences' },
  { icon: Bell, title: 'Notifications', description: 'Price alerts, news updates, portfolio changes' },
  { icon: Shield, title: 'Security', description: 'Two-factor authentication, session management' },
  { icon: Palette, title: 'Appearance', description: 'Color scheme, font size, accent colors' },
];

const Settings = () => (
  <DashboardLayout title="Settings">
    <div className="p-4 lg:p-6 space-y-4">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Preferences</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {settingsSections.map((s, i) => (
            <div
              key={s.title}
              className="glass-card-hover rounded-lg p-4 cursor-pointer group animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/10 group-hover:bg-primary/15 transition-colors">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{s.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export default Settings;
