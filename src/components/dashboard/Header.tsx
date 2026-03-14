import { Search, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border/30 bg-card/40 backdrop-blur-xl px-4 lg:px-6">
      <SidebarTrigger />
      <h1 className="text-sm font-semibold text-foreground tracking-tight">{title}</h1>
      <Badge
        variant="outline"
        className="border-bull/30 bg-bull/10 text-bull text-[10px] font-medium px-2 py-0.5"
      >
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-bull animate-pulse-glow" />
        Market Open
      </Badge>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Search stocks..."
            className="w-44 h-8 bg-secondary/50 border-border/30 pl-8 text-xs focus:border-primary/30 focus:ring-primary/10 lg:w-56"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-3.5 w-3.5" />
        </Button>
        <div className="h-7 w-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-primary">SP</span>
        </div>
      </div>
    </header>
  );
}
