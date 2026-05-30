import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ALL_CATEGORY_OPTIONS, getCategoryLabel } from '@/lib/productSpecFields';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from '@/lib/brandedToast';

type RowStatus = 'analyzing' | 'suggested' | 'confirmed' | 'failed';

interface BulkRow {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  status: RowStatus;
  error?: string;
}

interface BulkUploadReviewModalProps {
  open: boolean;
  files: File[];
  userId: string;
  onClose: () => void;
  onComplete: (productIds: string[]) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Read failed'));
    r.readAsDataURL(file);
  });
}

async function analyzeOne(file: File): Promise<{ title: string; productType: string; description: string; category: string } | null> {
  try {
    const base64 = await fileToBase64(file);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ imageUrl: base64 }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data?.kind === 'not_product') return null;
    return {
      title: data.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      productType: data.productType || '',
      description: data.description || '',
      category: data.userCategory || data.category || 'other',
    };
  } catch {
    return null;
  }
}

async function runWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

export function BulkUploadReviewModal({ open, files, userId, onClose, onComplete }: BulkUploadReviewModalProps) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { upload: uploadFile } = useFileUpload();

  // Initialize rows + run analysis
  useEffect(() => {
    if (!open || files.length === 0) return;
    const initial: BulkRow[] = files.map(f => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      title: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      category: '',
      status: 'analyzing',
    }));
    setRows(initial);

    runWithConcurrency(initial, 3, async (row) => {
      const result = await analyzeOne(row.file);
      setRows(prev => prev.map(r => {
        if (r.id !== row.id) return r;
        if (!result) return { ...r, status: 'failed', error: 'AI could not analyze — pick category manually' };
        return { ...r, title: result.title || r.title, category: result.category, status: 'suggested' };
      }));
    });

    return () => {
      initial.forEach(r => URL.revokeObjectURL(r.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateRow = useCallback((id: string, patch: Partial<BulkRow>) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows(prev => {
      const target = prev.find(r => r.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const allReady = rows.length > 0 && rows.every(r => r.status !== 'analyzing' && r.category && r.title.trim().length > 0);

  const handleConfirmAll = useCallback(async () => {
    if (!allReady) return;
    setIsSaving(true);
    try {
      const created: string[] = [];
      await runWithConcurrency(rows, 3, async (row) => {
        const url = await uploadFile(row.file);
        if (!url) return;
        const { data, error } = await supabase.from('user_products').insert({
          user_id: userId,
          title: row.title.trim(),
          product_type: getCategoryLabel(row.category),
          description: '',
          image_url: url,
          analysis_json: { category: row.category, userCategory: row.category },
        }).select('id').single();
        if (!error && data?.id) created.push(data.id);
      });
      if (created.length === 0) {
        toast.error('No products were saved');
        setIsSaving(false);
        return;
      }
      if (created.length < rows.length) {
        toast.warning(`Saved ${created.length} of ${rows.length} products`);
      } else {
        toast.success(`Saved ${created.length} products to your library`);
      }
      onComplete(created);
    } catch {
      toast.error('Failed to save products');
    } finally {
      setIsSaving(false);
    }
  }, [allReady, rows, uploadFile, userId, onComplete]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isSaving) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Review {rows.length} uploads
          </DialogTitle>
          <DialogDescription>
            AI suggested a category for each. Confirm or change, then save them all to your library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1 -mr-1">
          {rows.map(row => (
            <div key={row.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
              <img src={row.previewUrl} alt={row.title} className="w-14 h-14 rounded-md object-cover bg-muted flex-shrink-0" />
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-2">
                <Input
                  value={row.title}
                  onChange={e => updateRow(row.id, { title: e.target.value })}
                  placeholder="Product title"
                  className="h-9 text-sm"
                />
                <div className="flex items-center gap-2">
                  {row.status === 'analyzing' ? (
                    <div className="h-9 flex-1 flex items-center justify-center gap-2 rounded-md border border-border text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing…
                    </div>
                  ) : (
                    <Select value={row.category} onValueChange={(v) => updateRow(row.id, { category: v, status: 'confirmed' })}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Pick category…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_CATEGORY_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {row.status === 'confirmed' && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                  {row.status === 'failed' && <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={isSaving}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                aria-label="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleConfirmAll} disabled={!allReady || isSaving}>
            {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>) : `Confirm all (${rows.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
