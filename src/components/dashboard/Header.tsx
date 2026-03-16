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
    <header className="flex h-12 items-center gap-4 border-b border-border/20 bg-card/30 backdrop-blur-2xl px-4 lg:px-6 relative">
      {/* Subtle bottom edge highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent" />
      
      <SidebarTrigger className="text-muted-foreground/60 hover:text-foreground" />
      <h1 className="text-sm font-semibold text-foreground/90 tracking-tight">{title}</h1>
      <Badge
        variant="outline"
        className="border-bull/20 bg-bull/8 text-bull text-[9px] font-medium px-2 py-0.5 gap-1.5"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-bull animate-pulse-glow" />
        Market Open
      </Badge>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
          <Input
            placeholder="Search stocks..."
            className="w-44 h-8 bg-secondary/30 border-border/20 pl-8 text-xs focus:border-primary/30 focus:ring-primary/10 placeholder:text-muted-foreground/30 lg:w-56"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50 hover:text-foreground hover:bg-accent/40">
          <Bell className="h-3.5 w-3.5" />
        </Button>
        <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary/80">SP</span>
        </div>
      </div>
    </header>
  );
}
