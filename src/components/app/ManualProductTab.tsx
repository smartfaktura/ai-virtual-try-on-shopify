import { useState, useCallback } from 'react';
import { Upload, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ManualProductTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

const PRODUCT_TYPES = [
  'T-Shirt', 'Hoodie', 'Dress', 'Jacket', 'Pants', 'Leggings', 'Shorts',
  'Sneakers', 'Boots', 'Sandals', 'Bag', 'Hat', 'Jewelry', 'Watch',
  'Serum', 'Cream', 'Lipstick', 'Foundation', 'Supplement', 'Candle',
  'Mug', 'Pillow', 'Lamp', 'Food', 'Beverage', 'Other',
];

export function ManualProductTab({ onProductAdded, onClose }: ManualProductTabProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!user || !file || !title.trim()) {
      toast.error('Please provide a title and image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to secure bucket
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/${timestamp}-${randomId}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-uploads')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      // Get signed URL for the private bucket
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('product-uploads')
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

      if (signedUrlError) throw new Error(signedUrlError.message);

      // Insert product record
      const { error: insertError } = await supabase.from('user_products').insert({
        user_id: user.id,
        title: title.trim().substring(0, 200),
        product_type: productType || '',
        description: description.trim().substring(0, 500),
        image_url: signedUrlData.signedUrl,
      });

      if (insertError) throw new Error(insertError.message);

      toast.success('Product added!');
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Dropzone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/40'
        } ${preview ? 'py-4' : 'min-h-[180px]'}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <ImagePlus className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop an image or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP — max 10 MB</p>
          </>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="product-title">Product Name *</Label>
          <Input
            id="product-title"
            placeholder="e.g. Black Yoga Leggings"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        <div>
          <Label htmlFor="product-type">Product Type</Label>
          <Select value={productType} onValueChange={setProductType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="product-desc">Description (optional)</Label>
          <Input
            id="product-desc"
            placeholder="Brief description…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={isUploading || !title.trim() || !file}
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading…
            </>
          ) : (
            'Add Product'
          )}
        </Button>
      </div>
    </div>
  );
}
