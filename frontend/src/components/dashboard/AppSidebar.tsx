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
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
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
import { useWatchlist } from '@/hooks/useWatchlist';

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

// ─── Mini Watchlist Panel ─────────────────────────────────────────────────────

function WatchlistMiniPanel() {
  const { items, addSymbol, removeItem, addError, isAdding } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = async () => {
    const sym = newSymbol.trim();
    if (!sym || isAdding) return;
    try {
      await addSymbol(sym);
      setNewSymbol('');
    } catch {
      // addError shown below input
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
  };

  return (
    <div className="px-2 pb-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-1.5">
        <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/40 font-semibold">
          Watchlist
        </span>
        <span className="text-[9px] text-muted-foreground/25 tabular-nums">{items.length}</span>
      </div>

      {/* Items (max 5) */}
      {items.length === 0 ? (
        <p className="px-1 py-1 text-[9px] text-muted-foreground/25 italic">No symbols yet</p>
      ) : (
        <div className="space-y-0.5">
          {items.slice(0, 5).map(item => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-accent/40 transition-colors"
            >
              <span className="text-[12px] font-semibold text-foreground/80">{item.symbol}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-bear/10"
                title={`Remove ${item.symbol}`}
              >
                <X className="h-3 w-3 text-muted-foreground/40 hover:text-bear/70 transition-colors" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add input */}
      <div className="flex items-center gap-1 mt-2 px-1">
        <input
          value={newSymbol}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add symbol..."
          className="flex-1 min-w-0 bg-secondary/20 border border-border/20 rounded-md px-2 py-1 text-[10px] text-foreground/80 placeholder:text-muted-foreground/25 outline-none focus:border-primary/30 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!newSymbol || isAdding}
          title="Add symbol"
          className="h-6 w-6 shrink-0 flex items-center justify-center rounded-md bg-primary/12 border border-primary/15 text-primary/70 hover:bg-primary/20 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isAdding
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Plus className="h-3 w-3" />
          }
        </button>
      </div>

      {addError && (
        <p className="px-1 mt-1 text-[9px] text-bear/60">{addError}</p>
      )}
    </div>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

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
                PersonalProject
              </span>
              <p className="text-[9px] text-muted-foreground/40 leading-none tracking-wider uppercase">PERSONAL DASHBOARD</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 glow-border mx-auto">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Mini watchlist — only when expanded */}
        {!collapsed && (
          <>
            <WatchlistMiniPanel />
            <SidebarSeparator className="opacity-20 my-1" />
          </>
        )}

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
