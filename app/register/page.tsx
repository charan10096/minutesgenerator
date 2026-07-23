'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FileText, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  company: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { signUp } = useAuth();
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
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);
    if (error) {
      toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Account created!', description: 'Welcome to MeetMinGenerator.' });
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-secondary p-12 text-white lg:flex">
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
            Start turning transcripts into action.
          </motion.h1>
          <p className="mt-4 text-white/80">
            Create a free account and process your first meeting in under a minute.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {['5 free meetings / month', 'All extraction types', 'No credit card required'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-white/60">© {new Date().getFullYear()} MeetMinGenerator</div>
      </div>

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
            <h2 className="font-display text-2xl font-bold">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started free — no credit card required.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="fullName" placeholder="Jane Doe" className="pl-9" {...register('fullName')} />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@company.com" className="pl-9" {...register('email')} />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" placeholder="Acme Inc." {...register('company')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
