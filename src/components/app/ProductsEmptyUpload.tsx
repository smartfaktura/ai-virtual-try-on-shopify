import { useCallback, useRef, useState } from 'react';
import { UploadCloud, Clipboard, Globe, FileSpreadsheet, ShoppingBag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EmptyUploadMethod = 'manual' | 'paste' | 'store' | 'csv' | 'shopify';

interface ProductsEmptyUploadProps {
  onFilesSelected: (files: File[]) => void;
  onMethodSelect: (method: EmptyUploadMethod) => void;
}

const METHODS: { id: EmptyUploadMethod; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'paste', label: 'Paste image', sub: 'Cmd/Ctrl + V from clipboard', icon: Clipboard },
  { id: 'store', label: 'Product URL', sub: 'Import from any product page', icon: Globe },
  { id: 'csv', label: 'CSV import', sub: 'Bulk-add from a spreadsheet', icon: FileSpreadsheet },
  { id: 'shopify', label: 'Shopify import', sub: 'Sync your Shopify catalog', icon: ShoppingBag },
];

export function ProductsEmptyUpload({ onFilesSelected, onMethodSelect }: ProductsEmptyUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length) onFilesSelected(files);
  }, [onFilesSelected]);

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Add your first product</h2>
        <p className="text-sm text-muted-foreground">
          Upload images, paste a link, or import in bulk. Each image becomes a product you can reuse across all Visual Types.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        {/* Primary drop zone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            'group relative flex flex-col items-center justify-center text-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 transition-all min-h-[260px]',
            'hover:bg-muted/40 hover:border-foreground/30',
            dragActive && 'border-primary bg-primary/5',
          )}
        >
          <div className={cn(
            'w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4 transition-transform',
            dragActive && 'scale-110',
          )}>
            <UploadCloud className="w-5 h-5 text-foreground/70" />
          </div>
          <p className="text-sm font-medium">Drag & drop product images</p>
          <p className="text-xs text-muted-foreground mt-1">
            or <span className="text-foreground underline underline-offset-2">browse files</span>
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-4">
            PNG, JPG, WEBP · multiple files supported · each image creates a product
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) onFilesSelected(files);
              e.target.value = '';
            }}
          />
        </button>

        {/* Secondary methods */}
        <div className="flex flex-col">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">Or import from</p>
          <div className="rounded-xl border bg-background/50 divide-y overflow-hidden">
            {METHODS.map(({ id, label, sub, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onMethodSelect(id)}
                className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-muted/60 active:bg-muted transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-4 h-4 text-foreground/70 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-3 px-1">
            Tip: clean background and even lighting give the best results.
          </p>
        </div>
      </div>
    </div>
  );
}
