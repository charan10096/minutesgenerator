'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Gavel,
  AlertTriangle,
  CalendarClock,
  Download,
  Trash2,
  Loader2,
  Users,
  Globe,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Meeting, MeetingSummary, ActionItem, Risk, Decision, Deadline } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  PriorityBadge,
  StatusBadge,
  SeverityBadge,
  MeetingStatusBadge,
} from '@/components/dashboard/badges';
import { formatDate, formatDateTime, isPastDue, daysUntil } from '@/lib/format';
import { exportMeeting, downloadFile } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const meetingId = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, s, a, r, d, dl] = await Promise.all([
        supabase.from('meetings').select('*').eq('id', meetingId).maybeSingle(),
        supabase.from('meeting_summaries').select('*').eq('meeting_id', meetingId).maybeSingle(),
        supabase.from('action_items').select('*').eq('meeting_id', meetingId).order('created_at'),
        supabase.from('risks').select('*').eq('meeting_id', meetingId).order('created_at'),
        supabase.from('decisions').select('*').eq('meeting_id', meetingId).order('created_at'),
        supabase.from('deadlines').select('*').eq('meeting_id', meetingId).order('due_date'),
      ]);
      setMeeting((m.data as Meeting) ?? null);
      setSummary((s.data as MeetingSummary) ?? null);
      setActions((a.data as ActionItem[]) ?? []);
      setRisks((r.data as Risk[]) ?? []);
      setDecisions((d.data as Decision[]) ?? []);
      setDeadlines((dl.data as Deadline[]) ?? []);
      setLoading(false);
    })();
  }, [meetingId]);

  const handleExport = (format: 'markdown' | 'json' | 'csv') => {
    if (!meeting) return;
    const { content, filename, mime } = exportMeeting(format, {
      meeting: meeting!,
      summary,
      actions,
      risks,
      decisions,
      deadlines,
    });
    downloadFile(content, filename, mime);
    toast({ title: 'Export ready', description: `${format.toUpperCase()} downloaded.` });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this meeting and all its data?')) return;
    await supabase.from('meetings').delete().eq('id', meetingId);
    toast({ title: 'Meeting deleted' });
    router.push('/history');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Meeting not found.</p>
        <Link href="/history"><Button variant="outline" className="mt-4">Back to History</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/history">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-tight">{meeting.title}</h1>
              <MeetingStatusBadge status={meeting.status} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {formatDateTime(meeting.created_at)}</span>
              {meeting.language && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {meeting.language}</span>}
              {meeting.sentiment && <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {meeting.sentiment}</span>}
              {meeting.confidence_score != null && (
            <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> {(meeting.confidence_score * 100).toFixed(0)}% confidence</span>
          )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('markdown')}><Download className="mr-1.5 h-4 w-4" /> MD</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}> JSON</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}> CSV</Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Participants */}
      {meeting.participants.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-primary" /> Participants</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {meeting.participants.map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </div>
        </Card>
      )}

      {meeting.status !== 'completed' && (
        <Card className="flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            {meeting.status === 'processing' ? 'This meeting is still being processed.' : meeting.processing_error || 'Processing not started.'}
          </span>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="summary" className="gap-1.5"><FileText className="h-4 w-4" /> Summary</TabsTrigger>
          <TabsTrigger value="actions" className="gap-1.5"><ListChecks className="h-4 w-4" /> Actions ({actions.length})</TabsTrigger>
          <TabsTrigger value="decisions" className="gap-1.5"><Gavel className="h-4 w-4" /> Decisions ({decisions.length})</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1.5"><AlertTriangle className="h-4 w-4" /> Risks ({risks.length})</TabsTrigger>
          <TabsTrigger value="deadlines" className="gap-1.5"><CalendarClock className="h-4 w-4" /> Deadlines ({deadlines.length})</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="space-y-4">
          {summary ? (
            <>
              {summary.executive_summary && (
                <Card className="p-6">
                  <h3 className="mb-2 font-display font-semibold">Executive Summary</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{summary.executive_summary}</p>
                </Card>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                {summary.bullet_summary && (
                  <Card className="p-6">
                    <h3 className="mb-2 font-display font-semibold">Bullet Summary</h3>
                    <ul className="space-y-1.5">
                      {summary.bullet_summary.split('\n').filter(Boolean).map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />{b.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {summary.timeline_summary && (
                  <Card className="p-6">
                    <h3 className="mb-2 font-display font-semibold">Timeline Summary</h3>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{summary.timeline_summary}</p>
                  </Card>
                )}
              </div>
              {summary.detailed_summary && (
                <Card className="p-6">
                  <h3 className="mb-2 font-display font-semibold">Detailed Summary</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{summary.detailed_summary}</p>
                </Card>
              )}
              {summary.highlights.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-3 font-display font-semibold">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.highlights.map((h, i) => (
                      <Badge key={i} className="gap-1.5"><Sparkles className="h-3 w-3" /> {h}</Badge>
                    ))}
                  </div>
                </Card>
              )}
              {summary.agenda.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-3 font-display font-semibold">Agenda</h3>
                  <ol className="space-y-1.5">
                    {summary.agenda.map((a, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{i + 1}.</span> {a}
                      </li>
                    ))}
                  </ol>
                </Card>
              )}
              {summary.discussion_points.length > 0 && (
                <Card className="p-6">
                  <h3 className="mb-3 font-display font-semibold">Discussion Points</h3>
                  <ul className="space-y-1.5">
                    {summary.discussion_points.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" /> {d}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-6 text-sm text-muted-foreground">No summary available.</Card>
          )}
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions" className="space-y-3">
          {actions.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No action items extracted.</Card>
          ) : (
            actions.map((a) => (
              <ActionItemCard key={a.id} item={a} />
            ))
          )}
        </TabsContent>

        {/* Decisions */}
        <TabsContent value="decisions" className="space-y-3">
          {decisions.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No decisions detected.</Card>
          ) : (
            decisions.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{d.decision}</p>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      {d.decision_maker && <div><span className="font-medium text-foreground">Decision maker:</span> {d.decision_maker}</div>}
                      {d.reason && <div><span className="font-medium text-foreground">Reason:</span> {d.reason}</div>}
                      {d.impact && <div className="sm:col-span-2"><span className="font-medium text-foreground">Impact:</span> {d.impact}</div>}
                    </div>
                  </div>
                  {d.confidence_score != null && (
                    <Badge variant="outline">{(d.confidence_score * 100).toFixed(0)}%</Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Risks */}
        <TabsContent value="risks" className="space-y-3">
          {risks.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No risks identified.</Card>
          ) : (
            risks.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{r.risk}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span><span className="font-medium text-foreground">Category:</span> {r.category}</span>
                      {r.mitigation && <span><span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <SeverityBadge severity={r.severity} />
                    {r.confidence_score != null && <Badge variant="outline">{(r.confidence_score * 100).toFixed(0)}%</Badge>}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Deadlines */}
        <TabsContent value="deadlines" className="space-y-3">
          {deadlines.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">No deadlines extracted.</Card>
          ) : (
            deadlines.map((dl) => {
              const past = isPastDue(dl.due_date);
              const days = daysUntil(dl.due_date);
              return (
                <Card key={dl.id} className={`p-5 ${past && dl.status !== 'completed' ? 'border-destructive/40 bg-destructive/5' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{dl.task}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span><span className="font-medium text-foreground">Due:</span> {formatDate(dl.due_date)}</span>
                        {dl.owner && <span><span className="font-medium text-foreground">Owner:</span> {dl.owner}</span>}
                        {past && dl.status !== 'completed' && (
                          <span className="font-medium text-destructive">Overdue ({Math.abs(days)}d)</span>
                        )}
                        {!past && days <= 7 && (
                          <span className="font-medium text-warning">Due in {days}d</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <PriorityBadge priority={dl.priority} />
                      <StatusBadge status={dl.status} />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActionItemCard({ item }: { item: ActionItem }) {
  const past = isPastDue(item.deadline);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium">{item.task}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {item.owner && <span><span className="font-medium text-foreground">Owner:</span> {item.owner}</span>}
            {item.department && <span><span className="font-medium text-foreground">Dept:</span> {item.department}</span>}
            {item.deadline && <span className={past ? 'font-medium text-destructive' : ''}><span className="font-medium text-foreground">Deadline:</span> {formatDate(item.deadline)}{past ? ' (overdue)' : ''}</span>}
            {item.estimated_effort && <span><span className="font-medium text-foreground">Effort:</span> {item.estimated_effort}</span>}
            {item.dependencies && <span><span className="font-medium text-foreground">Deps:</span> {item.dependencies}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PriorityBadge priority={item.priority} />
          <StatusBadge status={item.status} />
          {item.confidence_score != null && <Badge variant="outline">{(item.confidence_score * 100).toFixed(0)}%</Badge>}
        </div>
      </div>
    </Card>
  );
}
