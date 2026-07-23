'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FileText, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email);
    setLoading(false);
    if (error) {
      toast({ title: 'Request failed', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Check your email', description: 'Password reset link sent.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">MeetMinGenerator</span>
          </Link>
        </div>
        <Card className="glass p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to your email address.
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl font-bold">Reset your password</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@company.com" className="pl-9" {...register('email')} />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <Link href="/login" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
