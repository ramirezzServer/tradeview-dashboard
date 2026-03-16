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
      <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 font-semibold mb-1">
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
                  className="group/nav relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground/70 transition-all duration-250 hover:text-foreground hover:bg-accent/50"
                  activeClassName="bg-primary/12 text-primary font-medium shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15),0_0_12px_-3px_hsl(var(--primary)/0.12)]"
                >
                  <item.icon className="h-[15px] w-[15px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
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
    <Sidebar collapsible="icon" className="border-r border-border/20 bg-sidebar/80 backdrop-blur-xl">
      <SidebarHeader className="px-4 py-5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 glow-border">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-foreground glow-text">
                StockPulse
              </span>
              <p className="text-[9px] text-muted-foreground/40 leading-none tracking-wider uppercase">Trading Terminal</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 glow-border mx-auto">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavGroup label="Trading" items={mainNav} collapsed={collapsed} />
        <SidebarSeparator className="opacity-20 my-1" />
        <NavGroup label="Analysis" items={analysisNav} collapsed={collapsed} />
        <SidebarSeparator className="opacity-20 my-1" />
        <NavGroup label="System" items={settingsNav} collapsed={collapsed} />
      </SidebarContent>
      <SidebarFooter className="px-4 py-3 border-t border-border/15">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse-glow" />
            <p className="text-[9px] text-muted-foreground/40 tracking-wider uppercase">Markets Open</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
