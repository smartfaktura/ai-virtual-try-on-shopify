import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import {
  Search, Upload, X, Sparkles, Layers, ZoomIn, RotateCcw,
  ArrowLeft, ArrowRight, Maximize, ImageIcon, Check, Plus, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { useQuery } from '@tanstack/react-query';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useGeneratePerspectives } from '@/hooks/useGeneratePerspectives';
import { convertImageToBase64 } from '@/lib/imageUtils';
import type { Tables } from '@/integrations/supabase/types';

type UserProduct = Tables<'user_products'>;

// ── Variation type definitions ──────────────────────────────────────────

interface ReferenceUploadConfig {
  prompt: string;
  recommended: boolean;
}

interface VariationType {
  id: string;
  label: string;
  instruction: string;
  category: string;
  referenceUpload: ReferenceUploadConfig | null;
}

const FALLBACK_VARIATIONS: VariationType[] = [
  { id: 'closeup', label: 'Close-up / Macro', instruction: 'Extreme close-up macro detail shot...', category: 'detail', referenceUpload: null },
  { id: 'back', label: 'Back Angle', instruction: 'Rear view...', category: 'angle', referenceUpload: { prompt: 'Upload a back view of your product for best results (optional)', recommended: true } },
  { id: 'left', label: 'Left Side', instruction: 'Left side profile...', category: 'angle', referenceUpload: { prompt: 'Upload a left side view for better accuracy (optional)', recommended: false } },
  { id: 'right', label: 'Right Side', instruction: 'Right side profile...', category: 'angle', referenceUpload: { prompt: 'Upload a right side view for better accuracy (optional)', recommended: false } },
  { id: 'wide', label: 'Wide / Environment', instruction: 'Pulled-back contextual shot...', category: 'context', referenceUpload: null },
];

const VARIATION_ICONS: Record<string, typeof ZoomIn> = {
  'Close-up / Macro': ZoomIn,
  'Back Angle': RotateCcw,
  'Left Side': ArrowLeft,
  'Right Side': ArrowRight,
  'Wide / Environment': Maximize,
};

const ASPECT_RATIOS = ['1:1', '3:4', '4:5', '9:16'] as const;

