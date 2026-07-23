'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search as SearchIcon, FileText, ListChecks, AlertTriangle, Gavel, CalendarClock } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Meeting, ActionItem, Risk, Decision, Deadline } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge, StatusBadge, SeverityBadge, MeetingStatusBadge } from '@/components/dashboard/badges';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SearchType = 'all' | 'meetings' | 'actions' | 'risks' | 'decisions' | 'deadlines';

export default function SearchPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [type, setType] = useState<SearchType>('all');
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setMeetings([]); setActions([]); setRisks([]); setDecisions([]); setDeadlines([]);
      return;
    }
    setLoading(true);
    (async () => {
      const ilike = `%${q}%`;
      const [m, a, r, d, dl] = await Promise.all([
        supabase.from('meetings').select('*').or(`title.ilike.${ilike},participants.cs.{${q}}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('action_items').select('*').or(`task.ilike.${ilike},owner.ilike.${ilike}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('risks').select('*').or(`risk.ilike.${ilike}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('decisions').select('*').or(`decision.ilike.${ilike},decision_maker.ilike.${ilike}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('deadlines').select('*').or(`task.ilike.${ilike},owner.ilike.${ilike}`).order('due_date', { ascending: true }).limit(20),
      ]);
      setMeetings((m.data as Meeting[]) ?? []);
      setActions((a.data as ActionItem[]) ?? []);
      setRisks((r.data as Risk[]) ?? []);
      setDecisions((d.data as Decision[]) ?? []);
      setDeadlines((dl.data as Deadline[]) ?? []);
      setLoading(false);
    })();
  }, [query]);

  const total = meetings.length + actions.length + risks.length + decisions.length + deadlines.length;

  const show = (t: SearchType) => type === 'all' || type === t;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">Find meetings, action items, risks, decisions, and deadlines.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by keyword, owner, participant..."
            className="pl-9"
            autoFocus
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as SearchType)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="meetings">Meetings</SelectItem>
            <SelectItem value="actions">Action Items</SelectItem>
            <SelectItem value="risks">Risks</SelectItem>
            <SelectItem value="decisions">Decisions</SelectItem>
            <SelectItem value="deadlines">Deadlines</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query && (
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
        </p>
      )}

      {!query && (
        <Card className="p-12 text-center">
          <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Start typing to search across your meetings.</p>
        </Card>
      )}

      {query && !loading && total === 0 && (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No results found for "{query}".</p>
        </Card>
      )}

      {/* Meetings */}
      {show('meetings') && meetings.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground"><FileText className="h-4 w-4" /> Meetings</h2>
          {meetings.map((m) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div><p className="font-medium">{m.title}</p><p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p></div>
                <MeetingStatusBadge status={m.status} />
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Actions */}
      {show('actions') && actions.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground"><ListChecks className="h-4 w-4" /> Action Items</h2>
          {actions.map((a) => (
            <Link key={a.id} href={`/meetings/${a.meeting_id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div><p className="font-medium">{a.task}</p><p className="text-xs text-muted-foreground">{a.owner || 'Unassigned'}</p></div>
                <div className="flex gap-2"><PriorityBadge priority={a.priority} /><StatusBadge status={a.status} /></div>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Risks */}
      {show('risks') && risks.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground"><AlertTriangle className="h-4 w-4" /> Risks</h2>
          {risks.map((r) => (
            <Link key={r.id} href={`/meetings/${r.meeting_id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div><p className="font-medium">{r.risk}</p><p className="text-xs text-muted-foreground capitalize">{r.category}</p></div>
                <SeverityBadge severity={r.severity} />
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Decisions */}
      {show('decisions') && decisions.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground"><Gavel className="h-4 w-4" /> Decisions</h2>
          {decisions.map((d) => (
            <Link key={d.id} href={`/meetings/${d.meeting_id}`}>
              <Card className="p-4 transition-colors hover:bg-muted/50">
                <p className="font-medium">{d.decision}</p>
                {d.decision_maker && <p className="text-xs text-muted-foreground">By {d.decision_maker}</p>}
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* Deadlines */}
      {show('deadlines') && deadlines.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground"><CalendarClock className="h-4 w-4" /> Deadlines</h2>
          {deadlines.map((dl) => (
            <Link key={dl.id} href={`/meetings/${dl.meeting_id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                <div><p className="font-medium">{dl.task}</p><p className="text-xs text-muted-foreground">Due {formatDate(dl.due_date)}</p></div>
                <PriorityBadge priority={dl.priority} />
              </Card>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
