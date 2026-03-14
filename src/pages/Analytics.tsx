import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart3 } from 'lucide-react';

const Analytics = () => (
  <DashboardLayout title="Analytics">
    <div className="p-4 lg:p-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Analytics</h2>
        </div>
        <p className="text-sm text-muted-foreground/60">Advanced analytics and insights are available in the Technical Analysis section.</p>
      </div>
    </div>
  </DashboardLayout>
);

export default Analytics;
