'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gavel, Filter } from 'lucide-react';
import { useTableData } from '@/hooks/use-table-data';
import type { Decision } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DecisionsPage() {
  const { data: decisions, loading } = useTableData<Decision>('decisions');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return decisions;
    const q = search.toLowerCase();
    return decisions.filter(
      (d) =>
        d.decision.toLowerCase().includes(q) ||
        d.decision_maker?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q)
    );
  }, [decisions, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Decisions</h1>
        <p className="text-sm text-muted-foreground">{decisions.length} decisions detected across all meetings.</p>
      </div>

      <input
        type="text"
        placeholder="Search decisions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Gavel className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No decisions found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Card className="p-5">
                <Link href={`/meetings/${d.meeting_id}`}>
                  <p className="font-medium hover:text-primary">{d.decision}</p>
                </Link>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {d.decision_maker && <div><span className="font-medium text-foreground">Decision maker:</span> {d.decision_maker}</div>}
                  {d.reason && <div><span className="font-medium text-foreground">Reason:</span> {d.reason}</div>}
                  {d.impact && <div className="sm:col-span-2"><span className="font-medium text-foreground">Impact:</span> {d.impact}</div>}
                </div>
                {d.confidence_score != null && (
                  <Badge variant="outline" className="mt-2">{(d.confidence_score * 100).toFixed(0)}% confidence</Badge>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
