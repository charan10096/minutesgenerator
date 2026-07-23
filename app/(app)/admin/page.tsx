'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, DollarSign, Cpu, TrendingUp, Shield } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<any[]>([]);
  const [stats, setStats] = useState({ meetings: 0, actions: 0, tokens: 0, cost: 0 });

  useEffect(() => {
    (async () => {
      const [m, a, u] = await Promise.all([
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('action_items').select('*', { count: 'exact', head: true }),
        supabase.from('api_usage').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setStats({
        meetings: m.count ?? 0,
        actions: a.count ?? 0,
        tokens: (u.data ?? []).reduce((sum: number, r: any) => sum + (r.total_tokens ?? 0), 0),
        cost: (u.data ?? []).reduce((sum: number, r: any) => sum + Number(r.cost ?? 0), 0),
      });
      setUsage((u.data ?? []).reverse());
      setLoading(false);
    })();
  }, []);

  const costData = usage.map((u, i) => ({ name: `#${i + 1}`, cost: Number(u.cost ?? 0) * 1000, tokens: u.total_tokens ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Usage analytics, API costs, and system overview.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Meetings', value: stats.meetings, icon: Users, color: 'text-primary' },
          { label: 'Action Items', value: stats.actions, icon: Activity, color: 'text-accent' },
          { label: 'Total Tokens', value: stats.tokens.toLocaleString(), icon: Cpu, color: 'text-secondary' },
          { label: 'Total Cost', value: `$${stats.cost.toFixed(4)}`, icon: DollarSign, color: 'text-success' },
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

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">API Cost Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', fontSize: '0.875rem' }} />
            <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 font-display font-semibold">Recent API Usage</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : usage.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No API usage recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {usage.slice().reverse().map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{u.model}</Badge>
                  <span className="text-sm text-muted-foreground">{formatDate(u.created_at)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{u.total_tokens} tokens</span>
                  <span className="font-medium">${Number(u.cost).toFixed(5)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
