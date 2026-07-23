import { DashboardShell } from '@/components/dashboard/shell';
import { AuthGuard } from '@/components/providers/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
