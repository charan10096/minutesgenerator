import { supabase } from '@/lib/supabase/client';

export async function processMeeting(meetingId: string): Promise<{ success: boolean; error?: string }> {
  const { data: session } = await supabase.auth.getSession();
  const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-meeting`;
  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.session?.access_token ?? ''}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ meetingId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: body.error || `Request failed (${res.status})` };
    }
    const data = await res.json();
    if (data.error) return { success: false, error: data.error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
