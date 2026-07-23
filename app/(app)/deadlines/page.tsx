'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarClock, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useTableData } from '@/hooks/use-table-data';
import type { Deadline } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge, StatusBadge } from '@/components/dashboard/badges';
import { formatDate, isPastDue, daysUntil } from '@/lib/format';

export default function DeadlinesPage() {
  const { data: deadlines, loading } = useTableData<Deadline>('deadlines', '*', 'due_date', true);
  const [tab, setTab] = useState<'all' | 'upcoming' | 'overdue'>('all');

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return deadlines.filter((d) => !isPastDue(d.due_date) && d.status !== 'completed');
    if (tab === 'overdue') return deadlines.filter((d) => isPastDue(d.due_date) && d.status !== 'completed');
    return deadlines;
  }, [deadlines, tab]);

  const overdueCount = deadlines.filter((d) => isPastDue(d.due_date) && d.status !== 'completed').length;
  const upcomingCount = deadlines.filter((d) => !isPastDue(d.due_date) && d.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Deadlines</h1>
        <p className="text-sm text-muted-foreground">{deadlines.length} deadlines tracked.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setTab('all')} className={`rounded-lg border p-4 text-left transition-colors ${tab === 'all' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <CalendarClock className="h-5 w-5 text-primary" />
          <div className="mt-2 font-display text-xl font-bold">{deadlines.length}</div>
          <div className="text-xs text-muted-foreground">All</div>
        </button>
        <button onClick={() => setTab('upcoming')} className={`rounded-lg border p-4 text-left transition-colors ${tab === 'upcoming' ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <Clock className="h-5 w-5 text-warning" />
          <div className="mt-2 font-display text-xl font-bold">{upcomingCount}</div>
          <div className="text-xs text-muted-foreground">Upcoming</div>
        </button>
        <button onClick={() => setTab('overdue')} className={`rounded-lg border p-4 text-left transition-colors ${tab === 'overdue' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="mt-2 font-display text-xl font-bold">{overdueCount}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No deadlines found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((dl, i) => {
            const past = isPastDue(dl.due_date);
            const days = daysUntil(dl.due_date);
            return (
              <motion.div
                key={dl.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card className={`p-5 ${past && dl.status !== 'completed' ? 'border-destructive/40 bg-destructive/5' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/meetings/${dl.meeting_id}`} className="flex-1">
                      <p className="font-medium hover:text-primary">{dl.task}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span><span className="font-medium text-foreground">Due:</span> {formatDate(dl.due_date)}</span>
                        {dl.owner && <span><span className="font-medium text-foreground">Owner:</span> {dl.owner}</span>}
                        {past && dl.status !== 'completed' && (
                          <span className="flex items-center gap-1 font-medium text-destructive"><AlertCircle className="h-3.5 w-3.5" /> Overdue ({Math.abs(days)}d)</span>
                        )}
                        {!past && days <= 7 && dl.status !== 'completed' && (
                          <span className="font-medium text-warning">Due in {days}d</span>
                        )}
                        {dl.status === 'completed' && (
                          <span className="flex items-center gap-1 font-medium text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-2">
                      <PriorityBadge priority={dl.priority} />
                      <StatusBadge status={dl.status} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
