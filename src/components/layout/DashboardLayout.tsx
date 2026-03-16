import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Header } from '@/components/dashboard/Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {/* Ambient background glow */}
          <div className="ambient-glow" />
          
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 relative z-[1]">
            <Header title={title} />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
