import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Priority, ActionStatus, RiskSeverity } from '@/lib/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize', map[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: ActionStatus }) {
  const map: Record<ActionStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const label = status.replace('_', ' ');
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize', map[status])}>{label}</span>;
}

export function SeverityBadge({ severity }: { severity: RiskSeverity }) {
  const map: Record<RiskSeverity, string> = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize', map[severity])}>{severity}</span>;
}

export function MeetingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    uploaded: 'bg-muted text-muted-foreground',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize', map[status] ?? map.uploaded)}>{status}</span>;
}
