'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useTableData<T>(
  table: string,
  select = '*',
  orderBy = 'created_at',
  ascending = false
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .order(orderBy, { ascending });
    if (error) setError(error.message);
    setData((data as T[]) ?? []);
    setLoading(false);
  }, [table, select, orderBy, ascending]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
