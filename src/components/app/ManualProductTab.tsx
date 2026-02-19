import { useState, useCallback, useEffect, useRef } from 'react';
import { ImagePlus, Loader2, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ProductImageGallery } from './ProductImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const QUICK_TYPES = [
  'Clothing', 'Footwear', 'Beauty', 'Skincare', 'Food & Drink',
  'Home Decor', 'Electronics', 'Jewelry', 'Accessories', 'Pet Supplies',
];

const MAX_IMAGES = 6;

export function ManualProductTab({ onProductAdded, onClose, editingProduct }: ManualProductTabProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const initialImageIdsRef = useRef<string[]>([]);
  const hasManualEdits = useRef({ title: false, productType: false, description: false });

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setProductType(editingProduct.product_type);
      setDescription(editingProduct.description);
      setDimensions((editingProduct as any).dimensions || '');
      loadExistingImages(editingProduct.id, editingProduct.image_url);
      hasManualEdits.current = { title: true, productType: true, description: true };
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

  const analyzeImage = useCallback(async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product-image', {
        body: { imageUrl: imageDataUrl },
      });
      if (error) throw error;
      if (data) {
        if (data.title && !hasManualEdits.current.title) setTitle(data.title);
        if (data.productType && !hasManualEdits.current.productType) setProductType(data.productType);
        if (data.description && !hasManualEdits.current.description) setDescription(data.description);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

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

    const isFirstImage = images.length === 0 && toAdd.length > 0;

    toAdd.forEach((file, fileIdx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newItem: ImageItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          src: dataUrl,
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

        // Trigger AI analysis on the first image uploaded
        if (isFirstImage && fileIdx === 0) {
          analyzeImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images.length, analyzeImage]);

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

  const handleReorder = useCallback((reordered: ImageItem[]) => {
    setImages(reordered);
  }, []);

  async function uploadNewImage(img: ImageItem): Promise<{ publicUrl: string; storagePath: string }> {
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

    const { data: publicUrlData } = supabase.storage
      .from('product-uploads')
      .getPublicUrl(uploadData.path);

    return { publicUrl: publicUrlData.publicUrl, storagePath: uploadData.path };
  }

  const handleSubmitNew = async () => {
    if (!user || images.length === 0 || !title.trim()) {
      toast.error('Please provide a title and at least one image');
      return;
    }

    setIsUploading(true);
    const filesToUpload = images.filter(i => i.file);
    setUploadProgress({ current: 0, total: filesToUpload.length });

    try {
      const primaryImage = images.find(i => i.isPrimary) || images[0];
      let primaryUrl = '';
      const uploadedImages: { publicUrl: string; storagePath: string; position: number; imgId: string }[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.file) continue;
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        const { publicUrl, storagePath } = await uploadNewImage(img);
        const position = img.isPrimary ? 0 : i + 1;
        uploadedImages.push({ publicUrl, storagePath, position, imgId: img.id });
        if (img.id === primaryImage.id) primaryUrl = publicUrl;
      }

      const { data: productData, error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title: title.trim().substring(0, 200),
          product_type: productType || '',
          description: description.trim().substring(0, 500),
          image_url: primaryUrl,
          dimensions: dimensions.trim() || null,
        } as any)
        .select('id')
        .single();

      if (insertError) throw new Error(insertError.message);

      const imageRows = uploadedImages.map(img => ({
        product_id: productData.id,
        user_id: user.id,
        image_url: img.publicUrl,
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
      setUploadProgress({ current: 0, total: 0 });
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
      const uploadedNew: { imageItem: ImageItem; publicUrl: string; storagePath: string }[] = [];
      setUploadProgress({ current: 0, total: newImages.length });

      for (const img of newImages) {
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        const { publicUrl, storagePath } = await uploadNewImage(img);
        uploadedNew.push({ imageItem: img, publicUrl, storagePath });
      }

      let primaryUrl = '';
      const allFinalImages: { dbId?: string; imageUrl: string; storagePath: string; position: number; isNew: boolean }[] = [];

      images.forEach((img, idx) => {
        const position = img.isPrimary ? 0 : idx + 1;
        const uploaded = uploadedNew.find(u => u.imageItem.id === img.id);

        if (uploaded) {
          allFinalImages.push({ imageUrl: uploaded.publicUrl, storagePath: uploaded.storagePath, position, isNew: true });
          if (img.isPrimary) primaryUrl = uploaded.publicUrl;
        } else {
          allFinalImages.push({ dbId: img.dbId, imageUrl: img.src, storagePath: img.storagePath || '', position, isNew: false });
          if (img.isPrimary) primaryUrl = img.src;
        }
      });

      const { error: updateError } = await supabase
        .from('user_products')
        .update({
          title: title.trim().substring(0, 200),
          product_type: productType || '',
          description: description.trim().substring(0, 500),
          image_url: primaryUrl,
          dimensions: dimensions.trim() || null,
        } as any)
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
          image_url: i.imageUrl,
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
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleSubmit = editingProduct ? handleSubmitEdit : handleSubmitNew;
  const isEditing = !!editingProduct;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ── Image Section ── */}
      <div className="space-y-2">
        {images.length > 0 && (
          <div className="flex items-center justify-between">
            {isAnalyzing && (
              <div className="flex items-center gap-1.5 text-[11px] text-primary">
                <Sparkles className="w-3 h-3 animate-pulse" />
                AI analyzing…
              </div>
            )}
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 ml-auto">
              {images.length}/{MAX_IMAGES}
            </Badge>
          </div>
        )}

        {isLoadingImages ? (
          <div className="flex items-center justify-center min-h-[80px] rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading images…
            </div>
          </div>
        ) : images.length === 0 ? (
          <div
            className={`relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 py-7 sm:py-10 ${
              dragActive
                ? 'bg-primary/5 border-2 border-primary'
                : 'bg-muted/30 hover:bg-muted/50 border border-dashed border-border'
            } cursor-pointer`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => {
              const input = document.getElementById('dropzone-file-input');
              if (input) input.click();
            }}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
              <ImagePlus className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Drop images or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              PNG, JPG, WebP · max 10 MB · up to {MAX_IMAGES}
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
            className={`rounded-xl p-2 sm:p-3 transition-all duration-200 ${
              dragActive ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/20'
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
              onReorder={handleReorder}
              maxImages={MAX_IMAGES}
              disabled={isUploading}
            />
          </div>
        )}

        {/* Pro Tip - hidden on mobile */}
        {images.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-1">
            <Info className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              The <span className="text-primary font-medium">cover</span> image is used as the primary AI reference · drag to reorder
            </p>
          </div>
        )}
      </div>

      {/* ── Product Details ── */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="product-title" className="text-xs font-medium">
            Product Name <span className="text-destructive">*</span>
          </Label>
          {isAnalyzing && !hasManualEdits.current.title ? (
            <Skeleton className="h-9 w-full rounded-md" />
          ) : (
            <Input
              id="product-title"
              placeholder="e.g. Black Yoga Leggings"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                hasManualEdits.current.title = true;
              }}
              maxLength={200}
            />
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-type" className="text-xs font-medium">
            Product Type
          </Label>
          {isAnalyzing && !hasManualEdits.current.productType ? (
            <Skeleton className="h-9 w-full rounded-md" />
          ) : (
            <div className="space-y-2">
              <Input
                id="product-type"
                placeholder="e.g. Scented Candle, Sneakers, Face Serum…"
                value={productType}
                onChange={(e) => {
                  setProductType(e.target.value);
                  hasManualEdits.current.productType = true;
                }}
                maxLength={100}
              />
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TYPES.map((t) => (
                  <Badge
                    key={t}
                    variant={productType === t ? 'default' : 'outline'}
                    className="cursor-pointer text-[11px] px-2 py-0.5 hover:bg-primary/10 transition-colors"
                    onClick={() => {
                      setProductType(productType === t ? '' : t);
                      hasManualEdits.current.productType = true;
                    }}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-desc" className="text-xs font-medium">
            Description
          </Label>
          {isAnalyzing && !hasManualEdits.current.description ? (
            <Skeleton className="h-[52px] w-full rounded-md" />
          ) : (
            <Textarea
              id="product-desc"
              placeholder="Brief description…"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                hasManualEdits.current.description = true;
              }}
              maxLength={500}
              rows={2}
              className="resize-none"
            />
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="product-dimensions" className="text-xs font-medium">
            Dimensions <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="product-dimensions"
            placeholder="e.g. 28 x 35 x 13 cm"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            maxLength={100}
          />
        </div>
      </div>

      {/* ── Upload Progress ── */}
      {isUploading && uploadProgress.total > 0 && (
        <div className="space-y-1.5">
          <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground text-center">
            Uploading {uploadProgress.current}/{uploadProgress.total} images…
          </p>
        </div>
      )}

      {/* ── Footer Actions ── */}
      <div className="flex justify-end gap-3 pt-3 sm:pt-6 sticky bottom-0 bg-background pb-1">
        <Button variant="ghost" onClick={onClose} disabled={isUploading} className="rounded-xl">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isUploading || isLoadingImages || isAnalyzing || !title.trim() || images.length === 0}
          className="min-w-[100px] sm:min-w-[120px] rounded-xl"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              {uploadProgress.total > 0
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}…`
                : isEditing ? 'Saving…' : 'Uploading…'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Add Product'
          )}
        </Button>
      </div>
    </div>
  );
}
