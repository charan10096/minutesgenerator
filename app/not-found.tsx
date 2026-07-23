'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileQuestion className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-display text-6xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-lg font-medium">Page not found</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="gradient-primary text-white">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
