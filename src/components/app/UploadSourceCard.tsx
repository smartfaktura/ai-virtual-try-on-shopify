import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import type { ScratchUpload } from '@/types';

interface UploadSourceCardProps {
  scratchUpload: ScratchUpload | null;
  onUpload: (upload: ScratchUpload) => void;
  onRemove: () => void;
  onUpdateProductInfo: (info: ScratchUpload['productInfo']) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const productTypeOptions = [
  'Leggings', 'Hoodie', 'T-Shirt', 'Sports Bra', 'Jacket', 'Tank Top',
  'Joggers', 'Shorts', 'Dress', 'Sweater', 'Other',
];

export function UploadSourceCard({
  scratchUpload, onUpload, onRemove, onUpdateProductInfo, isUploading = false,
}: UploadSourceCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Please upload a JPG, PNG, or WEBP image.';
    if (file.size > MAX_FILE_SIZE) return 'File size must be under 10MB.';
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    const previewUrl = URL.createObjectURL(file);
    onUpload({
      file, previewUrl,
      productInfo: { title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), productType: '', description: '' },
    });
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }, [handleFile]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); }, [handleFile]);

  if (scratchUpload) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="aspect-square max-w-[200px] sm:max-w-xs rounded-lg overflow-hidden border border-border bg-card">
            <img src={scratchUpload.previewUrl} alt="Uploaded product" className="w-full h-full object-contain" />
          </div>
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Product Details</h4>
          <p className="text-sm text-muted-foreground">Add details to help the AI generate better images.</p>
          <div className="space-y-1.5">
            <Label htmlFor="product-title">Product Title</Label>
            <Input id="product-title" value={scratchUpload.productInfo.title} onChange={(e) => onUpdateProductInfo({ ...scratchUpload.productInfo, title: e.target.value })} placeholder="e.g., High-Waist Yoga Leggings" />
          </div>
          <div className="space-y-1.5">
            <Label>Product Type</Label>
            <Select value={scratchUpload.productInfo.productType} onValueChange={(val) => onUpdateProductInfo({ ...scratchUpload.productInfo, productType: val })}>
              <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
              <SelectContent>
                {productTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-desc">Description (optional)</Label>
            <Textarea id="product-desc" value={scratchUpload.productInfo.description} onChange={(e) => onUpdateProductInfo({ ...scratchUpload.productInfo, description: e.target.value })} placeholder="e.g., Black seamless leggings with high waistband" rows={3} />
          </div>
        </div>

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
            <p className="font-semibold">{dragOver ? 'Drop your image here' : 'Drag & drop or tap to upload'}</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP • Max 10MB</p>
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
