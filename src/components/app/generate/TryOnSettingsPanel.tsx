import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TryOnPreview } from '@/components/app/TryOnPreview';
import { FramingSelector } from '@/components/app/FramingSelector';
import { AspectRatioSelector } from '@/components/app/AspectRatioPreview';
import type { Product, ScratchUpload, ModelProfile, TryOnPose, AspectRatio, ImageQuality, FramingOption } from '@/types';

interface TryOnSettingsPanelProps {
  selectedProduct: Product | null;
  scratchUpload: ScratchUpload | null;
  selectedModel: ModelProfile;
  selectedPose: TryOnPose | null;
  selectedPoses: Set<string>;
  selectedPoseMap: Map<string, TryOnPose>;
  creditCost: number;
  imageCount: string;
  setImageCount: (v: '1' | '2' | '3' | '4') => void;
  quality: ImageQuality;
  setQuality: (v: ImageQuality) => void;
  framing: FramingOption | null;
  setFraming: (f: FramingOption | null) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  balance: number;
  isFreeUser: boolean;
  isMultiProductMode: boolean;
  multiProductCount: number;
  productQueue: Product[];
  tryOnSceneCount: number;
  openBuyModal: () => void;
  handleGenerateClick: () => void;
  setCurrentStep: (step: 'source' | 'product' | 'upload' | 'library' | 'brand-profile' | 'mode' | 'model' | 'pose' | 'template' | 'settings' | 'generating' | 'results') => void;
}

export default function TryOnSettingsPanel({
  selectedProduct, scratchUpload, selectedModel, selectedPose,
  selectedPoses, selectedPoseMap, creditCost,
  imageCount, setImageCount, quality, setQuality,
  framing, setFraming, aspectRatio, setAspectRatio,
  balance, isFreeUser, isMultiProductMode, multiProductCount, productQueue,
  tryOnSceneCount, openBuyModal, handleGenerateClick, setCurrentStep,
}: TryOnSettingsPanelProps) {
  const posesArray = Array.from(selectedPoses).map(id => selectedPoseMap.get(id)!).filter(Boolean);

  return (
    <div className="space-y-4">
      <TryOnPreview
        product={selectedProduct}
        scratchUpload={scratchUpload}
        model={selectedModel}
        pose={selectedPose}
        poses={posesArray}
        creditCost={creditCost}
        selectedGender={selectedModel?.gender}
        products={isMultiProductMode ? productQueue : undefined}
      />

      <Card><CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Selected Model & {selectedPoses.size > 1 ? 'Scenes' : 'Scene'}</span>
          <Button variant="link" size="sm" onClick={() => setCurrentStep('model')}>Change</Button>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
              <img src={selectedModel.previewUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</p>
              <p className="text-sm font-medium">{selectedModel.name}</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          {Array.from(selectedPoses).map(poseId => {
            const p = selectedPoseMap.get(poseId);
            if (!p) return null;
            const img = selectedModel?.gender === 'male' && p.previewUrlMale ? p.previewUrlMale : p.previewUrl;
            return (
              <div key={poseId} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Scene</p>
                  <p className="text-sm font-medium">{p.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-4">
        <h3 className="text-base font-semibold">Generation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Number of Images per Scene</Label>
            <Select value={imageCount} onValueChange={v => setImageCount(v as '1' | '2' | '3' | '4')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 image</SelectItem>
                {!isFreeUser && <SelectItem value="2">2 images</SelectItem>}
                {!isFreeUser && <SelectItem value="3">3 images</SelectItem>}
                {!isFreeUser && <SelectItem value="4">4 images</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quality</Label>
            <Select value={quality} onValueChange={v => setQuality(v as ImageQuality)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard — Fast generation, good quality</SelectItem>
                <SelectItem value="high">High (Pro Model) — Best quality, ~60-120s per image</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <FramingSelector framing={framing} onFramingChange={setFraming} />
        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
      </CardContent></Card>

      <div className={cn("p-4 rounded-lg border flex items-center justify-between", balance >= creditCost ? "border-border bg-muted/30" : "border-destructive/30 bg-destructive/5")}>
        <div>
          <p className="text-sm font-semibold">Virtual Try-On: {creditCost} credits</p>
          <p className="text-xs text-muted-foreground">
            {(() => {
              const parts: string[] = [];
              parts.push(`${parseInt(imageCount)} image${parseInt(imageCount) > 1 ? 's' : ''}`);
              if (selectedPoses.size > 1) parts.push(`${selectedPoses.size} scenes`);
              if (isMultiProductMode) parts.push(`${multiProductCount} products`);
              parts.push(`8 credits each`);
              return parts.join(' × ');
            })()}
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCurrentStep('pose')}>Back</Button>
        <Button
          onClick={balance >= creditCost ? handleGenerateClick : openBuyModal}
          className={balance < creditCost ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
        >
          {balance >= creditCost ? `Generate ${parseInt(imageCount) * tryOnSceneCount * multiProductCount} Try-On Images` : 'Buy Credits'}
        </Button>
      </div>
    </div>
  );
}
