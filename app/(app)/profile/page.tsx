'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building, Calendar, Loader2, Save } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [company, setCompany] = useState(profile?.company ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setCompany(profile?.company ?? '');
  }, [profile]);

  const initials = (fullName || user?.email || 'U')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user!.id, full_name: fullName, company });
    setSaving(false);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({ title: 'Profile updated' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-lg text-white">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">{fullName || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-display font-semibold">Account Details</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" value={user?.email ?? ''} disabled className="pl-9 bg-muted/50" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Member Since</Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" /> {formatDate(profile?.created_at ?? user?.created_at)}
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-6 gradient-primary text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </Card>
    </div>
  );
}
