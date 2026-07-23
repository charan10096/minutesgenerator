'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, Shield, Globe, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!confirm('This will permanently delete your account and all meeting data. This cannot be undone. Continue?')) return;
    await supabase.from('profiles').delete().eq('id', user!.id);
    await supabase.auth.signOut();
    toast({ title: 'Account deleted' });
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences.</p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display font-semibold">Appearance</h2>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <Label className="font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes</p>
            </div>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display font-semibold">Notifications</h2>
        <div className="space-y-3">
          {[
            { icon: Bell, label: 'Upcoming Deadlines', desc: 'Get notified about deadlines approaching' },
            { icon: Shield, label: 'Risk Alerts', desc: 'Receive alerts for high-severity risks' },
            { icon: Globe, label: 'Processing Complete', desc: 'Notify when a meeting finishes processing' },
          ].map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              {i < 2 && <Separator className="my-1 opacity-0" />}
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-destructive/30 p-6">
        <h2 className="mb-2 font-display font-semibold text-destructive">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
        <Button variant="outline" onClick={handleDeleteAccount} className="border-destructive/40 text-destructive hover:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
        </Button>
      </Card>
    </div>
  );
}
