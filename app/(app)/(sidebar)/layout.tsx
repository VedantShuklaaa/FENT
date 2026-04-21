import { SidebarProvider } from '@/lib/context/SidebarContext';
import AppShell from '@/components/appShell';

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppShell>
        {children}
      </AppShell>
    </SidebarProvider>
  );
}