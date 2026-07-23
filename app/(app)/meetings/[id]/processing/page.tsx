'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Brain, FileText, ListChecks } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { processMeeting } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Meeting } from '@/lib/types';

const steps = [
  { icon: FileText, label: 'Reading transcript' },
  { icon: Sparkles, label: 'Cleaning & normalizing text' },
  { icon: Brain, label: 'AI analysis (LLM)' },
  { icon: ListChecks, label: 'Extracting action items & insights' },
  { icon: CheckCircle2, label: 'Saving results' },
];

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const meetingId = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [error, setError] = useState('');
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .maybeSingle();
      if (cancelled || !data) return;
      setMeeting(data as Meeting);

      // If already completed, go to results
      if ((data as Meeting).status === 'completed') {
        router.replace(`/meetings/${meetingId}`);
        return;
      }

      // Kick off processing
      const result = await processMeeting(meetingId);
      if (cancelled) return;
      if (result.success) {
        setStatus('completed');
        setTimeout(() => router.replace(`/meetings/${meetingId}`), 1200);
      } else {
        setStatus('failed');
        setError(result.error || 'Processing failed');
      }
    };

    load();

    // Animate steps
    const interval = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [meetingId, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card className="glass p-8">
          <div className="mb-8 text-center">
            {status === 'processing' && (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {status === 'completed' && (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            )}
            {status === 'failed' && (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
            <h1 className="font-display text-xl font-bold">
              {status === 'processing' && 'Processing your meeting...'}
              {status === 'completed' && 'Processing complete!'}
              {status === 'failed' && 'Processing failed'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meeting?.title}
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => {
              const done = status === 'completed' || (status === 'processing' && i < stepIdx);
              const active = status === 'processing' && i === stepIdx;
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                    active ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    done ? 'bg-success/10' : active ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <step.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {status === 'failed' && (
            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
              <Button
                onClick={() => router.push('/upload')}
                variant="outline"
                className="w-full"
              >
                Back to Upload
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
