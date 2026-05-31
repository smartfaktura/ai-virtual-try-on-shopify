import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, GenerationSourceType, ScratchUpload } from '@/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface UpscaleSettingsPanelProps {
  selectedProduct: Product | null;
  scratchUpload: ScratchUpload | null;
  sourceType: GenerationSourceType | null;
  isMultiProductMode: boolean;
  productQueue: Product[];
  creditCost: number;
  upscaleImageCount: number;
  balance: number;
  openBuyModal: () => void;
  handleGenerateClick: () => void;
  setCurrentStep: (step: 'source' | 'product' | 'upload' | 'library' | 'brand-profile' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results') => void;
}

export default function UpscaleSettingsPanel({
  selectedProduct, scratchUpload, sourceType, isMultiProductMode, productQueue,
  creditCost, upscaleImageCount,
  balance, openBuyModal, handleGenerateClick, setCurrentStep,
}: UpscaleSettingsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Product summary */}
      <Card><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {sourceType === 'scratch' ? 'Uploaded Image' : isMultiProductMode ? `Selected Images (${productQueue.length})` : 'Selected Product'}
          </span>
          <Button variant="link" size="sm" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'source')}>Change</Button>
        </div>
        {isMultiProductMode ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {productQueue.map(p => (
              <div key={p.id} className="flex-shrink-0 w-[72px]">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border mx-auto">
                  <img src={getOptimizedUrl(p.images[0]?.url, { quality: 60 }) || '/placeholder.svg'} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 truncate">{p.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
              <img src={getOptimizedUrl(sourceType === 'scratch' ? scratchUpload?.previewUrl : selectedProduct?.images[0]?.url || '/placeholder.svg', { quality: 60 })} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold">{sourceType === 'scratch' ? scratchUpload?.productInfo.title : selectedProduct?.title}</p>
              <p className="text-sm text-muted-foreground">{sourceType === 'scratch' ? 'Custom Upload' : selectedProduct?.productType}</p>
            </div>
          </div>
        )}
      </CardContent></Card>

      {/* 4K Summary (locked tier) */}
      <Card><CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Enhance to 4K
          </h3>
          <p className="text-sm text-muted-foreground">Print-ready 4096px output with AI texture recovery</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary text-primary-foreground shrink-0">
            <span className="text-lg font-bold leading-none">4K</span>
            <span className="text-[10px] font-medium opacity-80 mt-1">4096px</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">Maximum resolution</p>
            <p className="text-sm text-muted-foreground mt-0.5">Sharper textures, richer detail, ready for print &amp; large displays</p>
            <p className="text-sm font-semibold text-primary mt-2">15 credits per image</p>
          </div>
        </div>
      </CardContent></Card>

      {/* Cost Summary */}
      <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
        <div>
          <p className="text-sm font-semibold">Total: {creditCost} credits</p>
          <p className="text-xs text-muted-foreground">
            {upscaleImageCount} image{upscaleImageCount !== 1 ? 's' : ''} × 15 credits (4K)
          </p>
        </div>
        {balance >= creditCost ? (
          <p className="text-sm text-muted-foreground">{balance} credits available</p>
        ) : (
          <button onClick={openBuyModal} className="flex items-center gap-1 text-sm text-destructive font-semibold hover:underline">
            <AlertCircle className="w-3.5 h-3.5" />
            {balance} credits — need {creditCost}. Top up
          </button>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(sourceType === 'scratch' ? 'upload' : 'product')}>Back</Button>
        <Button
          onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
          className={cn("gap-2", balance < creditCost ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '')}
        >
          <Sparkles className="w-4 h-4" />
          {balance >= creditCost ? `Enhance ${upscaleImageCount} Image${upscaleImageCount !== 1 ? 's' : ''} to 4K` : 'Buy Credits'}
        </Button>
      </div>
    </div>
  );
}
