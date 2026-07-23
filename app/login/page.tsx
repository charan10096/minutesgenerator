'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FileText, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">MeetMinGenerator</span>
        </Link>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-bold leading-tight"
          >
            Welcome back to smarter meeting minutes.
          </motion.h1>
          <p className="mt-4 text-white/80">
            Sign in to access your meeting history, action items, and AI-generated insights.
          </p>
        </div>
        <div className="text-sm text-white/60">© {new Date().getFullYear()} MeetMinGenerator</div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">MeetMinGenerator</span>
            </Link>
          </div>
          <Card className="glass p-8">
            <h2 className="font-display text-2xl font-bold">Sign in to your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your dashboard.
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
