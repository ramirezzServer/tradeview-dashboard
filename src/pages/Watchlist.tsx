import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Eye } from 'lucide-react';

const Watchlist = () => (
  <div className="dark">
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Watchlist</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5 text-primary" />
                  Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Your full watchlist view is coming soon.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  </div>
);

export default Watchlist;
