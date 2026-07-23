'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  History,
  ListChecks,
  Gavel,
  AlertTriangle,
  CalendarClock,
  Search,
  FileBarChart,
  Settings,
  Shield,
  User,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/action-items', label: 'Action Items', icon: ListChecks },
  { href: '/decisions', label: 'Decisions', icon: Gavel },
  { href: '/risks', label: 'Risks', icon: AlertTriangle },
  { href: '/deadlines', label: 'Deadlines', icon: CalendarClock },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/history', label: 'History', icon: History },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Sidebar - mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar lg:hidden"
            >
              <div className="flex items-center justify-between p-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="font-display font-semibold">MeetMin</span>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 glass-strong px-4 sm:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden flex-1 max-w-md sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search meetings, actions, owners..."
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = (e.target as HTMLInputElement).value;
                  if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
                }
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="hidden h-5 w-5 dark:block" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium">Processing complete</span>
                  <span className="text-xs text-muted-foreground">Your meeting has been analyzed.</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-xs text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="hidden items-center gap-2 p-4 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-display font-semibold">MeetMin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'gradient-primary text-white shadow-soft'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-3">
        <Link
          href="/upload"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-lg gradient-primary px-3 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02]"
        >
          <Upload className="h-4 w-4" /> New Meeting
        </Link>
      </div>
    </>
  );
}
