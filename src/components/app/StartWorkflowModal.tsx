import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Upload, ImagePlus, Loader2, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { WorkflowCardCompact } from '@/components/app/WorkflowCardCompact';
import type { Workflow } from '@/types/workflow';

const WORKFLOW_OPTIONS = [
  {
    name: 'Product Editorial',
    displayName: 'Product Editorial',
    slug: 'product-listing-set',
    subtitle: 'Turn your product into a campaign',
    sampleId: 'sample_listing_ring',
    sampleName: 'Diamond Engagement Ring',
    sampleImage: '/images/samples/sample-ring.png',
  },
  {
    name: 'Virtual Try-On',
    displayName: 'Virtual Try-On',
    slug: 'virtual-try-on-set',
    subtitle: 'See your product on real people',
    sampleId: 'sample_tryon_crop_top',
    sampleName: 'Ribbed Crop Top',
    sampleImage: '/images/samples/sample-crop-top.png',
  },
  {
    name: 'UGC / Selfie',
    displayName: 'UGC / Selfie',
    slug: 'selfie-ugc-set',
    subtitle: 'Create content that feels real & social',
    sampleId: 'sample_ugc_ice_roller',
    sampleName: 'Ice Roller',
    sampleImage: '/images/samples/sample-ice-roller.png',
  },
];

type Step = 'workflow' | 'product' | 'upload';

