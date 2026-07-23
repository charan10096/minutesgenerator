'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Meeting, ActionItem, DashboardStats } from '@/lib/types';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMeetings: 0,
    actionItems: 0,
    pendingActions: 0,
    completedActions: 0,
    risksDetected: 0,
    decisionsTaken: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [recentActions, setRecentActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [meetings, actions, risks, decisions] = await Promise.all([
        supabase.from('meetings').select('*', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(5),
        supabase.from('action_items').select('*', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(5),
        supabase.from('risks').select('*', { count: 'exact', head: true }),
        supabase.from('decisions').select('*', { count: 'exact', head: true }),
      ]);

      const totalMeetings = meetings.count ?? 0;
      const totalActions = actions.count ?? 0;
      const pending = actions.data?.filter((a) => a.status === 'pending').length ?? 0;
      const completed = actions.data?.filter((a) => a.status === 'completed').length ?? 0;

      setStats({
        totalMeetings,
        actionItems: totalActions,
        pendingActions: pending,
        completedActions: completed,
        risksDetected: risks.count ?? 0,
        decisionsTaken: decisions.count ?? 0,
      });
      setRecentMeetings((meetings.data as Meeting[]) ?? []);
      setRecentActions((actions.data as ActionItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return { stats, recentMeetings, recentActions, loading };
}
