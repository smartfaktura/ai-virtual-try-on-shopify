import { useCallback, useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, ClipboardPaste } from 'lucide-react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import type { ScratchUpload } from '@/types';

interface UploadSourceCardProps {
  scratchUpload: ScratchUpload | null;
  onUpload: (upload: ScratchUpload) => void;
  onRemove: () => void;
  onUpdateProductInfo: (info: ScratchUpload['productInfo']) => void;
  isUploading?: boolean;
  variant?: 'product' | 'room';
  saveToLibrary?: boolean;
  onSaveToLibraryChange?: (checked: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];


function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function UploadSourceCard({
  scratchUpload, onUpload, onRemove, onUpdateProductInfo, isUploading = false, variant = 'product', saveToLibrary = false, onSaveToLibraryChange,
}: UploadSourceCardProps) {
  const isRoom = variant === 'room';
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a JPG, PNG, or WEBP image.';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB.';
    return null;
  };

  const analyzeProduct = useCallback(async (file: File, currentInfo: ScratchUpload['productInfo']) => {
    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageUrl: base64 }),
      });
      if (!resp.ok) throw new Error('Analysis failed');
      const data = await resp.json();
      onUpdateProductInfo({
        title: data.title || currentInfo.title,
        productType: data.productType || currentInfo.productType,
        description: data.description || currentInfo.description,
      });
    } catch {
      toast.error('AI analysis failed — fill in details manually');
    } finally {
      setIsAnalyzing(false);
    }
  }, [onUpdateProductInfo]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    const productInfo = { title: isRoom ? 'Uploaded Room' : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), productType: isRoom ? 'Room' : '', description: '' };
    onUpload({ file, previewUrl, productInfo });
    if (!isRoom) analyzeProduct(file, productInfo);
  }, [onUpload, analyzeProduct, isRoom]);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }, [handleFile]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); }, [handleFile]);

  // Clipboard paste support
  useEffect(() => {
    if (scratchUpload) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [scratchUpload, handleFile]);

  if (scratchUpload) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="aspect-square max-w-[200px] sm:max-w-xs rounded-lg overflow-hidden border border-border bg-card">
            <img src={scratchUpload.previewUrl} alt={isRoom ? "Uploaded room photo" : "Uploaded product"} className="w-full h-full object-contain" />
          </div>
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isRoom && (
          <div className="space-y-3">
            <h4 className="font-semibold">Product Details</h4>
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <Sparkles className="w-4 h-4 text-primary/60" />
                AI analyzing product…
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Add details to help the AI generate better images.</p>
                <div className="space-y-1.5">
                  <Label htmlFor="product-title">Product Title</Label>
                  <Input id="product-title" value={scratchUpload.productInfo.title} onChange={(e) => onUpdateProductInfo({ ...scratchUpload.productInfo, title: e.target.value })} placeholder="e.g., High-Waist Yoga Leggings" />
                </div>
                <div className="space-y-1.5">
                  <Label>Product Type</Label>
                  <Input
                    value={scratchUpload.productInfo.productType}
                    onChange={(e) => onUpdateProductInfo({ ...scratchUpload.productInfo, productType: e.target.value })}
                    placeholder="e.g. Scented Candle, Sneakers, Face Serum…"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="product-desc">Description (optional)</Label>
                  <Textarea id="product-desc" value={scratchUpload.productInfo.description} onChange={(e) => onUpdateProductInfo({ ...scratchUpload.productInfo, description: e.target.value })} placeholder="e.g., Black seamless leggings with high waistband" rows={3} />
                </div>
                {onSaveToLibraryChange && (
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer group">
                    <Checkbox
                      checked={saveToLibrary}
                      onCheckedChange={(checked) => onSaveToLibraryChange(!!checked)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium group-hover:text-foreground transition-colors">Save to My Products</span>
                      <p className="text-xs text-muted-foreground">Save this product to your library so you can reuse it across Visual Types without uploading again.</p>
                    </div>
                  </label>
                )}
              </>
            )}
          </div>
        )}

        {isUploading && (
          <Alert><AlertDescription>Uploading image to storage...</AlertDescription></Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted'
        }`}
      >
        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {dragOver ? <ImageIcon className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
          </div>
          <div>
            <p className="font-semibold">{dragOver ? 'Drop your image here' : 'Drag & drop, paste, or tap to upload'}</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP • Max 10MB</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-1">
              <ClipboardPaste className="w-3 h-3" />
              ⌘V / Ctrl+V to paste from clipboard
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={dragOver}>Choose File</Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="ml-2"><X className="w-4 h-4" /></button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
