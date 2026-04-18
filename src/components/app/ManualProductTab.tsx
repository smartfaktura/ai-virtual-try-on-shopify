import { useState, useCallback, useEffect, useRef } from 'react';
import { ImagePlus, Loader2, Sparkles, X, Pencil, Layers, ChevronDown, ChevronUp, Package, Plus, RotateCcw, ArrowRight, Camera, Check, FolderOpen, Droplets, Lightbulb, UploadCloud } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast, toastSophia } from '@/lib/brandedToast';

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
  back_image_url?: string | null;
  side_image_url?: string | null;
  packaging_image_url?: string | null;
  inside_image_url?: string | null;
  texture_image_url?: string | null;
  extra_image_urls?: string[];
  weight?: string | null;
  materials?: string | null;
  color?: string | null;
}

interface ManualProductTabProps {
  onProductAdded: () => void;
  onClose: () => void;
  editingProduct?: UserProduct | null;
  initialFiles?: File[];
}

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  productType: string;
  description: string;
  dimensions: string;
  isAnalyzing: boolean;
  manualEdits: { title: boolean; productType: boolean; description: boolean };
}

const QUICK_TYPES = [
  'Clothing', 'Footwear', 'Beauty', 'Skincare', 'Food & Drink',
  'Home Decor', 'Electronics', 'Jewelry', 'Accessories', 'Pet Supplies', 'Other',
];

const MAX_BATCH = 100;

