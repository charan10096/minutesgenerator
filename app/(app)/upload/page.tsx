'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  File as FileIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/lib/format';

const ACCEPTED_TYPES = ['.txt', '.docx', '.pdf', '.srt', '.vtt'];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

function getFileExt(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(idx).toLowerCase();
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (f: File): string | null => {
    const ext = getFileExt(f.name);
    if (!ACCEPTED_TYPES.includes(ext)) {
      return `Unsupported file type. Allowed: ${ACCEPTED_TYPES.join(', ')}`;
    }
    if (f.size > MAX_SIZE) {
      return `File too large. Maximum size is 100MB.`;
    }
    return null;
  };

  const handleFile = useCallback(async (f: File) => {
    const err = validate(f);
    if (err) {
      setError(err);
      setFile(null);
      setPreview('');
      return;
    }
    setError('');
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ''));
    if (getFileExt(f.name) === '.txt' || getFileExt(f.name) === '.srt' || getFileExt(f.name) === '.vtt') {
      try {
        const text = await readTextFile(f);
        setPreview(text.slice(0, 4000));
      } catch {
        setPreview('Preview unavailable for this file type.');
      }
    } else {
      setPreview('Preview available after upload for binary formats (DOCX, PDF).');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setProgress(0);

    try {
      let transcript = preview;
      if (getFileExt(file.name) === '.txt' || getFileExt(file.name) === '.srt' || getFileExt(file.name) === '.vtt') {
        transcript = await readTextFile(file);
      }

      // Simulate progress for UX
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 200);

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: title || file.name,
          file_name: file.name,
          file_type: getFileExt(file.name).slice(1),
          file_size: file.size,
          raw_transcript: transcript,
          status: 'uploaded',
        })
        .select('id')
        .single();

      clearInterval(interval);
      setProgress(100);

      if (error) throw error;

      toast({ title: 'Upload complete', description: 'Starting AI processing...' });
      router.push(`/meetings/${data.id}/processing`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Upload Meeting Transcript</h1>
        <p className="text-sm text-muted-foreground">
          Drag & drop or browse. Supported: TXT, DOCX, PDF, SRT, VTT — up to 100MB.
        </p>
      </div>

      <Card
        className={`relative overflow-hidden border-2 border-dashed p-8 transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={onPick}
          className="hidden"
        />
        {!file ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
            >
              <UploadCloud className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="font-medium">Drop your transcript here, or click to browse</p>
            <p className="mt-1 text-sm text-muted-foreground">TXT, DOCX, PDF, SRT, VTT — max 100MB</p>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                </div>
              </div>
              {!uploading && (
                <button onClick={() => { setFile(null); setPreview(''); setTitle(''); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q3 Product Strategy Review" />
            </div>

            {preview && (
              <div>
                <Label className="mb-2 block">Transcript Preview</Label>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
                  <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{preview}</pre>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {progress < 100 ? 'Uploading...' : 'Upload complete!'}
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full gradient-primary text-white"
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <>Upload & Process <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: CheckCircle2, title: 'Validated', desc: 'File type & size checked' },
          { icon: Sparkles, title: 'AI Parsed', desc: 'LLM extracts structure' },
          { icon: ArrowRight, title: 'Exportable', desc: 'PDF, DOCX, MD, JSON, CSV' },
        ].map((step) => (
          <Card key={step.title} className="flex items-center gap-3 p-4">
            <step.icon className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.desc}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
