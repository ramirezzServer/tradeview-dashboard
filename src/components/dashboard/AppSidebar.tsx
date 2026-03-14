import {
  LayoutDashboard,
  Eye,
  Briefcase,
  Globe,
  LineChart,
  PieChart,
  Newspaper,
  FileBarChart,
  Settings,
  BarChart3,
  Zap,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Watchlist', url: '/watchlist', icon: Eye },
  { title: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { title: 'Market Overview', url: '/market-overview', icon: Globe },
];

const analysisNav = [
  { title: 'Technical Analysis', url: '/technical-analysis', icon: LineChart },
  { title: 'Sector Counter', url: '/sectors', icon: PieChart },
  { title: 'News', url: '/news', icon: Newspaper },
  { title: 'Financial Snapshot', url: '/financials', icon: FileBarChart },
];

const settingsNav = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

function NavGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: typeof mainNav;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  className="group/nav relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-accent/60"
                  activeClassName="bg-primary/10 text-primary font-medium shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarHeader className="px-4 py-5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 glow-border">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-foreground glow-text">
                StockPulse
              </span>
              <p className="text-[10px] text-muted-foreground/60 leading-none">Trading Terminal</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 glow-border mx-auto">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavGroup label="Trading" items={mainNav} collapsed={collapsed} />
        <SidebarSeparator className="opacity-30" />
        <NavGroup label="Analysis" items={analysisNav} collapsed={collapsed} />
        <SidebarSeparator className="opacity-30" />
        <NavGroup label="System" items={settingsNav} collapsed={collapsed} />
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t border-border/20">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-bull animate-pulse-glow" />
            <p className="text-[10px] text-muted-foreground/60">Markets Open</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