export default function Perspectives() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredits();
  const { upload, isUploading } = useFileUpload();

  // ── State ──────────────────────────────────────────────────────────────
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedVariations, setSelectedVariations] = useState<Set<number>>(new Set());
  const [selectedRatios, setSelectedRatios] = useState<Set<string>>(new Set(['1:1']));
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [productSearch, setProductSearch] = useState('');
  const [referenceImages, setReferenceImages] = useState<Record<number, string>>({});
  const [uploadingRefIndex, setUploadingRefIndex] = useState<number | null>(null);

  // Direct upload (not from product library)
  const [directUploadUrl, setDirectUploadUrl] = useState<string | null>(
    searchParams.get('source') || null
  );

  // ── Fetch workflow config from DB ─────────────────────────────────────
  const { data: workflow } = useQuery({
    queryKey: ['workflow-perspectives'],
    queryFn: async () => {
      const { data } = await supabase
        .from('workflows')
        .select('*')
        .eq('name', 'Product Perspectives')
        .single();
      return data;
    },
  });

  const variations: VariationType[] = useMemo(() => {
    if (!workflow?.generation_config) return FALLBACK_VARIATIONS;
    const config = workflow.generation_config as Record<string, unknown>;
    const strategy = config.variation_strategy as { variations: VariationType[] } | undefined;
    if (!strategy?.variations) return FALLBACK_VARIATIONS;
    return strategy.variations.map((v, i) => ({ ...v, id: `var-${i}` }));
  }, [workflow]);

  // ── Fetch user products ───────────────────────────────────────────────
  const { data: products = [] } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []) as UserProduct[];
    },
    enabled: !!user,
  });

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ── Hook ──────────────────────────────────────────────────────────────
  const { generate, isGenerating, progress } = useGeneratePerspectives({
    onComplete: () => {
      refreshCredits();
      toast.success('Perspectives queued! Check your library for results.');
    },
  });

  // ── Derived ───────────────────────────────────────────────────────────
  const sourceCount = directUploadUrl ? 1 : selectedProductIds.size;
  const perImageCost = quality === 'high' ? 8 : 4;
  const totalImages = sourceCount * selectedVariations.size * selectedRatios.size;
  const totalCost = totalImages * perImageCost;
  const canGenerate = sourceCount > 0 && selectedVariations.size > 0 && selectedRatios.size > 0 && !isGenerating;

  // ── Handlers ──────────────────────────────────────────────────────────
  const toggleVariation = (index: number) => {
    const next = new Set(selectedVariations);
    if (next.has(index)) {
      next.delete(index);
      // Remove reference image if deselected
      const newRefs = { ...referenceImages };
      delete newRefs[index];
      setReferenceImages(newRefs);
    } else {
      next.add(index);
    }
    setSelectedVariations(next);
  };

  const toggleRatio = (ratio: string) => {
    const next = new Set(selectedRatios);
    if (next.has(ratio) && next.size > 1) next.delete(ratio);
    else next.add(ratio);
    setSelectedRatios(next);
  };

  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < 10) next.add(id);
    setSelectedProductIds(next);
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) {
      setDirectUploadUrl(url);
      setSelectedProductIds(new Set()); // Clear product selection when using direct upload
    }
  };

  const handleReferenceUpload = async (variationIndex: number, file: File) => {
    setUploadingRefIndex(variationIndex);
    const url = await upload(file);
    if (url) {
      setReferenceImages(prev => ({ ...prev, [variationIndex]: url }));
    }
    setUploadingRefIndex(null);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (totalCost > credits) {
      toast.error(`Not enough credits. Need ${totalCost}, have ${credits}.`);
      return;
    }

    const selectedProducts = directUploadUrl
      ? [{ id: 'direct', image_url: directUploadUrl, title: 'Uploaded Image' }]
      : products.filter(p => selectedProductIds.has(p.id));

    const selectedVarList = Array.from(selectedVariations).map(i => ({
      ...variations[i],
      referenceImageUrl: referenceImages[i] || null,
    }));

    await generate({
      products: selectedProducts.map(p => ({
        id: p.id,
        imageUrl: p.image_url,
        title: p.title,
      })),
      variations: selectedVarList,
      ratios: Array.from(selectedRatios),
      quality,
    });
  };

  return (
    <div className="min-h-screen">
      <SEOHead title="Product Perspectives" description="Generate angle and detail variations of your product images." />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Product Perspectives</h1>
              <p className="text-sm text-muted-foreground">
                Generate close-ups, back views, side angles, and wide shots for a complete visual set.
              </p>
            </div>
          </div>
        </div>

        <LowCreditsBanner />

        {/* Step 1: Source Selection */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
            Select Products
          </h2>

          {/* Direct upload option */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload new image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleDirectUpload} disabled={isUploading} />
            </label>
            {isUploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </div>

          {/* Direct upload preview */}
          {directUploadUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <img src={directUploadUrl} alt="Uploaded" className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Uploaded Image</p>
                <p className="text-xs text-muted-foreground">Direct upload</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDirectUploadUrl(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Product library picker */}
          {!directUploadUrl && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={selectedProductIds.size > 0 ? 'default' : 'secondary'}>
                  {selectedProductIds.size} selected
                </Badge>
                <span className="text-xs text-muted-foreground">(max 10)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-1">
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.has(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="absolute top-1.5 left-1.5 z-10 bg-background/90 rounded shadow-sm p-0.5">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(product.id)} />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-muted">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{product.product_type}</p>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No products found. <button className="text-primary underline" onClick={() => navigate('/app/products/new')}>Add one</button></p>
              )}
            </div>
          )}
        </section>

        {/* Step 2: Choose Angles */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
            Choose Perspectives
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variations.map((v, i) => {
              const isSelected = selectedVariations.has(i);
              const Icon = VARIATION_ICONS[v.label] || ImageIcon;
              const hasRefUpload = v.referenceUpload && isSelected;
              const showRefUpload = hasRefUpload && v.referenceUpload!.recommended;

              return (
                <div key={v.id} className="space-y-2">
                  <div
                    onClick={() => toggleVariation(i)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleVariation(i)} />
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{v.instruction.slice(0, 80)}…</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>

                  {/* Conditional reference upload */}
                  {showRefUpload && (
                    <div className="ml-12 p-3 rounded-lg border border-dashed border-border bg-muted/30 animate-in slide-in-from-top-2 duration-200">
                      {referenceImages[i] ? (
                        <div className="flex items-center gap-3">
                          <img src={referenceImages[i]} alt="Reference" className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">Reference uploaded</p>
                            <p className="text-xs text-muted-foreground">This will improve accuracy</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            const newRefs = { ...referenceImages };
                            delete newRefs[i];
                            setReferenceImages(newRefs);
                          }}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer">
                          {uploadingRefIndex === i ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          ) : (
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">{v.referenceUpload!.prompt}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleReferenceUpload(i, file);
                            }}
                            disabled={uploadingRefIndex === i}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Non-recommended reference upload (show toggle) */}
                  {hasRefUpload && !v.referenceUpload!.recommended && (
                    <div className="ml-12">
                      {referenceImages[i] ? (
                        <div className="p-3 rounded-lg border border-dashed border-border bg-muted/30 flex items-center gap-3">
                          <img src={referenceImages[i]} alt="Reference" className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">Reference uploaded</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            const newRefs = { ...referenceImages };
                            delete newRefs[i];
                            setReferenceImages(newRefs);
                          }}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Plus className="w-3 h-3" />
                          <span>Add reference image (optional)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleReferenceUpload(i, file);
                            }}
                            disabled={uploadingRefIndex === i}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Aspect Ratios */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
            Aspect Ratios
          </h2>

          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                onClick={() => toggleRatio(ratio)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedRatios.has(ratio)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </section>

        {/* Step 4: Quality */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">4</span>
            Quality
          </h2>

          <div className="flex gap-3">
            {(['standard', 'high'] as const).map(q => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  quality === q
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {q === 'standard' ? `Standard (${4} cr/img)` : `High (${8} cr/img)`}
              </button>
            ))}
          </div>
        </section>

        {/* Generate bar */}
        <div className="sticky bottom-4 z-50">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalImages}</span> images ·{' '}
                <span className="font-semibold text-foreground">{totalCost}</span> credits
              </div>
              {sourceCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {sourceCount} product{sourceCount !== 1 ? 's' : ''} × {selectedVariations.size} angle{selectedVariations.size !== 1 ? 's' : ''} × {selectedRatios.size} ratio{selectedRatios.size !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || totalCost > credits}
              className="h-11 px-6 rounded-xl shadow-lg shadow-primary/10"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate {totalImages} images</>
              )}
            </Button>
          </div>

          {isGenerating && progress > 0 && (
            <Progress value={progress} className="mt-2 h-1.5 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
