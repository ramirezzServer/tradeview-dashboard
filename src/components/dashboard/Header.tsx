import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      <Badge variant="outline" className="border-bull text-bull text-xs font-medium">
        Market Open
      </Badge>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="w-48 bg-secondary pl-9 text-sm lg:w-64"
          />
        </div>
      </div>
    </header>
  );
}
