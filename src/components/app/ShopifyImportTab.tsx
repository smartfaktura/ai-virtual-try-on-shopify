import { useState, useCallback, useMemo, useRef } from 'react';
import { ShoppingBag, Upload, X, AlertCircle, Loader2, Check, ChevronDown, FileSpreadsheet, Info, ImageOff, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { gtmProductUploaded } from '@/lib/gtm';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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

type FilterMode = 'all' | 'valid' | 'missing-image';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedHandles, setSelectedHandles] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

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
            grouped[handle] = { title: '', product_type: '', description: '', images: [] };
          }

          const entry = grouped[handle];
          const rowTitle = titleIdx >= 0 ? (row[titleIdx] || '') : '';
          if (!entry.title && rowTitle) entry.title = rowTitle;
          const rowType = typeIdx >= 0 ? (row[typeIdx] || '') : '';
          if (!entry.product_type && rowType) entry.product_type = rowType;
          const rowBody = bodyIdx >= 0 ? (row[bodyIdx] || '') : '';
          if (!entry.description && rowBody) entry.description = rowBody;
          const imgUrl = imgSrcIdx >= 0 ? (row[imgSrcIdx] || '') : '';
          const imgPos = imgPosIdx >= 0 ? parseInt(row[imgPosIdx] || '0', 10) : 0;
          if (imgUrl && imgUrl.startsWith('http')) {
            entry.images.push({ url: imgUrl, position: imgPos || 999 });
          }
        }

        const shopifyProducts: ShopifyProduct[] = Object.entries(grouped).map(([handle, data]) => {
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
            rowError = 'No image';
          }

          return { handle, title, product_type: data.product_type, description: stripHtml(data.description), image_url, valid, error: rowError };
        });

        setProducts(shopifyProducts);
        // Pre-select all valid products that have images
        const initialSelected = new Set(
          shopifyProducts.filter((p) => p.valid && p.image_url).map((p) => p.handle)
        );
        setSelectedHandles(initialSelected);
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

  // Filter logic
  const filteredProducts = useMemo(() => {
    switch (filterMode) {
      case 'valid':
        return products.filter((p) => p.valid && p.image_url);
      case 'missing-image':
        return products.filter((p) => !p.image_url);
      default:
        return products;
    }
  }, [products, filterMode]);

  const selectableProducts = useMemo(
    () => products.filter((p) => p.valid),
    [products]
  );

  const selectedCount = selectedHandles.size;

  const isAllFilteredSelected = useMemo(() => {
    const selectableInView = filteredProducts.filter((p) => p.valid);
    return selectableInView.length > 0 && selectableInView.every((p) => selectedHandles.has(p.handle));
  }, [filteredProducts, selectedHandles]);

  const toggleSelectAll = () => {
    const selectableInView = filteredProducts.filter((p) => p.valid);
    if (isAllFilteredSelected) {
      const next = new Set(selectedHandles);
      selectableInView.forEach((p) => next.delete(p.handle));
      setSelectedHandles(next);
    } else {
      const next = new Set(selectedHandles);
      selectableInView.forEach((p) => next.add(p.handle));
      setSelectedHandles(next);
    }
  };

  const toggleProduct = (handle: string) => {
    const next = new Set(selectedHandles);
    if (next.has(handle)) {
      next.delete(handle);
    } else {
      next.add(handle);
    }
    setSelectedHandles(next);
  };

  const handleImportSelected = async () => {
    if (!user) return;
    const toImport = products.filter((p) => selectedHandles.has(p.handle) && p.valid);
    if (toImport.length === 0) {
      toast.error('No products selected');
      return;
    }

    setIsImporting(true);
    try {
      const rows = toImport.map((p) => ({
        user_id: user.id,
        title: p.title.substring(0, 200),
        product_type: p.product_type.substring(0, 100),
        description: p.description.substring(0, 500),
        image_url: p.image_url,
      }));

      const { error: insertError } = await supabase.from('user_products').insert(rows);
      if (insertError) throw new Error(insertError.message);

      toast.success(`${toImport.length} product${toImport.length !== 1 ? 's' : ''} imported!`);
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = products.filter((p) => p.valid).length;
  const missingImageCount = products.filter((p) => !p.image_url).length;
  const invalidCount = products.filter((p) => !p.valid).length;

  const filterChips: { key: FilterMode; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: products.length },
    { key: 'valid', label: 'Ready', count: validCount },
    ...(missingImageCount > 0 ? [{ key: 'missing-image' as FilterMode, label: 'No image', count: missingImageCount }] : []),
  ];

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
          {/* Enhanced Dropzone */}
          <label
            htmlFor="shopify-csv-input"
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-200 cursor-pointer min-h-[200px] ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              id="shopify-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />

            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mb-4 transition-all duration-200 ${
              dragActive
                ? 'bg-primary/10 scale-110'
                : 'bg-muted group-hover:bg-primary/5'
            }`}>
              <Upload className={`w-6 h-6 transition-all duration-200 ${
                dragActive
                  ? 'text-primary animate-bounce'
                  : 'text-muted-foreground group-hover:text-primary/70'
              }`} />
            </div>

            <p className="text-sm font-medium text-foreground mb-1">
              {dragActive ? 'Drop your CSV here' : 'Drop your Shopify CSV here'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click anywhere to browse files
            </p>

            <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
              dragActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground'
            }`}>
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Choose .csv file
            </div>

            <p className="text-[10px] text-muted-foreground mt-4">
              Titles, types, and primary images mapped automatically
            </p>
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={onClose} >Cancel</Button>
          </div>
        </>
      ) : (
        <>
          {/* Review header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[160px]">{file?.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setProducts([]); setFile(null); setSelectedHandles(new Set()); setFilterMode('all'); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">{products.length} found</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="text-[11px]">{invalidCount} invalid</Badge>
              )}
            </div>
          </div>

          {/* Filter chips + select all */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFilterMode(chip.key)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    filterMode === chip.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {chip.label}
                  <span className={`${filterMode === chip.key ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>
                    {chip.count}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isAllFilteredSelected ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {/* Product review table */}
          <div className="max-h-[320px] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <Checkbox
                      checked={isAllFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5"
                    />
                  </th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground w-12">Img</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                  <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 100).map((p, i) => {
                  const isSelectable = p.valid;
                  const isSelected = selectedHandles.has(p.handle);

                  return (
                    <tr
                      key={p.handle}
                      onClick={() => isSelectable && toggleProduct(p.handle)}
                      className={`border-t border-border/50 transition-colors ${
                        !isSelectable
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary/5 hover:bg-primary/10 cursor-pointer'
                            : 'hover:bg-muted/30 cursor-pointer'
                      } ${!isSelectable ? '' : i % 2 === 1 && !isSelected ? 'bg-muted/10' : ''}`}
                    >
                      <td className="px-3 py-1.5">
                        <Checkbox
                          checked={isSelected}
                          disabled={!isSelectable}
                          onCheckedChange={() => isSelectable && toggleProduct(p.handle)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        {p.image_url ? (
                          <img src={getOptimizedUrl(p.image_url, { quality: 60 })} alt="" className="w-8 h-8 rounded object-cover bg-muted" loading="lazy" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <ImageOff className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1.5 truncate max-w-[180px] text-sm">{p.title || '—'}</td>
                      <td className="px-2 py-1.5 truncate max-w-[100px] text-sm text-muted-foreground hidden sm:table-cell">{p.product_type || '—'}</td>
                      <td className="px-2 py-1.5">
                        {p.valid && p.image_url ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-0">Ready</Badge>
                        ) : p.valid && !p.image_url ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-0">No img</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-0">{p.error}</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length > 100 && (
              <p className="px-3 py-2 text-[11px] text-muted-foreground text-center bg-muted/20">
                Showing first 100 of {filteredProducts.length} products
              </p>
            )}
            {filteredProducts.length === 0 && (
              <p className="px-3 py-8 text-sm text-muted-foreground text-center">
                No products match this filter
              </p>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-muted-foreground">
              {selectedCount} of {selectableProducts.length} selected
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} >Cancel</Button>
              <Button onClick={handleImportSelected} disabled={isImporting || selectedCount === 0} >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5" />
                    Import {selectedCount} Product{selectedCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] text-muted-foreground text-center pt-2">
        Direct Shopify sync is coming soon. For now, use the CSV export method above.
      </p>
    </div>
  );
}
