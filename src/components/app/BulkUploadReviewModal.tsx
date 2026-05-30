import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, X } from 'lucide-react';
import { getCategoryLabel } from '@/lib/productSpecFields';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from '@/lib/brandedToast';

type RowStatus = 'suggested' | 'confirmed' | 'failed';

interface PreAnalyzedItem {
  file: File;
  previewUrl: string;
  title: string;
  suggestedCategory: string;
}

interface BulkRow {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: string;
  isSuggested: boolean; // true while user hasn't manually changed AI suggestion
  status: RowStatus;
}

interface BulkUploadReviewModalProps {
  open: boolean;
  items: PreAnalyzedItem[]; // pre-analyzed on the grid
  userId: string;
  onClose: () => void;
  onComplete: (productIds: string[]) => void;
}

/** Grouped category picker — presentation only; stored values unchanged. */
const CATEGORY_GROUPS: Array<{ label: string; items: Array<{ value: string; label: string }> }> = [
  {
    label: 'Apparel',
    items: [
      { value: 'dresses', label: 'Dress' },
      { value: 'garments', label: 'Garment' },
      { value: 'hoodies', label: 'Hoodie' },
      { value: 'jackets', label: 'Jacket' },
      { value: 'jeans', label: 'Jeans' },
      { value: 'trousers', label: 'Trousers' },
      { value: 'activewear', label: 'Activewear' },
      { value: 'swimwear', label: 'Swimwear' },
      { value: 'lingerie', label: 'Lingerie' },
      { value: 'kidswear', label: 'Kidswear' },
    ],
  },
  {
    label: 'Footwear',
    items: [
      { value: 'sneakers', label: 'Sneakers' },
      { value: 'shoes', label: 'Shoes' },
      { value: 'boots', label: 'Boots' },
      { value: 'high-heels', label: 'Heels' },
    ],
  },
  {
    label: 'Bags & Accessories',
    items: [
      { value: 'bags-accessories', label: 'Bag' },
      { value: 'backpacks', label: 'Backpack' },
      { value: 'wallets-cardholders', label: 'Wallet' },
      { value: 'belts', label: 'Belt' },
      { value: 'scarves', label: 'Scarf' },
    ],
  },
  {
    label: 'Headwear',
    items: [
      { value: 'caps', label: 'Cap' },
      { value: 'hats', label: 'Hat' },
      { value: 'beanies', label: 'Beanie' },
    ],
  },
  {
    label: 'Jewellery & Watches',
    items: [
      { value: 'watches', label: 'Watch' },
      { value: 'jewellery-necklaces', label: 'Necklace' },
      { value: 'jewellery-rings', label: 'Ring' },
      { value: 'jewellery-bracelets', label: 'Bracelet' },
      { value: 'jewellery-earrings', label: 'Earring' },
    ],
  },
  {
    label: 'Eyewear',
    items: [{ value: 'eyewear', label: 'Eyewear' }],
  },
  {
    label: 'Beauty & Fragrance',
    items: [
      { value: 'fragrance', label: 'Fragrance' },
      { value: 'beauty-skincare', label: 'Skincare' },
      { value: 'makeup-lipsticks', label: 'Makeup' },
    ],
  },
  {
    label: 'Food & Beverage',
    items: [
      { value: 'food', label: 'Food' },
      { value: 'beverages', label: 'Beverage' },
    ],
  },
  {
    label: 'Home & Tech',
    items: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'home-decor', label: 'Home Décor' },
      { value: 'tech-devices', label: 'Tech Device' },
    ],
  },
  {
    label: 'Wellness & Pets',
    items: [
      { value: 'supplements-wellness', label: 'Supplement' },
      { value: 'pet-accessories', label: 'Pet Accessory' },
    ],
  },
  {
    label: 'Other',
    items: [{ value: 'other', label: 'Other' }],
  },
];

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

export function BulkUploadReviewModal({ open, items, userId, onClose, onComplete }: BulkUploadReviewModalProps) {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { upload: uploadFile } = useFileUpload();

  // Initialize rows from pre-analyzed items
  useEffect(() => {
    if (!open || items.length === 0) return;
    const initial: BulkRow[] = items.map((it, i) => {
      const hasSuggestion = !!it.suggestedCategory;
      return {
        id: `${it.file.name}-${it.file.size}-${i}`,
        file: it.file,
        previewUrl: it.previewUrl,
        title: it.title,
        category: it.suggestedCategory || '',
        isSuggested: hasSuggestion,
        status: hasSuggestion ? 'suggested' : 'failed',
      };
    });
    setRows(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const updateCategory = useCallback((id: string, category: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, category, isSuggested: false, status: 'confirmed' } : r));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  const allReady = rows.length > 0 && rows.every(r => r.category && r.title.trim().length > 0);

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
        toast.success(`Saved ${created.length} ${created.length === 1 ? 'product' : 'products'} to your library`);
      }
      onComplete(created);
    } catch {
      toast.error('Failed to save products');
    } finally {
      setIsSaving(false);
    }
  }, [allReady, rows, uploadFile, userId, onComplete]);

  const categoryOptions = useMemo(() => CATEGORY_GROUPS, []);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isSaving) onClose(); }}>
      <DialogContent className="max-w-xl p-5 sm:p-6 gap-4">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-base font-medium">Review uploads</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Confirm the category we picked, or change it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
          {rows.map(row => (
            <div
              key={row.id}
              className="relative flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card/40"
            >
              <img
                src={row.previewUrl}
                alt=""
                className="w-16 h-16 rounded-md object-cover bg-muted flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <Select value={row.category} onValueChange={(v) => updateCategory(row.id, v)}>
                  <SelectTrigger className="h-9 text-sm flex-1 min-w-0">
                    <SelectValue placeholder="Pick category…" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {categoryOptions.map(group => (
                      <SelectGroup key={group.label}>
                        <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {group.label}
                        </SelectLabel>
                        {group.items.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {row.isSuggested && row.status === 'suggested' && (
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">Suggested</Badge>
                )}
                {row.status === 'failed' && (
                  <Badge variant="destructive" className="text-[10px] flex-shrink-0">Pick one</Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={isSaving}
                className="absolute top-1.5 right-1.5 p-1 rounded-md text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleConfirmAll} disabled={!allReady || isSaving} className="flex-1 sm:flex-none">
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
            ) : (
              `Save ${rows.length} ${rows.length === 1 ? 'product' : 'products'}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
