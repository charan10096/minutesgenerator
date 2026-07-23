'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter } from 'lucide-react';
import { useTableData } from '@/hooks/use-table-data';
import type { Risk, RiskSeverity } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SeverityBadge } from '@/components/dashboard/badges';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RisksPage() {
  const { data: risks, loading } = useTableData<Risk>('risks');
  const [severity, setSeverity] = useState<string>('all');

  const filtered = useMemo(() => {
    if (severity === 'all') return risks;
    return risks.filter((r) => r.severity === severity);
  }, [risks, severity]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    risks.forEach((r) => (c[r.severity] = (c[r.severity] || 0) + 1));
    return c;
  }, [risks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Risks</h1>
        <p className="text-sm text-muted-foreground">{risks.length} risks identified across all meetings.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['low', 'medium', 'high', 'critical'] as RiskSeverity[]).map((sev) => (
          <Card key={sev} className="p-4">
            <div className="text-xs text-muted-foreground capitalize">{sev}</div>
            <div className="mt-1 font-display text-2xl font-bold">{counts[sev] || 0}</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No risks found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/meetings/${r.meeting_id}`} className="flex-1">
                    <p className="font-medium hover:text-primary">{r.risk}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span><span className="font-medium text-foreground">Category:</span> {r.category}</span>
                      {r.mitigation && <span><span className="font-medium text-foreground">Mitigation:</span> {r.mitigation}</span>}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    <SeverityBadge severity={r.severity} />
                    {r.confidence_score != null && <Badge variant="outline">{(r.confidence_score * 100).toFixed(0)}%</Badge>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
