import { useState, useCallback, useEffect, useRef } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProductImageGallery } from './ProductImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  product_type: string;
  image_url: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ManualProductTabProps {
  onProductAdded: () => void;
  onClose: () => void;
  editingProduct?: UserProduct | null;
}

interface ImageItem {
  id: string;
  src: string;
  file?: File;
  isPrimary: boolean;
  dbId?: string;
  storagePath?: string;
}

const PRODUCT_TYPES = [
  'T-Shirt', 'Hoodie', 'Dress', 'Jacket', 'Pants', 'Leggings', 'Shorts',
  'Sneakers', 'Boots', 'Sandals', 'Bag', 'Hat', 'Jewelry', 'Watch',
  'Serum', 'Cream', 'Lipstick', 'Foundation', 'Supplement', 'Candle',
  'Mug', 'Pillow', 'Lamp', 'Food', 'Beverage', 'Other',
];

const MAX_IMAGES = 6;

export function ManualProductTab({ onProductAdded, onClose, editingProduct }: ManualProductTabProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const initialImageIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setProductType(editingProduct.product_type);
      setDescription(editingProduct.description);
      loadExistingImages(editingProduct.id, editingProduct.image_url);
    }
  }, [editingProduct]);

  async function loadExistingImages(productId: string, fallbackImageUrl: string) {
    setIsLoadingImages(true);
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('position', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const items: ImageItem[] = data.map((row) => ({
          id: `existing-${row.id}`,
          src: row.image_url,
          isPrimary: row.position === 0,
          dbId: row.id,
          storagePath: row.storage_path,
        }));
        if (!items.some(i => i.isPrimary) && items.length > 0) {
          items[0].isPrimary = true;
        }
        setImages(items);
        initialImageIdsRef.current = items.map(i => i.dbId!);
      } else if (fallbackImageUrl) {
        setImages([{
          id: `fallback-${Date.now()}`,
          src: fallbackImageUrl,
          isPrimary: true,
        }]);
        initialImageIdsRef.current = [];
      }
    } catch (err) {
      console.error('Failed to load product images:', err);
      if (fallbackImageUrl) {
        setImages([{
          id: `fallback-${Date.now()}`,
          src: fallbackImageUrl,
          isPrimary: true,
        }]);
      }
      initialImageIdsRef.current = [];
    } finally {
      setIsLoadingImages(false);
    }
  }

  const addFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 10 MB`);
        return false;
      }
      return true;
    });

    const remaining = MAX_IMAGES - images.length;
    const toAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      toast.error(`Max ${MAX_IMAGES} images allowed`);
    }

    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newItem: ImageItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          src: e.target?.result as string,
          file,
          isPrimary: false,
        };
        setImages(prev => {
          const updated = [...prev, newItem];
          if (updated.filter(i => i.isPrimary).length === 0 && updated.length > 0) {
            updated[0].isPrimary = true;
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) addFiles(files);
    },
    [addFiles]
  );

  const handleSetPrimary = useCallback((id: string) => {
    setImages(prev => prev.map(img => ({ ...img, isPrimary: img.id === id })));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      if (updated.length > 0 && !updated.some(i => i.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  }, []);

  async function uploadNewImage(img: ImageItem): Promise<{ signedUrl: string; storagePath: string }> {
    if (!user || !img.file) throw new Error('No file to upload');

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = img.file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/${timestamp}-${randomId}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-uploads')
      .upload(filePath, img.file, {
        contentType: img.file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('product-uploads')
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

    if (signedUrlError) throw new Error(signedUrlError.message);

    return { signedUrl: signedUrlData.signedUrl, storagePath: uploadData.path };
  }

  const handleSubmitNew = async () => {
    if (!user || images.length === 0 || !title.trim()) {
      toast.error('Please provide a title and at least one image');
      return;
    }

    setIsUploading(true);
    try {
      const primaryImage = images.find(i => i.isPrimary) || images[0];
      let primarySignedUrl = '';
      const uploadedImages: { signedUrl: string; storagePath: string; position: number }[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.file) continue;
        const { signedUrl, storagePath } = await uploadNewImage(img);
        const position = img.isPrimary ? 0 : i + 1;
        uploadedImages.push({ signedUrl, storagePath, position });
        if (img.id === primaryImage.id) primarySignedUrl = signedUrl;
      }

      const { data: productData, error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title: title.trim().substring(0, 200),
          product_type: productType || '',
          description: description.trim().substring(0, 500),
          image_url: primarySignedUrl,
        })
        .select('id')
        .single();

      if (insertError) throw new Error(insertError.message);

      const imageRows = uploadedImages.map(img => ({
        product_id: productData.id,
        user_id: user.id,
        image_url: img.signedUrl,
        storage_path: img.storagePath,
        position: img.position,
      }));

      const { error: imagesError } = await supabase.from('product_images').insert(imageRows);
      if (imagesError) console.error('Failed to insert product images:', imagesError);

      toast.success('Product added!');
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!user || !editingProduct || images.length === 0 || !title.trim()) {
      toast.error('Please provide a title and at least one image');
      return;
    }

    setIsUploading(true);
    try {
      const currentDbIds = images.filter(i => i.dbId).map(i => i.dbId!);
      const removedDbIds = initialImageIdsRef.current.filter(id => !currentDbIds.includes(id));

      if (removedDbIds.length > 0) {
        const { data: removedRows } = await supabase
          .from('product_images')
          .select('storage_path')
          .in('id', removedDbIds);

        await supabase.from('product_images').delete().in('id', removedDbIds);

        if (removedRows) {
          const pathsToDelete = removedRows
            .map(r => r.storage_path)
            .filter(Boolean);
          if (pathsToDelete.length > 0) {
            await supabase.storage.from('product-uploads').remove(pathsToDelete);
          }
        }
      }

      const newImages = images.filter(i => i.file);
      const uploadedNew: { imageItem: ImageItem; signedUrl: string; storagePath: string }[] = [];

      for (const img of newImages) {
        const { signedUrl, storagePath } = await uploadNewImage(img);
        uploadedNew.push({ imageItem: img, signedUrl, storagePath });
      }

      let primarySignedUrl = '';
      const allFinalImages: { dbId?: string; signedUrl: string; storagePath: string; position: number; isNew: boolean }[] = [];

      images.forEach((img, idx) => {
        const position = img.isPrimary ? 0 : idx + 1;
        const uploaded = uploadedNew.find(u => u.imageItem.id === img.id);

        if (uploaded) {
          allFinalImages.push({ signedUrl: uploaded.signedUrl, storagePath: uploaded.storagePath, position, isNew: true });
          if (img.isPrimary) primarySignedUrl = uploaded.signedUrl;
        } else {
          allFinalImages.push({ dbId: img.dbId, signedUrl: img.src, storagePath: img.storagePath || '', position, isNew: false });
          if (img.isPrimary) primarySignedUrl = img.src;
        }
      });

      const { error: updateError } = await supabase
        .from('user_products')
        .update({
          title: title.trim().substring(0, 200),
          product_type: productType || '',
          description: description.trim().substring(0, 500),
          image_url: primarySignedUrl,
        })
        .eq('id', editingProduct.id);

      if (updateError) throw new Error(updateError.message);

      for (const img of allFinalImages.filter(i => !i.isNew && i.dbId)) {
        await supabase
          .from('product_images')
          .update({ position: img.position })
          .eq('id', img.dbId!);
      }

      const newRows = allFinalImages
        .filter(i => i.isNew)
        .map(i => ({
          product_id: editingProduct.id,
          user_id: user.id,
          image_url: i.signedUrl,
          storage_path: i.storagePath,
          position: i.position,
        }));

      if (newRows.length > 0) {
        const { error: insertImagesError } = await supabase.from('product_images').insert(newRows);
        if (insertImagesError) console.error('Failed to insert new images:', insertImagesError);
      }

      toast.success('Product updated!');
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = editingProduct ? handleSubmitEdit : handleSubmitNew;
  const isEditing = !!editingProduct;

  return (
    <div className="space-y-6">
      {/* ── Image Section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product Images</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click the star to set the cover image
            </p>
          </div>
          {images.length > 0 && (
            <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">
              {images.length}/{MAX_IMAGES}
            </Badge>
          )}
        </div>

        {isLoadingImages ? (
          <div className="flex items-center justify-center min-h-[120px] rounded-xl bg-muted/40">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading images…
            </div>
          </div>
        ) : images.length === 0 ? (
          <div
            className={`relative flex flex-col items-center justify-center rounded-xl p-10 transition-all duration-200 ${
              dragActive
                ? 'bg-primary/5 border-2 border-primary'
                : 'bg-muted/40 hover:bg-muted/60'
            } min-h-[140px] cursor-pointer`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.getElementById('dropzone-file-input');
              if (input) input.click();
            }}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <ImagePlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Drag & drop or{' '}
              <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              PNG, JPG, WebP — max 10 MB · up to {MAX_IMAGES}
            </p>
            <input
              id="dropzone-file-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) addFiles(files);
                e.target.value = '';
              }}
            />
          </div>
        ) : (
          <div
            className={`rounded-xl p-3 transition-all duration-200 ${
              dragActive ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <ProductImageGallery
              images={images}
              onSetPrimary={handleSetPrimary}
              onRemove={handleRemove}
              onAddFiles={addFiles}
              maxImages={MAX_IMAGES}
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* ── Product Details ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Product Details</h3>

        <div className="space-y-1.5">
          <Label htmlFor="product-title" className="text-sm font-medium">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-title"
            placeholder="e.g. Black Yoga Leggings"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            This name will appear in your generations
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product-type" className="text-sm font-medium">
            Product Type
          </Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="product-desc" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="product-desc"
            placeholder="Brief description of your product…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="ghost" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isUploading || isLoadingImages || !title.trim() || images.length === 0}
          className="min-w-[120px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Saving…' : 'Uploading…'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Add Product'
          )}
        </Button>
      </div>
    </div>
  );
}