export function ManualProductTab({ onProductAdded, onClose, editingProduct, initialFiles }: ManualProductTabProps) {
  const { user } = useAuth();
  // Single product mode state
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [singleImage, setSingleImage] = useState<{ file?: File; previewUrl: string } | null>(null);

  // Reference angles
  const [backImage, setBackImage] = useState<{ file?: File; previewUrl: string } | null>(null);
  const [sideImage, setSideImage] = useState<{ file?: File; previewUrl: string } | null>(null);
  const [packagingImage, setPackagingImage] = useState<{ file?: File; previewUrl: string } | null>(null);
  const [insideImage, setInsideImage] = useState<{ file?: File; previewUrl: string } | null>(null);
  const [textureImage, setTextureImage] = useState<{ file?: File; previewUrl: string } | null>(null);
  const [anglesOpen, setAnglesOpen] = useState(true);

  // Extra details
  const [weight, setWeight] = useState('');
  const [materials, setMaterials] = useState('');
  const [color, setColor] = useState('');
  
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const isMobile = useIsMobile();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const hasManualEdits = useRef({ title: false, productType: false, description: false });

  // Track all blob: URLs created via URL.createObjectURL so we can revoke them
  // and avoid memory leaks (esp. on large batch uploads).
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const createTrackedObjectUrl = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.add(url);
    return url;
  }, []);
  const revokeTrackedObjectUrl = useCallback((url?: string | null) => {
    if (!url || !url.startsWith('blob:')) return;
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  }, []);
  // Revoke everything on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current.clear();
    };
  }, []);

  // Batch mode state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const isBatchMode = batchItems.length > 1;

  // Category chips visibility
  const [expandedChips, setExpandedChips] = useState<Record<string, boolean>>({});
  const [singleChipsExpanded, setSingleChipsExpanded] = useState(false);

  // Edit mode
  const isEditing = !!editingProduct;

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setProductType(editingProduct.product_type);
      setDescription(editingProduct.description);
      setDimensions((editingProduct as any).dimensions || '');
      setSingleImage({ previewUrl: editingProduct.image_url });
      hasManualEdits.current = { title: true, productType: true, description: true };
      // Load reference angles
      if (editingProduct.back_image_url) setBackImage({ previewUrl: editingProduct.back_image_url });
      if (editingProduct.side_image_url) setSideImage({ previewUrl: editingProduct.side_image_url });
      if (editingProduct.packaging_image_url) setPackagingImage({ previewUrl: editingProduct.packaging_image_url });
      if (editingProduct.inside_image_url) setInsideImage({ previewUrl: editingProduct.inside_image_url });
      if (editingProduct.texture_image_url) setTextureImage({ previewUrl: editingProduct.texture_image_url });
      
      // Load extra fields
      if (editingProduct.weight) setWeight(editingProduct.weight);
      if (editingProduct.materials) setMaterials(editingProduct.materials);
      if (editingProduct.color) setColor(editingProduct.color);
      if (editingProduct.weight || editingProduct.materials || editingProduct.color) setMoreDetailsOpen(true);
    }
  }, [editingProduct]);

  // Consume initialFiles once when provided (e.g. from page-level drag overlay or empty-state drop)
  const consumedInitialRef = useRef(false);
  useEffect(() => {
    if (editingProduct) return;
    if (!initialFiles || initialFiles.length === 0) return;
    if (consumedInitialRef.current) return;
    consumedInitialRef.current = true;
    addFiles(initialFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles, editingProduct]);

  // AI analysis for a single image
  const analyzeImage = useCallback(async (imageDataUrl: string, target?: { batchId: string }) => {
    if (target) {
      setBatchItems(prev => prev.map(b => b.id === target.batchId ? { ...b, isAnalyzing: true } : b));
    } else {
      setIsAnalyzing(true);
    }
    try {
      const { data, error } = await supabase.functions.invoke('analyze-product-image', {
        body: { imageUrl: imageDataUrl },
      });
      if (error) throw error;
      if (data?.error) {
        console.warn('AI analysis returned error:', data.error);
        if (target) {
          setBatchItems(prev => prev.map(b => b.id === target.batchId ? { ...b, isAnalyzing: false } : b));
        }
        return;
      }
      if (data) {
        if (target) {
          setBatchItems(prev => prev.map(b => {
            if (b.id !== target.batchId) return b;
            return {
              ...b,
              isAnalyzing: false,
              title: !b.manualEdits.title && data.title ? data.title : b.title,
              productType: !b.manualEdits.productType && data.productType ? data.productType : b.productType,
              description: !b.manualEdits.description && data.description ? data.description : b.description,
            };
          }));
        } else {
          if (data.title && !hasManualEdits.current.title) setTitle(data.title);
          if (data.productType && !hasManualEdits.current.productType) setProductType(data.productType);
          if (data.description && !hasManualEdits.current.description) setDescription(data.description);
        }
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
      if (target) {
        setBatchItems(prev => prev.map(b => b.id === target.batchId ? { ...b, isAnalyzing: false } : b));
      }
    } finally {
      if (!target) setIsAnalyzing(false);
    }
  }, []);

  // Process files: 1 file = single mode, 2+ = batch mode
  const addFiles = useCallback((files: File[]) => {
    if (isEditing) return; // Edit mode only handles single image replacement

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

    if (validFiles.length === 0) return;

    // If we already have a single image or batch items, calculate remaining
    const currentCount = singleImage ? 1 + batchItems.length : batchItems.length;
    const remaining = MAX_BATCH - currentCount;
    const toAdd = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      toast.error(`Max ${MAX_BATCH} products at once`);
    }

    if (toAdd.length === 0) return;

    // If currently in single mode (1 image, no batch) and adding more files,
    // convert existing single image to batch item + add new ones
    if (singleImage && !isBatchMode && toAdd.length >= 1) {
      const existingBatchItem: BatchItem | null = singleImage.file ? {
        id: `existing-${Date.now()}`,
        file: singleImage.file,
        previewUrl: singleImage.previewUrl,
        title,
        productType,
        description,
        dimensions,
        isAnalyzing,
        manualEdits: { ...hasManualEdits.current },
      } : null;

      const newItems: BatchItem[] = toAdd.map((file, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: createTrackedObjectUrl(file),
        title: '',
        productType: '',
        description: '',
        dimensions: '',
        isAnalyzing: false,
        manualEdits: { title: false, productType: false, description: false },
      }));

      const allItems = existingBatchItem ? [existingBatchItem, ...newItems] : newItems;
      setBatchItems(allItems);
      setSingleImage(null);
      setTitle('');
      setProductType('');
      setDescription('');
      setDimensions('');
      hasManualEdits.current = { title: false, productType: false, description: false };

      // Run AI analysis for new items (concurrency limit of 3)
      runBatchAnalysis(newItems);
      return;
    }

    // If already in batch mode, add more items
    if (isBatchMode) {
      const newItems: BatchItem[] = toAdd.map((file, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl: createTrackedObjectUrl(file),
        title: '',
        productType: '',
        description: '',
        dimensions: '',
        isAnalyzing: false,
        manualEdits: { title: false, productType: false, description: false },
      }));
      setBatchItems(prev => [...prev, ...newItems]);
      runBatchAnalysis(newItems);
      return;
    }

    // Fresh upload: 1 file = single mode
    if (toAdd.length === 1 && !singleImage) {
      const file = toAdd[0];
      const previewUrl = createTrackedObjectUrl(file);
      setSingleImage({ file, previewUrl });
      // Read as data URL for AI analysis
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        analyzeImage(dataUrl);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Fresh upload: 2+ files = batch mode
    const newItems: BatchItem[] = toAdd.map((file, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      file,
      previewUrl: createTrackedObjectUrl(file),
      title: '',
      productType: '',
      description: '',
      dimensions: '',
      isAnalyzing: false,
      manualEdits: { title: false, productType: false, description: false },
    }));
    setBatchItems(newItems);
    runBatchAnalysis(newItems);
  }, [singleImage, batchItems.length, isBatchMode, title, productType, description, isAnalyzing, isEditing, analyzeImage]);

  // Run AI analysis with concurrency limit
  const runBatchAnalysis = useCallback((items: BatchItem[]) => {
    const queue = [...items];
    const concurrency = 3;
    let active = 0;

    const next = () => {
      while (active < concurrency && queue.length > 0) {
        const item = queue.shift()!;
        active++;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          analyzeImage(dataUrl, { batchId: item.id }).finally(() => {
            active--;
            next();
          });
        };
        reader.readAsDataURL(item.file);
      }
    };
    next();
  }, [analyzeImage]);

  // Handle single image replacement in edit mode
  const handleEditImageReplace = useCallback((files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image exceeds 10 MB');
      return;
    }
    const previewUrl = createTrackedObjectUrl(file);
    // Revoke any previous blob preview being replaced
    if (singleImage) revokeTrackedObjectUrl(singleImage.previewUrl);
    setSingleImage({ file, previewUrl });
    hasManualEdits.current = { title: false, productType: false, description: false };
    const reader = new FileReader();
    reader.onload = (e) => analyzeImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [analyzeImage, singleImage, createTrackedObjectUrl, revokeTrackedObjectUrl]);

  // Clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        if (isEditing) {
          handleEditImageReplace(imageFiles);
        } else {
          addFiles(imageFiles);
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [addFiles, handleEditImageReplace, isEditing]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) {
        if (isEditing) handleEditImageReplace(files);
        else addFiles(files);
      }
    },
    [addFiles, handleEditImageReplace, isEditing]
  );

  // Upload a single file to storage
  async function uploadFile(file: File): Promise<string> {
    if (!user) throw new Error('Not authenticated');
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/${timestamp}-${randomId}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-uploads')
      .upload(filePath, file, { contentType: file.type, cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage.from('product-uploads').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  // Upload reference angle if it has a file
  async function uploadRefImage(ref: { file?: File; previewUrl: string } | null): Promise<string | null> {
    if (!ref) return null;
    if (ref.file) return uploadFile(ref.file);
    return ref.previewUrl; // Already uploaded URL (edit mode)
  }

  // Submit: single product (new or edit)
  const handleSubmitSingle = async () => {
    if (!user || !singleImage || !title.trim()) {
      toast.error('Please provide a title and an image');
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl = singleImage.previewUrl;
      if (singleImage.file) {
        setUploadProgress({ current: 0, total: 1 });
        imageUrl = await uploadFile(singleImage.file);
        setUploadProgress({ current: 1, total: 1 });
      }

      // Upload reference angles
      const backUrl = await uploadRefImage(backImage);
      const sideUrl = await uploadRefImage(sideImage);
      const packUrl = await uploadRefImage(packagingImage);
      const insideUrl = await uploadRefImage(insideImage);
      const textureUrl = await uploadRefImage(textureImage);

      const productData: Record<string, unknown> = {
        title: title.trim().substring(0, 200),
        product_type: productType || '',
        description: description.trim().substring(0, 500),
        image_url: imageUrl,
        dimensions: dimensions.trim() || null,
        back_image_url: backUrl || null,
        side_image_url: sideUrl || null,
        packaging_image_url: packUrl || null,
        inside_image_url: insideUrl || null,
        texture_image_url: textureUrl || null,
        weight: weight.trim() || null,
        materials: materials.trim() || null,
        color: color.trim() || null,
        
      };

      if (isEditing && editingProduct) {
        const { error } = await supabase
          .from('user_products')
          .update(productData as any)
          .eq('id', editingProduct.id);
        if (error) throw new Error(error.message);
        toastSophia('Product updated!');
      } else {
        const { error } = await supabase
          .from('user_products')
          .insert({ ...productData, user_id: user.id } as any);
        if (error) throw new Error(error.message);
        toastSophia('Product added — ready for your first shoot!');
      }
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  // Submit: batch products
  const handleSubmitBatch = async () => {
    if (!user || batchItems.length === 0) return;
    const incomplete = batchItems.filter(b => !b.title.trim());
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} product(s) missing a title`);
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: batchItems.length });

    try {
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        setUploadProgress({ current: i, total: batchItems.length });
        const imageUrl = await uploadFile(item.file);

        const { error } = await supabase.from('user_products').insert({
          user_id: user.id,
          title: item.title.trim().substring(0, 200),
          product_type: item.productType || '',
          description: item.description.trim().substring(0, 500),
          image_url: imageUrl,
          dimensions: item.dimensions.trim() || null,
        } as any);
        if (error) throw new Error(error.message);
        setUploadProgress({ current: i + 1, total: batchItems.length });
      }
      toastSophia(`${batchItems.length} products added!`);
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add products');
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleSubmit = isBatchMode ? handleSubmitBatch : handleSubmitSingle;

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => {
      const removed = prev.find(b => b.id === id);
      if (removed) revokeTrackedObjectUrl(removed.previewUrl);
      const updated = prev.filter(b => b.id !== id);
      // If only 1 left, convert back to single mode
      if (updated.length === 1) {
        const item = updated[0];
        setSingleImage({ file: item.file, previewUrl: item.previewUrl });
        setTitle(item.title);
        setProductType(item.productType);
        setDescription(item.description);
        hasManualEdits.current = { ...item.manualEdits };
        return [];
      }
      return updated;
    });
  };

  const updateBatchItem = (id: string, field: 'title' | 'productType' | 'description' | 'dimensions', value: string) => {
    setBatchItems(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        [field]: value,
        manualEdits: field === 'dimensions' ? b.manualEdits : { ...b.manualEdits, [field]: true },
      };
    }));
  };

  const anyBatchAnalyzing = batchItems.some(b => b.isAnalyzing);
  const hasContent = isBatchMode ? batchItems.length > 0 : !!singleImage;

  // ── BATCH MODE UI ──
  if (isBatchMode) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
              {batchItems.length} product{batchItems.length !== 1 ? 's' : ''}
            </Badge>
            {anyBatchAnalyzing && (
              <span className="flex items-center gap-1 text-[11px] text-primary">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Analyzing…
              </span>
            )}
          </div>
          {batchItems.length < MAX_BATCH && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => document.getElementById('batch-add-more')?.click()}
            >
              <ImagePlus className="w-3.5 h-3.5" />
              Add more
            </Button>
          )}
          <input
            id="batch-add-more"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) addFiles(files);
              e.target.value = '';
            }}
          />
        </div>

        {/* Batch list */}
        <div
          className="flex flex-col gap-3 transition-all"
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {batchItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md"
            >
              <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={item.previewUrl}
                    alt={item.title || 'Product'}
                    className="w-full h-full object-cover"
                  />
                  {item.isAnalyzing && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        placeholder={item.isAnalyzing ? 'Analyzing…' : 'Product name *'}
                        value={item.title}
                        onChange={(e) => updateBatchItem(item.id, 'title', e.target.value)}
                        maxLength={200}
                        className={cn(
                          'h-8 text-xs',
                          item.isAnalyzing && !item.manualEdits.title && 'animate-pulse ring-1 ring-primary/30'
                        )}
                      />
                      <Input
                        placeholder={item.isAnalyzing ? 'Analyzing…' : 'Type (e.g. Shoes)'}
                        value={item.productType}
                        onChange={(e) => updateBatchItem(item.id, 'productType', e.target.value)}
                        maxLength={100}
                        className={cn(
                          'h-8 text-xs',
                          item.isAnalyzing && !item.manualEdits.productType && 'animate-pulse ring-1 ring-primary/30'
                        )}
                      />
                    </div>
                    <button
                      onClick={() => removeBatchItem(item.id)}
                      className="w-6 h-6 shrink-0 rounded-full bg-muted/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Quick type chips — collapsible */}
                  {!item.isAnalyzing && (
                    <>
                      {(!item.productType || expandedChips[item.id]) ? (
                        <div className="flex flex-wrap gap-1">
                          {QUICK_TYPES.map((t) => (
                            <Badge
                              key={t}
                              variant={item.productType === t ? 'default' : 'outline'}
                              className="cursor-pointer text-[10px] px-1.5 py-0 hover:bg-primary/10 transition-colors"
                              onClick={() => {
                                updateBatchItem(item.id, 'productType', item.productType === t ? '' : t);
                                if (item.productType !== t) setExpandedChips(prev => ({ ...prev, [item.id]: false }));
                              }}
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span
                          onClick={() => setExpandedChips(prev => ({ ...prev, [item.id]: true }))}
                          className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground cursor-pointer underline decoration-dotted underline-offset-2 transition-colors"
                        >
                          Change category
                        </span>
                      )}
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Textarea
                      placeholder={item.isAnalyzing ? 'Analyzing…' : 'Brief description…'}
                      value={item.description}
                      onChange={(e) => updateBatchItem(item.id, 'description', e.target.value)}
                      maxLength={500}
                      rows={2}
                      className={cn(
                        'resize-none min-h-0 text-xs',
                        item.isAnalyzing && !item.manualEdits.description && 'animate-pulse ring-1 ring-primary/30'
                      )}
                    />
                    <Input
                      placeholder="Dimensions (optional)"
                      value={item.dimensions}
                      onChange={(e) => updateBatchItem(item.id, 'dimensions', e.target.value)}
                      maxLength={100}
                      className="h-8 text-xs self-start"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {isUploading && uploadProgress.total > 0 && (
          <div className="space-y-1.5">
            <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground text-center">
              Adding {uploadProgress.current}/{uploadProgress.total} products…
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-background pb-1">
          <Button variant="ghost" onClick={onClose} disabled={isUploading} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || anyBatchAnalyzing || batchItems.some(b => !b.title.trim())}
            className="min-w-[120px] rounded-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Adding {uploadProgress.current}/{uploadProgress.total}…
              </>
            ) : (
              `Add ${batchItems.length} Products`
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ── SINGLE PRODUCT MODE UI ──
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Image Section */}
      <div className="rounded-2xl border bg-card p-3 sm:p-4 space-y-2">
        {singleImage && isAnalyzing && (
          <div className="flex items-center gap-1.5 text-[11px] text-primary">
            <Sparkles className="w-3 h-3 animate-pulse" />
            AI analyzing…
          </div>
        )}

        {!singleImage ? (
          <div className="space-y-4">
            {isMobile ? (
              <div className="flex flex-col items-center justify-center text-center rounded-2xl border bg-muted/20 px-5 py-8">
                <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center mb-4">
                  <UploadCloud className="w-5 h-5 text-foreground/70" />
                </div>
                <p className="text-base font-medium">Upload product photos</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Tap to choose from your phone</p>
                <Button
                  type="button"
                  onClick={() => document.getElementById('dropzone-file-input')?.click()}
                  className="w-full h-11 rounded-full"
                >
                  <UploadCloud className="w-4 h-4" />
                  Choose photos
                </Button>
                <p className="text-[11px] text-muted-foreground/70 mt-3">
                  JPG, PNG, WEBP · up to {MAX_BATCH} at once
                </p>
                <input
                  id="dropzone-file-input"
                  type="file"
                  accept="image/*"
                  multiple={!isEditing}
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      if (isEditing) handleEditImageReplace(files);
                      else addFiles(files);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            ) : (
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl transition-all duration-300 py-6 sm:py-8 cursor-pointer',
                  dragActive
                    ? 'bg-primary/8 border-2 border-primary scale-[1.02] shadow-lg shadow-primary/10'
                    : 'bg-muted/30 hover:bg-muted/50 border-2 border-dashed border-border hover:border-muted-foreground/30'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('dropzone-file-input')?.click()}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2.5 transition-all duration-300',
                  dragActive ? 'bg-primary/15 scale-110' : 'bg-muted'
                )}>
                  <ImagePlus className={cn(
                    'w-5 h-5 transition-colors duration-300',
                    dragActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Drop images, <span className="text-primary font-medium">browse</span>, or paste
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Layers className="w-3 h-3 text-muted-foreground/50" />
                  <p className="text-[11px] text-muted-foreground/60">
                    Each image creates a separate product · up to {MAX_BATCH} at once
                  </p>
                </div>
                <input
                  id="dropzone-file-input"
                  type="file"
                  accept="image/*"
                  multiple={!isEditing}
                  className="hidden"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      if (isEditing) handleEditImageReplace(files);
                      else addFiles(files);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            )}
          </div>

        ) : (
          /* Main image + reference angles — side-by-side on desktop */
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
            {/* Main image — labeled tile */}
            <div className="space-y-2 shrink-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Main photo
              </span>
              <div className="relative group w-[140px] h-[170px] sm:w-[180px] sm:h-[220px] rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center">
                <img
                  src={singleImage.previewUrl}
                  alt={title || 'Product preview'}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isEditing && (
                    <button
                      onClick={() => {
                        if (singleImage) revokeTrackedObjectUrl(singleImage.previewUrl);
                        setSingleImage(null);
                        setTitle('');
                        setProductType('');
                        setDescription('');
                        if (backImage) revokeTrackedObjectUrl(backImage.previewUrl);
                        if (sideImage) revokeTrackedObjectUrl(sideImage.previewUrl);
                        if (packagingImage) revokeTrackedObjectUrl(packagingImage.previewUrl);
                        if (insideImage) revokeTrackedObjectUrl(insideImage.previewUrl);
                        if (textureImage) revokeTrackedObjectUrl(textureImage.previewUrl);
                        setBackImage(null);
                        setSideImage(null);
                        setPackagingImage(null);
                        setInsideImage(null);
                        setTextureImage(null);
                        hasManualEdits.current = { title: false, productType: false, description: false };
                      }}
                      className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <label className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-muted cursor-pointer transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length) {
                          if (isEditing) handleEditImageReplace(files);
                          else {
                            const file = files[0];
                            if (singleImage) revokeTrackedObjectUrl(singleImage.previewUrl);
                            const previewUrl = createTrackedObjectUrl(file);
                            setSingleImage({ file, previewUrl });
                            const reader = new FileReader();
                            reader.onload = (ev) => analyzeImage(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Reference Angles — beside main image on desktop, stacked on mobile */}
            <div className="flex-1 min-w-0 w-full">
              <Collapsible open={anglesOpen} onOpenChange={setAnglesOpen}>
                <CollapsibleTrigger className="flex items-start gap-2 w-full group/trigger">
                  <div className="flex-1 text-left space-y-0.5">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Extra angles
                    </span>
                    <span className="block text-[11px] text-muted-foreground/70">
                      Improves AI accuracy
                    </span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/50 mt-1 transition-transform", anglesOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <div className="flex gap-2.5 flex-wrap">
                    {([
                      { label: 'Back view', shortLabel: 'Back', state: backImage, setter: setBackImage, Icon: RotateCcw },
                      { label: 'Side view', shortLabel: 'Side', state: sideImage, setter: setSideImage, Icon: ArrowRight },
                      { label: 'Inside', shortLabel: 'Inside', state: insideImage, setter: setInsideImage, Icon: FolderOpen },
                      { label: 'Packaging', shortLabel: 'Pack', state: packagingImage, setter: setPackagingImage, Icon: Package },
                      { label: 'Texture', shortLabel: 'Texture', state: textureImage, setter: setTextureImage, Icon: Droplets },
                    ] as const).map(({ label, shortLabel, state, setter, Icon }) => (
                      <div key={shortLabel} className="relative">
                        {state ? (
                          <HoverCard openDelay={200} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <div className="relative group/ref w-[88px] h-[88px] rounded-xl overflow-hidden border border-border bg-muted/20 cursor-pointer hover:shadow-md hover:shadow-primary/5 transition-shadow">
                                <img src={state.previewUrl} alt={label} className="w-full h-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                                  <span className="text-[11px] text-white font-medium">{label}</span>
                                </div>
                                <button
                                  onClick={(e) => { e.preventDefault(); setter(null); }}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover/ref:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="top" className="w-[200px] p-1.5">
                              <img src={state.previewUrl} alt={label} className="w-full rounded-lg object-contain" />
                              <p className="text-[10px] text-muted-foreground text-center mt-1">{label}</p>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-[88px] h-[88px] rounded-xl border border-dashed border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-all gap-1">
                            <Plus className="w-4 h-4 text-muted-foreground/40" />
                            <Icon className="w-4 h-4 text-muted-foreground/50" />
                            <span className="text-[11px] text-muted-foreground/60 font-medium leading-tight text-center">{label}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.type.startsWith('image/')) {
                                  if (state) revokeTrackedObjectUrl(state.previewUrl);
                                  setter({ file, previewUrl: createTrackedObjectUrl(file) });
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}
      </div>

      {/* Product Details — only after an image is uploaded */}
      {singleImage && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 pt-1 pb-1 border-b border-border/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Product details
            </span>
            {isAnalyzing && (
              <span className="flex items-center gap-1 text-[10px] text-primary">
                <Sparkles className="w-3 h-3 animate-pulse" />
                Auto-filling…
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="product-title" className="text-xs font-medium text-foreground">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-title"
                placeholder={isAnalyzing && !hasManualEdits.current.title ? "Analyzing…" : "e.g. Black Yoga Leggings"}
                value={title}
                onChange={(e) => { setTitle(e.target.value); hasManualEdits.current.title = true; }}
                maxLength={200}
                className={cn(
                  'transition-all duration-300',
                  isAnalyzing && !hasManualEdits.current.title && 'animate-pulse ring-1 ring-primary/30'
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="product-type" className="text-xs font-medium text-foreground">Product Type</Label>
              <Input
                id="product-type"
                placeholder={isAnalyzing && !hasManualEdits.current.productType ? "Analyzing…" : "e.g. Sneakers, Face Serum…"}
                value={productType}
                onChange={(e) => { setProductType(e.target.value); hasManualEdits.current.productType = true; }}
                maxLength={100}
                className={cn(
                  'transition-all duration-300',
                  isAnalyzing && !hasManualEdits.current.productType && 'animate-pulse ring-1 ring-primary/30'
                )}
              />
            </div>
          </div>

          {!(isAnalyzing && !hasManualEdits.current.productType) && (
            <>
              {(!productType || singleChipsExpanded) ? (
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TYPES.map((t) => (
                    <Badge
                      key={t}
                      variant={productType === t ? 'default' : 'outline'}
                      className="cursor-pointer text-[11px] px-2 py-0.5 hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        setProductType(productType === t ? '' : t);
                        hasManualEdits.current.productType = true;
                        if (productType !== t) setSingleChipsExpanded(false);
                      }}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span
                  onClick={() => setSingleChipsExpanded(true)}
                  className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground cursor-pointer underline decoration-dotted underline-offset-2 transition-colors"
                >
                  Change category
                </span>
              )}
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="product-desc" className="text-xs font-medium text-foreground">Description</Label>
              <Textarea
                id="product-desc"
                placeholder={isAnalyzing && !hasManualEdits.current.description ? "Analyzing…" : "Brief description…"}
                value={description}
                onChange={(e) => { setDescription(e.target.value); hasManualEdits.current.description = true; }}
                maxLength={500}
                rows={2}
                className={cn(
                  'resize-none min-h-0 transition-all duration-300',
                  isAnalyzing && !hasManualEdits.current.description && 'animate-pulse ring-1 ring-primary/30'
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="product-dimensions" className="text-xs font-medium text-foreground">
                Dimensions <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="product-dimensions"
                placeholder="e.g. 28 x 35 x 13 cm"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                maxLength={100}
              />
              <p className="text-[11px] text-muted-foreground/70 sm:hidden mt-1">
                Tip: Add real dimensions (e.g. 15×10cm) for realistic scaling in scenes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* More Details (optional, collapsible) — only after image uploaded */}
      {singleImage && (
        <Collapsible open={moreDetailsOpen} onOpenChange={setMoreDetailsOpen} className="rounded-2xl border bg-card p-4 sm:p-5 animate-fade-in">
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1">
            <Package className="w-3.5 h-3.5" />
            <span className="font-medium">More details</span>
            <span className="text-muted-foreground/60">(optional)</span>
            <ChevronDown className={cn('w-3 h-3 ml-auto transition-transform', moreDetailsOpen && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Weight</Label>
                <Input placeholder="e.g. 250g" value={weight} onChange={(e) => setWeight(e.target.value)} maxLength={50} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Color</Label>
                <Input placeholder="e.g. Matte Black" value={color} onChange={(e) => setColor(e.target.value)} maxLength={100} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-muted-foreground">Materials</Label>
                <Input placeholder="e.g. Italian leather, brass" value={materials} onChange={(e) => setMaterials(e.target.value)} maxLength={200} className="h-8 text-xs" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-1.5">
              Weight and materials help the AI generate more realistic product scenes.
            </p>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress.total > 0 && (
        <div className="space-y-1.5">
          <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground text-center">
            Uploading…
          </p>
        </div>
      )}

      {/* Footer — only shown when an image is present */}
      {singleImage && (
        <div className="flex justify-end gap-3 pt-2 pb-1 sm:static sticky bottom-0 bg-background sm:bg-transparent animate-fade-in">
          <Button variant="ghost" onClick={onClose} disabled={isUploading} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || isAnalyzing || !title.trim() || !singleImage}
            className="min-w-[100px] sm:min-w-[120px] rounded-xl"
          >
            {isUploading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{isEditing ? 'Saving…' : 'Uploading…'}</>
            ) : (
              isEditing ? 'Save Changes' : 'Add Product'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
