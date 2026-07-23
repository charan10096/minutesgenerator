'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  ListChecks,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  ArrowRight,
  Calendar,
  Upload,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge, StatusBadge, MeetingStatusBadge } from '@/components/dashboard/badges';
import { formatDate } from '@/lib/format';

const statCards = [
  { key: 'totalMeetings', label: 'Total Meetings', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'actionItems', label: 'Action Items', icon: ListChecks, color: 'text-accent', bg: 'bg-accent/10' },
  { key: 'pendingActions', label: 'Pending Actions', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  { key: 'completedActions', label: 'Completed Actions', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  { key: 'risksDetected', label: 'Risks Detected', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  { key: 'decisionsTaken', label: 'Decisions Taken', icon: Gavel, color: 'text-secondary', bg: 'bg-secondary/10' },
] as const;

const trendData = [
  { name: 'Mon', meetings: 3, actions: 8 },
  { name: 'Tue', meetings: 5, actions: 12 },
  { name: 'Wed', meetings: 2, actions: 6 },
  { name: 'Thu', meetings: 7, actions: 15 },
  { name: 'Fri', meetings: 4, actions: 10 },
  { name: 'Sat', meetings: 1, actions: 3 },
  { name: 'Sun', meetings: 0, actions: 1 },
];

const priorityData = [
  { name: 'Low', value: 12, color: 'hsl(var(--muted-foreground))' },
  { name: 'Medium', value: 28, color: 'hsl(221 83% 60%)' },
  { name: 'High', value: 18, color: 'hsl(38 92% 55%)' },
  { name: 'Critical', value: 6, color: 'hsl(0 72% 51%)' },
];

const statusData = [
  { name: 'Pending', count: 24 },
  { name: 'In Progress', count: 18 },
  { name: 'Completed', count: 32 },
  { name: 'Blocked', count: 6 },
];

export default function DashboardPage() {
  const { stats, recentMeetings, recentActions, loading } = useDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your meeting intelligence.</p>
        </div>
        <Link href="/upload">
          <Button className="gradient-primary text-white">
            <Upload className="mr-2 h-4 w-4" /> Upload Meeting
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="p-5 transition-all hover:shadow-soft">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="font-display text-2xl font-bold">{stats[card.key]}</div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Meetings and action items over the past week</p>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradMeetings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradActions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                }}
              />
              <Area type="monotone" dataKey="meetings" stroke="hsl(var(--primary))" fill="url(#gradMeetings)" strokeWidth={2} />
              <Area type="monotone" dataKey="actions" stroke="hsl(var(--accent))" fill="url(#gradActions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold">Action Items by Priority</h3>
          <p className="text-xs text-muted-foreground">Distribution across priority levels</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display font-semibold">Action Items Status</h3>
        <p className="text-xs text-muted-foreground">Current status distribution</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent meetings + actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Recent Meetings</h3>
            <Link href="/history" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No meetings yet. <Link href="/upload" className="text-primary hover:underline">Upload one</Link>.
            </div>
          ) : (
            <div className="space-y-2">
              {recentMeetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{m.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {formatDate(m.created_at)}
                    </div>
                  </div>
                  <MeetingStatusBadge status={m.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold">Recent Action Items</h3>
            <Link href="/action-items" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : recentActions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No action items yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentActions.map((a) => (
                <div key={a.id} className="rounded-lg border border-border/60 p-3">
                  <div className="truncate text-sm font-medium">{a.task}</div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{a.owner || 'Unassigned'}</span>
                    <div className="flex gap-1.5">
                      <PriorityBadge priority={a.priority} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
