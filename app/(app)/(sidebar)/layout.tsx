import { SidebarProvider } from '@/lib/context/SidebarContext';
import AppShell from '@/components/appShell';

export default function AppLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" >
      <main className="flex-1">  
          <SidebarProvider>
            <AppShell>
              {children}
            </AppShell>
          </SidebarProvider>
      </main>
    </div>
  );
}