import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Upload, ImagePlus, Package, Loader2, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const WORKFLOW_OPTIONS = [
  {
    name: 'Virtual Try-On',
    slug: 'virtual-try-on-set',
    subtitle: 'Show your product on real models',
    sampleId: 'sample_tryon_crop_top',
    sampleName: 'Ribbed Crop Top',
    sampleImage: '/images/samples/sample-crop-top.png',
  },
  {
    name: 'Product Editorial',
    slug: 'product-listing-set',
    subtitle: 'High-end lifestyle & studio shots',
    sampleId: 'sample_listing_ring',
    sampleName: 'Diamond Engagement Ring',
    sampleImage: '/images/samples/sample-ring.png',
  },
  {
    name: 'Selfie / UGC Set',
    slug: 'selfie-ugc-set',
    subtitle: 'High-quality content like UGC creators',
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

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
    setUploadFile(null);
    setUploadPreview(null);
    setUploadTitle('');
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSelectWorkflow = (wf: typeof WORKFLOW_OPTIONS[0]) => {
    setSelectedWorkflow(wf);
    setStep('product');
  };

  const handleSelectProduct = (productId: string) => {
    if (!selectedWorkflow) return;
    onOpenChange(false);
    navigate(`/app/generate/${selectedWorkflow.slug}?product=${productId}`);
    reset();
  };

  const handleUseSample = () => {
    if (!selectedWorkflow) return;
    onOpenChange(false);
    navigate(`/app/generate/${selectedWorkflow.slug}?product=${selectedWorkflow.sampleId}`);
    reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    // Auto-fill title from filename
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

  // --- Step 1: Workflow selection ---
  const workflowStep = (
    <div className="space-y-3">
      {WORKFLOW_OPTIONS.map((wf) => (
        <button
          key={wf.slug}
          onClick={() => handleSelectWorkflow(wf)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{wf.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{wf.subtitle}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
        </button>
      ))}
    </div>
  );

  // --- Step 2: Product selection ---
  const productStep = (
    <div className="space-y-4">
      <button
        onClick={() => setStep('workflow')}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      {hasProducts ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Select a product for your {selectedWorkflow?.name}:</p>
          <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {userProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p.id)}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
              >
                <div className="w-full aspect-square rounded-md overflow-hidden bg-muted">
                  <img
                    src={getOptimizedUrl(p.image_url, { width: 200, quality: 70 })}
                    alt={p.title}
                    className="w-full h-full object-cover"
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
                className="flex items-center gap-3 w-full p-3 rounded-lg border border-dashed border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
              >
                <img
                  src={selectedWorkflow.sampleImage}
                  alt={selectedWorkflow.sampleName}
                  className="w-10 h-10 rounded-md object-cover bg-muted"
                />
                <div>
                  <p className="text-xs font-medium text-foreground">{selectedWorkflow.sampleName}</p>
                  <p className="text-[10px] text-muted-foreground">Sample product</p>
                </div>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Add your product to get started:</p>

          {/* Upload option */}
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

          {/* Sample option */}
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
        </div>
      )}
    </div>
  );

  // --- Step 2b: Upload form ---
  const uploadStep = (
    <div className="space-y-4">
      <button
        onClick={() => setStep('product')}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

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
          <Button
            onClick={handleUploadAndGo}
            disabled={isUploading || !uploadTitle.trim()}
            className="w-full rounded-full font-semibold gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Add Product & Continue
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  const stepTitle = step === 'workflow'
    ? 'What do you want to create?'
    : step === 'upload'
      ? 'Upload your product'
      : 'Select a product';

  const stepDesc = step === 'workflow'
    ? 'Choose a workflow to get started'
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
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 gap-0 overflow-hidden">
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
