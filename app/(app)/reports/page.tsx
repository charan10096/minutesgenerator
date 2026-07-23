'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileBarChart, Download, FileText, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Meeting, ActionItem, Risk, Decision } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MeetingStatusBadge, PriorityBadge } from '@/components/dashboard/badges';
import { formatDate, formatDateTime } from '@/lib/format';
import { exportMeeting, downloadFile } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalActions: 0, totalRisks: 0, totalDecisions: 0, completed: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
      setMeetings((data as Meeting[]) ?? []);
      const [a, r, d] = await Promise.all([
        supabase.from('action_items').select('*', { count: 'exact', head: true }),
        supabase.from('risks').select('*', { count: 'exact', head: true }),
        supabase.from('decisions').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        totalActions: a.count ?? 0,
        totalRisks: r.count ?? 0,
        totalDecisions: d.count ?? 0,
        completed: ((data as Meeting[]) ?? []).filter((m) => m.status === 'completed').length,
      });
      setLoading(false);
    })();
  }, []);

  const handleExport = async (meetingId: string, format: 'markdown' | 'json' | 'csv') => {
    const [m, s, a, r, d, dl] = await Promise.all([
      supabase.from('meetings').select('*').eq('id', meetingId).maybeSingle(),
      supabase.from('meeting_summaries').select('*').eq('meeting_id', meetingId).maybeSingle(),
      supabase.from('action_items').select('*').eq('meeting_id', meetingId),
      supabase.from('risks').select('*').eq('meeting_id', meetingId),
      supabase.from('decisions').select('*').eq('meeting_id', meetingId),
      supabase.from('deadlines').select('*').eq('meeting_id', meetingId),
    ]);
    const { content, filename, mime } = exportMeeting(format, {
      meeting: m.data as Meeting,
      summary: s.data as any,
      actions: (a.data as ActionItem[]) ?? [],
      risks: (r.data as Risk[]) ?? [],
      decisions: (d.data as Decision[]) ?? [],
      deadlines: (dl.data as any[]) ?? [],
    });
    downloadFile(content, filename, mime);
    await supabase.from('exports').insert({ meeting_id: meetingId, format });
    toast({ title: 'Export ready', description: `${filename} downloaded.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">Export professional reports from your processed meetings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Meetings', value: meetings.length, icon: FileText, color: 'text-primary' },
          { label: 'Action Items', value: stats.totalActions, icon: TrendingUp, color: 'text-accent' },
          { label: 'Risks', value: stats.totalRisks, icon: FileBarChart, color: 'text-destructive' },
          { label: 'Decisions', value: stats.totalDecisions, icon: FileBarChart, color: 'text-secondary' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div className="mt-2 font-display text-2xl font-bold">{loading ? '—' : s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-12 text-center">
          <FileBarChart className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No meetings to report on yet.</p>
          <Link href="/upload"><Button className="mt-4 gradient-primary text-white">Upload a Meeting</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/meetings/${m.id}`} className="flex-1">
                  <p className="font-medium hover:text-primary">{m.title}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {formatDateTime(m.created_at)}
                    <MeetingStatusBadge status={m.status} />
                  </p>
                </Link>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport(m.id, 'markdown')}><Download className="mr-1 h-3.5 w-3.5" /> MD</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport(m.id, 'json')}>JSON</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport(m.id, 'csv')}>CSV</Button>
                  <Link href={`/meetings/${m.id}`}>
                    <Button size="sm" variant="ghost"><ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
