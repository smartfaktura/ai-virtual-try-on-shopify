import { useState, useCallback } from 'react';
import { ShoppingBag, Upload, X, AlertCircle, Loader2, Check, ChevronDown, FileSpreadsheet, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ShopifyImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

interface ShopifyProduct {
  handle: string;
  title: string;
  product_type: string;
  description: string;
  image_url: string;
  valid: boolean;
  error?: string;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim());
        if (row.some((c) => c.length > 0)) rows.push(row);
        row = [];
        current = '';
        if (char === '\r') i++;
      } else {
        current += char;
      }
    }
  }

  row.push(current.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);

  return rows;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim().substring(0, 500);
}

export function ShopifyImportTab({ onProductAdded, onClose }: ShopifyImportTabProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);

  const processFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    setFile(f);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);

        if (parsed.length < 2) {
          setError('CSV must have a header row and at least one data row');
          return;
        }

        const headers = parsed[0].map((h) => h.toLowerCase().trim());
        const handleIdx = headers.indexOf('handle');
        const titleIdx = headers.indexOf('title');
        const typeIdx = headers.indexOf('type');
        const bodyIdx = headers.findIndex((h) => h.startsWith('body'));
        const imgSrcIdx = headers.indexOf('image src');
        const imgPosIdx = headers.indexOf('image position');

        if (handleIdx === -1) {
          setError('This doesn\'t look like a Shopify export — missing "Handle" column');
          return;
        }

        // Group rows by Handle
        const grouped: Record<string, {
          title: string;
          product_type: string;
          description: string;
          images: { url: string; position: number }[];
        }> = {};

        for (let i = 1; i < parsed.length; i++) {
          const row = parsed[i];
          const handle = row[handleIdx] || '';
          if (!handle) continue;

          if (!grouped[handle]) {
            grouped[handle] = {
              title: '',
              product_type: '',
              description: '',
              images: [],
            };
          }

          const entry = grouped[handle];

          // Title comes from first row that has it
          const rowTitle = titleIdx >= 0 ? (row[titleIdx] || '') : '';
          if (!entry.title && rowTitle) entry.title = rowTitle;

          // Type from first row
          const rowType = typeIdx >= 0 ? (row[typeIdx] || '') : '';
          if (!entry.product_type && rowType) entry.product_type = rowType;

          // Body from first row
          const rowBody = bodyIdx >= 0 ? (row[bodyIdx] || '') : '';
          if (!entry.description && rowBody) entry.description = rowBody;

          // Collect images
          const imgUrl = imgSrcIdx >= 0 ? (row[imgSrcIdx] || '') : '';
          const imgPos = imgPosIdx >= 0 ? parseInt(row[imgPosIdx] || '0', 10) : 0;
          if (imgUrl && imgUrl.startsWith('http')) {
            entry.images.push({ url: imgUrl, position: imgPos || 999 });
          }
        }

        // Convert to products array
        const shopifyProducts: ShopifyProduct[] = Object.entries(grouped).map(([handle, data]) => {
          // Pick image with position 1, or first available
          const sortedImages = [...data.images].sort((a, b) => a.position - b.position);
          const primaryImage = sortedImages.find((img) => img.position === 1) || sortedImages[0];

          const title = data.title || handle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const image_url = primaryImage?.url || '';

          let valid = true;
          let rowError: string | undefined;

          if (!title) {
            valid = false;
            rowError = 'Missing title';
          } else if (!image_url) {
            valid = false;
            rowError = 'No image found';
          }

          return {
            handle,
            title,
            product_type: data.product_type,
            description: stripHtml(data.description),
            image_url,
            valid,
            error: rowError,
          };
        });

        setProducts(shopifyProducts);
        setGuideOpen(false);
      } catch {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleImportAll = async () => {
    if (!user) return;
    const validProducts = products.filter((p) => p.valid);
    if (validProducts.length === 0) {
      toast.error('No valid products to import');
      return;
    }

    setIsImporting(true);
    try {
      const rows = validProducts.map((p) => ({
        user_id: user.id,
        title: p.title.substring(0, 200),
        product_type: p.product_type.substring(0, 100),
        description: p.description.substring(0, 500),
        image_url: p.image_url,
      }));

      const { error: insertError } = await supabase.from('user_products').insert(rows);
      if (insertError) throw new Error(insertError.message);

      toast.success(`${validProducts.length} products imported from Shopify export!`);
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = products.filter((p) => p.valid).length;
  const invalidCount = products.filter((p) => !p.valid).length;

  return (
    <div className="space-y-5">
      {/* Export Guide */}
      <Collapsible open={guideOpen} onOpenChange={setGuideOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left group">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium flex-1">How to export from Shopify</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
            <div className="flex gap-3 items-start">
              <Badge variant="secondary" className="shrink-0 w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">1</Badge>
              <p className="text-sm text-muted-foreground">
                Go to your <span className="font-medium text-foreground">Shopify Admin → Products</span>
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <Badge variant="secondary" className="shrink-0 w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">2</Badge>
              <p className="text-sm text-muted-foreground">
                Click <span className="font-medium text-foreground">Export</span> → select <span className="font-medium text-foreground">"All products"</span> → choose <span className="font-medium text-foreground">"CSV for Excel, Numbers"</span>
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <Badge variant="secondary" className="shrink-0 w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold">3</Badge>
              <p className="text-sm text-muted-foreground">
                Upload the exported <span className="font-medium text-foreground">.csv file</span> below
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {products.length === 0 ? (
        <>
          {/* Dropzone */}
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors min-h-[160px] ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <ShoppingBag className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop your Shopify CSV export or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />
              </label>
            </p>
            <p className="text-[11px] text-muted-foreground">
              We'll map titles, types, and primary images automatically
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          </div>
        </>
      ) : (
        <>
          {/* Preview header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file?.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setProducts([]); setFile(null); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{validCount} products</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} skipped</Badge>
              )}
            </div>
          </div>

          {/* Preview table */}
          <div className="max-h-[300px] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-12">Img</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 100).map((p, i) => (
                  <tr key={p.handle} className={`border-t border-border/50 ${!p.valid ? 'bg-destructive/5' : i % 2 === 1 ? 'bg-muted/15' : ''}`}>
                    <td className="px-3 py-1.5">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover bg-muted" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-1.5 truncate max-w-[200px] text-sm">{p.title || '—'}</td>
                    <td className="px-3 py-1.5 truncate max-w-[120px] text-sm text-muted-foreground">{p.product_type || '—'}</td>
                    <td className="px-3 py-1.5">
                      {p.valid ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <span className="text-[11px] text-destructive">{p.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length > 100 && (
              <p className="px-3 py-2 text-[11px] text-muted-foreground text-center bg-muted/20">
                Showing first 100 of {products.length} products
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button onClick={handleImportAll} disabled={isImporting || validCount === 0}>
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {validCount} Product{validCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Subtle note about direct sync */}
      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Direct Shopify sync is coming soon. For now, use the CSV export method above.
      </p>
    </div>
  );
}
