'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, Search, Trash2, FileText } from 'lucide-react';
import { useTableData } from '@/hooks/use-table-data';
import { supabase } from '@/lib/supabase/client';
import type { Meeting } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MeetingStatusBadge } from '@/components/dashboard/badges';
import { formatDateTime, formatFileSize } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function HistoryPage() {
  const { data: meetings, loading, reload } = useTableData<Meeting>('meetings', '*', 'created_at', false);
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return meetings;
    const q = search.toLowerCase();
    return meetings.filter((m) => m.title.toLowerCase().includes(q) || m.file_name?.toLowerCase().includes(q));
  }, [meetings, search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meeting and all related data?')) return;
    await supabase.from('meetings').delete().eq('id', id);
    reload();
    toast({ title: 'Meeting deleted' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Meeting History</h1>
        <p className="text-sm text-muted-foreground">{meetings.length} meetings on record.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter meetings..." className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search ? 'No meetings match your filter.' : 'No meetings yet.'}
          </p>
          {!search && <Link href="/upload"><Button className="mt-4 gradient-primary text-white">Upload a Meeting</Button></Link>}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Card className="flex items-center justify-between p-4">
                <Link href={`/meetings/${m.id}`} className="flex flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium hover:text-primary">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(m.created_at)}
                      {m.file_name && ` · ${m.file_name}`}
                      {m.file_size ? ` · ${formatFileSize(m.file_size)}` : ''}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <MeetingStatusBadge status={m.status} />
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
