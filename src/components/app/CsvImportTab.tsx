import { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CsvImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

interface CsvRow {
  title: string;
  product_type: string;
  image_url: string;
  description: string;
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

export function CsvImportTab({ onProductAdded, onClose }: CsvImportTabProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

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

        const headers = parsed[0].map((h) => h.toLowerCase().replace(/[\s-]/g, '_'));
        const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('name'));
        const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('category'));
        const imageIdx = headers.findIndex((h) => h.includes('image') || h.includes('img') || h.includes('photo'));
        const descIdx = headers.findIndex((h) => h.includes('desc'));

        if (titleIdx === -1) {
          setError('CSV must have a "title" or "name" column');
          return;
        }

        const csvRows: CsvRow[] = parsed.slice(1).map((row) => {
          const title = row[titleIdx] || '';
          const image_url = imageIdx >= 0 ? row[imageIdx] || '' : '';
          const product_type = typeIdx >= 0 ? row[typeIdx] || '' : '';
          const description = descIdx >= 0 ? row[descIdx] || '' : '';

          let valid = true;
          let rowError: string | undefined;

          if (!title) {
            valid = false;
            rowError = 'Missing title';
          } else if (image_url && !image_url.startsWith('http')) {
            valid = false;
            rowError = 'Invalid image URL';
          }

          return { title, product_type, image_url, description, valid, error: rowError };
        });

        setRows(csvRows);
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
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setIsImporting(true);
    try {
      const products = validRows.map((r) => ({
        user_id: user.id,
        title: r.title.substring(0, 200),
        product_type: r.product_type.substring(0, 100),
        description: r.description.substring(0, 500),
        image_url: r.image_url || 'https://placehold.co/400x400?text=No+Image',
      }));

      const { error: insertError } = await supabase.from('user_products').insert(products);
      if (insertError) throw new Error(insertError.message);

      toast.success(`${validRows.length} products imported!`);
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-5">
      {rows.length === 0 ? (
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
            <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop a CSV file or{' '}
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
            <p className="text-xs text-muted-foreground">
              Required column: <code className="bg-muted px-1 rounded">title</code>. Optional:{' '}
              <code className="bg-muted px-1 rounded">product_type</code>,{' '}
              <code className="bg-muted px-1 rounded">image_url</code>,{' '}
              <code className="bg-muted px-1 rounded">description</code>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          {/* Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file?.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setRows([]); setFile(null); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{validCount} valid</Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} errors</Badge>
              )}
            </div>
          </div>

          {/* Rows table */}
          <div className="max-h-[300px] overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium">Title</th>
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-left p-2 font-medium">Image</th>
                  <th className="text-left p-2 font-medium w-16">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, i) => (
                  <tr key={i} className={`border-t ${!row.valid ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 truncate max-w-[200px]">{row.title || '—'}</td>
                    <td className="p-2 truncate max-w-[120px]">{row.product_type || '—'}</td>
                    <td className="p-2 truncate max-w-[150px] text-xs text-muted-foreground">{row.image_url ? '✓' : '—'}</td>
                    <td className="p-2">
                      {row.valid ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <span className="text-xs text-destructive">{row.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && (
              <p className="p-2 text-xs text-muted-foreground text-center">
                Showing first 50 of {rows.length} rows
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
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
    </div>
  );
}
