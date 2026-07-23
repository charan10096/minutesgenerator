'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  AlertTriangle,
  CalendarClock,
  Gavel,
  Shield,
  Sparkles,
  Upload,
  Brain,
  Download,
  Menu,
  X,
  ArrowLeft,
  Zap,
  Globe,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const features = [
  {
    icon: FileText,
    title: 'AI Meeting Summaries',
    description:
      'Generate executive, detailed, bullet, and timeline summaries from raw transcripts in seconds.',
    color: 'text-primary',
  },
  {
    icon: ListChecks,
    title: 'Action Item Extraction',
    description:
      'Automatically extract tasks, owners, departments, priorities, deadlines, and dependencies.',
    color: 'text-accent',
  },
  {
    icon: Gavel,
    title: 'Decision Detection',
    description:
      'Identify decisions, decision makers, reasoning, and business impact with confidence scores.',
    color: 'text-secondary',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Identification',
    description:
      'Detect project, technical, budget, timeline, and communication risks with severity ratings.',
    color: 'text-warning',
  },
  {
    icon: CalendarClock,
    title: 'Deadline Tracking',
    description:
      'Extract due dates, track owners, flag past-due tasks, and monitor completion status.',
    color: 'text-destructive',
  },
  {
    icon: Download,
    title: 'Multi-format Export',
    description:
      'Export professional reports as PDF, DOCX, Markdown, JSON, or CSV with one click.',
    color: 'text-success',
  },
];

const steps = [
  {
    icon: Upload,
    title: 'Upload Transcript',
    description: 'Drag & drop TXT, DOCX, PDF, SRT, or VTT files up to 100MB.',
  },
  {
    icon: Brain,
    title: 'AI Processing',
    description: 'Our LLM engine parses, understands, and structures your meeting content.',
  },
  {
    icon: Sparkles,
    title: 'Get Insights',
    description: 'Review summaries, action items, risks, decisions, and deadlines instantly.',
  },
];

const stats = [
  { value: '50K+', label: 'Meetings Processed' },
  { value: '1.2M+', label: 'Action Items Extracted' },
  { value: '99.4%', label: 'Extraction Accuracy' },
  { value: '<30s', label: 'Average Processing Time' },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/40">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-glow">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                MeetMinGenerator
              </span>
            </Link>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gradient-primary text-white">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        {mobileMenu && (
          <div className="border-t border-border/40 px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground">Features</Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground">How it Works</Link>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link href="/register" className="flex-1"><Button className="w-full gradient-primary text-white">Get Started</Button></Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Powered by GPT-4 AI Engine
            </Badge>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Turn meeting transcripts into
              <span className="block text-gradient">actionable minutes in seconds</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Upload any meeting transcript and let AI generate professional summaries,
              extract action items, detect risks, decisions, and deadlines — all with
              confidence scores and structured exports.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gradient-primary text-white shadow-glow">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button size="lg" variant="outline">See How It Works</Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> 5 free meetings / month</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Cancel anytime</span>
            </div>
          </motion.div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <Card key={s.label} className="glass p-6 text-center">
                <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need from meeting transcripts
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From raw conversation to structured intelligence — MeetMinGenerator handles it all.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="group h-full p-6 transition-all hover:shadow-glow hover:-translate-y-1">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to structured meeting intelligence
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow">
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="mt-4 text-sm font-medium text-primary">Step {i + 1}</div>
                <h3 className="mt-1 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security banner */}
      <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <Card className="glass overflow-hidden p-8 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Badge variant="outline" className="mb-4 gap-1.5"><Shield className="h-3.5 w-3.5" /> Enterprise Security</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Built for security and scale
              </h2>
              <p className="mt-4 text-muted-foreground">
                Your data is protected with row-level security, JWT authentication,
                input validation, and encrypted storage. Every meeting is isolated
                to your account.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['JWT Auth', 'Row-Level Security', 'Input Validation', 'Prompt Injection Guard', 'XSS Protection', 'File Validation'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, label: 'Fast Processing', value: '<30s' },
                { icon: Globe, label: 'Multi-language', value: '95+ langs' },
                { icon: Clock, label: 'Deadline Alerts', value: 'Real-time' },
                { icon: Shield, label: 'Data Isolation', value: '100%' },
              ].map((item) => (
                <Card key={item.label} className="glass p-5">
                  <item.icon className="h-6 w-6 text-primary" />
                  <div className="mt-3 font-display text-2xl font-bold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <Card className="gradient-primary overflow-hidden p-12 text-center text-white">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform your meetings?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Join thousands of professionals using AI to turn meeting transcripts into actionable intelligence.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-display font-semibold">MeetMinGenerator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MeetMinGenerator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
