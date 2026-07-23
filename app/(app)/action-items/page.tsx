'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ListChecks, Filter, Loader2 } from 'lucide-react';
import { useTableData } from '@/hooks/use-table-data';
import { supabase } from '@/lib/supabase/client';
import type { ActionItem, Priority, ActionStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge, StatusBadge } from '@/components/dashboard/badges';
import { formatDate, isPastDue } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ActionItemsPage() {
  const { data: items, loading, reload } = useTableData<ActionItem>('action_items');
  const { toast } = useToast();
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
  }, [items, priorityFilter, statusFilter]);

  const updateStatus = async (id: string, status: ActionStatus) => {
    await supabase.from('action_items').update({ status }).eq('id', id);
    reload();
    toast({ title: 'Status updated' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Action Items</h1>
        <p className="text-sm text-muted-foreground">{items.length} total action items across all meetings.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No action items found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const past = isPastDue(item.deadline);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/meetings/${item.meeting_id}`} className="flex-1">
                      <p className="font-medium hover:text-primary">{item.task}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {item.owner && <span>Owner: {item.owner}</span>}
                        {item.department && <span>Dept: {item.department}</span>}
                        {item.deadline && <span className={past ? 'font-medium text-destructive' : ''}>Due: {formatDate(item.deadline)}{past ? ' (overdue)' : ''}</span>}
                        {item.estimated_effort && <span>Effort: {item.estimated_effort}</span>}
                      </div>
                    </Link>
                    <div className="flex flex-col items-end gap-2">
                      <PriorityBadge priority={item.priority} />
                      <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v as ActionStatus)}>
                        <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
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