interface StartWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartWorkflowModal({ open, onOpenChange }: StartWorkflowModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>('workflow');
  const [selectedWorkflow, setSelectedWorkflow] = useState<typeof WORKFLOW_OPTIONS[0] | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch user products
  const { data: userProducts = [] } = useQuery({
    queryKey: ['start-workflow-products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('id, title, image_url, product_type')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user && open,
  });

  const hasProducts = userProducts.length > 0;

  const reset = () => {
    setStep('workflow');
    setSelectedWorkflow(null);
    setSelectedProductId(null);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle('');
    setIsNavigating(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSelectWorkflow = (wf: typeof WORKFLOW_OPTIONS[0]) => {
    if ('directRoute' in wf && wf.directRoute) {
      onOpenChange(false);
      navigate(wf.directRoute as string);
      reset();
      return;
    }
    setSelectedWorkflow(wf);
    setSelectedProductId(null);
    setStep('product');
  };

  const handleConfirmProduct = () => {
    if (!selectedWorkflow || !selectedProductId) return;
    setIsNavigating(true);
    setTimeout(() => {
      onOpenChange(false);
      navigate(`/app/generate/${selectedWorkflow.slug}?product=${selectedProductId}`);
      reset();
    }, 50);
  };

  const handleUseSample = () => {
    if (!selectedWorkflow) return;
    setIsNavigating(true);
    setTimeout(() => {
      onOpenChange(false);
      navigate(`/app/generate/${selectedWorkflow.slug}?product=${selectedWorkflow.sampleId}`);
      reset();
    }, 50);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setUploadTitle(name.charAt(0).toUpperCase() + name.slice(1));
  };

  const handleUploadAndGo = async () => {
    if (!uploadFile || !user || !selectedWorkflow) return;
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const ext = uploadFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/${timestamp}-${randomId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-uploads')
        .upload(path, uploadFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-uploads')
        .getPublicUrl(path);

      const { data: product, error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title: uploadTitle || 'My Product',
          image_url: urlData.publicUrl,
          product_type: '',
          description: '',
        })
        .select('id')
        .single();
      if (insertError) throw insertError;

      toast.success('Product added!');
      onOpenChange(false);
      navigate(`/app/generate/${selectedWorkflow.slug}?product=${product.id}`);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Mock Workflow objects for the animated cards
  const WORKFLOW_CARDS: Workflow[] = WORKFLOW_OPTIONS.map((wf) => ({
    id: wf.slug,
    name: wf.slug === 'product-listing-set' ? 'Product Listing Set'
      : wf.slug === 'virtual-try-on-set' ? 'Virtual Try-On Set'
      : wf.slug === 'selfie-ugc-set' ? 'Selfie / UGC Set'
      : 'Catalog Studio',
    slug: wf.slug,
    description: wf.subtitle,
    default_image_count: 4,
    required_inputs: [],
    recommended_ratios: ['4:5'],
    uses_tryon: wf.slug === 'virtual-try-on-set',
    template_ids: [],
    is_system: true,
    created_at: '',
    sort_order: 0,
    preview_image_url: null,
    generation_config: null,
  }));

  // --- Step 1: Workflow selection ---
  const workflowStep = (
    <div className="space-y-3">
      <div className={cn(
        isMobile
          ? "flex flex-col gap-3"
          : "grid grid-cols-3 gap-3"
      )}>
        {WORKFLOW_CARDS.map((wf, i) => (
          <WorkflowCardCompact
            key={wf.slug}
            workflow={wf}
            displayName={WORKFLOW_OPTIONS[i].displayName}
            subtitle={WORKFLOW_OPTIONS[i].subtitle}
            onSelect={() => handleSelectWorkflow(WORKFLOW_OPTIONS[i])}
            modalCompact
            mobileRow={isMobile}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground/60 text-center pt-1">No setup. No photoshoot. Just results.</p>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1.5"
          onClick={() => { onOpenChange(false); navigate('/app/workflows'); }}
        >
          Browse all templates <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  // --- Step 2: Product selection ---
  const productStep = (
    <div className="space-y-4">
      {hasProducts ? (
        <>
          <p className="text-sm text-muted-foreground">Select a product for your {selectedWorkflow?.name}:</p>
          <div className="grid grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
            {userProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all cursor-pointer",
                  selectedProductId === p.id
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
                  <ShimmerImage
                    src={getOptimizedUrl(p.image_url, { width: 300, quality: 75 })}
                    alt={p.title}
                    className="w-full h-full object-contain"
                    aspectRatio="1/1"
                  />
                </div>
                <p className="text-[11px] text-foreground font-medium text-center line-clamp-2 leading-tight">{p.title}</p>
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Or try with a sample:</p>
            {selectedWorkflow && (
              <button
                onClick={handleUseSample}
                disabled={isNavigating}
                className="flex items-center gap-3 w-full p-3 rounded-lg border border-dashed border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left disabled:opacity-50"
              >
                {isNavigating ? (
                  <div className="w-10 h-10 rounded-md flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={selectedWorkflow.sampleImage}
                    alt={selectedWorkflow.sampleName}
                    className="w-10 h-10 rounded-md object-cover bg-muted"
                  />
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">{selectedWorkflow.sampleName}</p>
                  <p className="text-[10px] text-muted-foreground">Sample product</p>
                </div>
              </button>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedProductId(null); setStep('workflow'); }} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button
              onClick={handleConfirmProduct}
              disabled={!selectedProductId || isNavigating}
              size="sm"
              className="gap-1.5"
            >
              {isNavigating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...</>
              ) : (
                <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Add your product to get started:</p>

          <button
            onClick={() => setStep('upload')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Upload Your Product</p>
              <p className="text-xs text-muted-foreground mt-0.5">Add a photo of your product</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
          </button>

          {selectedWorkflow && (
            <button
              onClick={handleUseSample}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 text-left group"
            >
              <img
                src={selectedWorkflow.sampleImage}
                alt={selectedWorkflow.sampleName}
                className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Use Sample Product</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedWorkflow.sampleName}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
            </button>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" onClick={() => setStep('workflow')} className="gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // --- Step 2b: Upload form ---
  const uploadStep = (
    <div className="space-y-4">
      {!uploadPreview ? (
        <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 cursor-pointer transition-colors">
          <ImagePlus className="w-8 h-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">Drop your product image here</p>
          <p className="text-xs text-muted-foreground/60">PNG, JPG up to 10MB</p>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-3">
          <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden bg-muted border border-border">
            <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <Input
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="Product name"
            className="rounded-lg"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <Button variant="ghost" size="sm" onClick={() => setStep('product')} className="gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Button>
        {uploadPreview && (
          <Button
            onClick={handleUploadAndGo}
            disabled={isUploading || !uploadTitle.trim()}
            size="sm"
            className="gap-1.5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add & Continue <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const stepTitle = step === 'workflow'
    ? "Let's create your first visuals"
    : step === 'upload'
      ? 'Upload your product'
      : 'Select a product';

  const stepDesc = step === 'workflow'
    ? "Pick a style — we'll handle the rest"
    : step === 'upload'
      ? 'Add a product photo to begin'
      : hasProducts
        ? 'Pick from your products or use a sample'
        : 'Upload a product or try with a sample';

  const content = step === 'workflow' ? workflowStep : step === 'upload' ? uploadStep : productStep;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="px-5 pt-4 pb-3 text-left shrink-0">
            <DrawerTitle className="text-lg font-semibold tracking-tight">{stepTitle}</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">{stepDesc}</DrawerDescription>
          </DrawerHeader>
          <div className="px-5 pb-5 overflow-y-auto flex-1 min-h-0">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl p-0 gap-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold tracking-tight">{stepTitle}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{stepDesc}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 pt-2">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}