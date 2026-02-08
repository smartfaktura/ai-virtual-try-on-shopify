import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, Template, ModelProfile, TryOnPose, GenerationMode, AspectRatio, ImageQuality } from '@/types';
import type { BulkGenerationConfig } from '@/types/bulk';
import { calculateBulkCredits } from '@/types/bulk';
import { getTemplateImage } from './TemplatePreviewCard';

interface BulkSettingsCardProps {
  onBack: () => void;
  onConfirm: (config: BulkGenerationConfig) => void;
  selectedProducts: Product[];
  templates: Template[];
  models: ModelProfile[];
  poses: TryOnPose[];
  creditsBalance: number;
}

export function BulkSettingsCard({
  onBack,
  onConfirm,
  selectedProducts,
  templates,
  models,
  poses,
  creditsBalance,
}: BulkSettingsCardProps) {
  const [mode, setMode] = useState<GenerationMode>('product-only');
  const [templateId, setTemplateId] = useState<string>(templates[0]?.templateId || '');
  const [modelId, setModelId] = useState<string>(models[0]?.modelId || '');
  const [poseId, setPoseId] = useState<string>(poses[0]?.poseId || '');
  const [imageCount, setImageCount] = useState<1 | 4 | 8>(4);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [quality, setQuality] = useState<ImageQuality>('standard');

  const productCount = selectedProducts.length;
  const estimatedCredits = calculateBulkCredits(productCount, imageCount, mode);
  const hasEnoughCredits = estimatedCredits <= creditsBalance;

  const allClothing = selectedProducts.every(p => {
    const type = p.productType.toLowerCase();
    const clothingKeywords = ['sweater', 'shirt', 'apparel', 'dress', 'jacket', 'pants', 'hoodie', 'legging', 'bra', 'tank', 'jogger', 'top'];
    return clothingKeywords.some(kw => type.includes(kw)) ||
      p.tags.some(tag => clothingKeywords.some(kw => tag.toLowerCase().includes(kw)));
  });

  const handleConfirm = () => {
    onConfirm({
      mode,
      templateId: mode === 'product-only' ? templateId : undefined,
      modelId: mode === 'virtual-try-on' ? modelId : undefined,
      poseId: mode === 'virtual-try-on' ? poseId : undefined,
      imageCount,
      aspectRatio,
      quality,
    });
  };

  return (
    <Card>
      <CardContent className="p-5 space-y-5">
        <Alert>
          <AlertDescription>
            Generating for <strong>{productCount} products</strong> • {imageCount} images each •
            <strong> {productCount * imageCount} total images</strong>
          </AlertDescription>
        </Alert>

        {/* Mode */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Generation Mode</h3>
          <RadioGroup value={mode} onValueChange={v => setMode(v as GenerationMode)}>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="product-only" id="mode-product" />
              <div>
                <Label htmlFor="mode-product">Product Photography</Label>
                <p className="text-xs text-muted-foreground">Use templates for product-focused shots (~4 credits/image)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="virtual-try-on" id="mode-tryon" disabled={!allClothing} />
              <div>
                <Label htmlFor="mode-tryon" className={!allClothing ? 'text-muted-foreground' : ''}>Virtual Try-On</Label>
                <p className="text-xs text-muted-foreground">Place clothing on AI models (~8 credits/image)</p>
              </div>
            </div>
          </RadioGroup>
          {!allClothing && (
            <p className="text-xs text-muted-foreground">Virtual Try-On requires all selected products to be clothing items.</p>
          )}
        </div>

        <Separator />

        {/* Template or Model selection */}
        {mode === 'product-only' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Select Template</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {templates.filter(t => t.enabled).map(template => (
                <div
                  key={template.templateId}
                  onClick={() => setTemplateId(template.templateId)}
                  className={`cursor-pointer rounded-lg border-2 transition-all ${
                    templateId === template.templateId ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="aspect-square rounded-t-md overflow-hidden">
                    <img src={getTemplateImage(template.templateId)} alt={template.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{template.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Select Model</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {models.map(model => (
                  <div
                    key={model.modelId}
                    onClick={() => setModelId(model.modelId)}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                      modelId === model.modelId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden mb-1">
                      <img src={model.previewUrl} alt={model.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs truncate text-center">{model.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Select Pose</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {poses.map(pose => (
                  <div
                    key={pose.poseId}
                    onClick={() => setPoseId(pose.poseId)}
                    className={`cursor-pointer rounded-lg border-2 p-1 transition-all ${
                      poseId === pose.poseId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[3/4] rounded overflow-hidden mb-1">
                      <img src={pose.previewUrl} alt={pose.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs truncate text-center">{pose.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Generation options */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Images per product</Label>
            <Select value={String(imageCount)} onValueChange={val => setImageCount(Number(val) as 1 | 4 | 8)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 image</SelectItem>
                <SelectItem value="4">4 images</SelectItem>
                <SelectItem value="8">8 images</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={val => setAspectRatio(val as AspectRatio)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 Square</SelectItem>
                <SelectItem value="4:5">4:5 Portrait</SelectItem>
                <SelectItem value="16:9">16:9 Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Quality</Label>
            <Select value={quality} onValueChange={val => setQuality(val as ImageQuality)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Credit summary */}
        <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Estimated cost:</span>
            <Badge variant={hasEnoughCredits ? 'default' : 'destructive'}>{estimatedCredits} credits</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Your balance:</span>
            <span className="text-xs">{creditsBalance} credits</span>
          </div>
          {!hasEnoughCredits && (
            <Alert variant="destructive">
              <AlertDescription>Not enough credits. You need {estimatedCredits - creditsBalance} more credits.</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Selection
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasEnoughCredits || (mode === 'virtual-try-on' && !allClothing)}
          >
            <Play className="w-4 h-4 mr-2" />
            Generate {productCount * imageCount} Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
