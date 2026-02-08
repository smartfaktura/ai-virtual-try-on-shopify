import { useState, useRef, useCallback } from 'react';
import { 
  Plus, X, Sparkles, Download, Expand, Image as ImageIcon, 
  User, RectangleHorizontal, Square, Smartphone, ChevronDown,
  Minus, Wand2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { useGenerateFreestyle } from '@/hooks/useGenerateFreestyle';
import { useCredits } from '@/contexts/CreditContext';
import { mockModels } from '@/data/mockData';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';
import type { ModelProfile } from '@/types';

type FreestyleAspectRatio = '1:1' | '3:4' | '4:5' | '16:9';

const ASPECT_RATIOS: { value: FreestyleAspectRatio; label: string; icon: typeof Square }[] = [
  { value: '1:1', label: '1:1', icon: Square },
  { value: '3:4', label: '3:4', icon: Smartphone },
  { value: '4:5', label: '4:5', icon: Smartphone },
  { value: '16:9', label: '16:9', icon: RectangleHorizontal },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function Freestyle() {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelProfile | null>(null);
  const [aspectRatio, setAspectRatio] = useState<FreestyleAspectRatio>('1:1');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [polishPrompt, setPolishPrompt] = useState(true);
  const [imageCount, setImageCount] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);
  const [aspectPopoverOpen, setAspectPopoverOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { generate, isLoading, progress } = useGenerateFreestyle();
  const { balance, deductCredits, openBuyModal } = useCredits();

  const creditCost = imageCount * (quality === 'high' ? 2 : 1);
  const canGenerate = prompt.trim().length > 0 && !isLoading && balance >= creditCost;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSourceImagePreview(previewUrl);

    const base64 = await convertImageToBase64(previewUrl);
    setSourceImage(base64);
  }, []);

  const removeSourceImage = useCallback(() => {
    setSourceImage(null);
    setSourceImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) {
      if (balance < creditCost) openBuyModal();
      return;
    }

    let modelImageBase64: string | undefined;
    if (selectedModel) {
      modelImageBase64 = await convertImageToBase64(selectedModel.previewUrl);
    }

    const result = await generate({
      prompt,
      sourceImage: sourceImage || undefined,
      modelImage: modelImageBase64,
      aspectRatio,
      imageCount,
      quality,
      polishPrompt,
    });

    if (result && result.images.length > 0) {
      deductCredits(creditCost);
      const newImages: GeneratedImage[] = result.images.map(url => ({
        url,
        prompt,
        timestamp: Date.now(),
      }));
      setGeneratedImages(prev => [...newImages, ...prev]);
    }
  }, [canGenerate, balance, creditCost, openBuyModal, selectedModel, generate, prompt, sourceImage, aspectRatio, imageCount, quality, polishPrompt, deductCredits]);

  const handleDownload = useCallback((imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `freestyle-${index + 1}.png`;
    a.click();
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Results Gallery */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {generatedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Wand2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Freestyle Studio</h2>
            <p className="text-muted-foreground max-w-md">
              Describe what you want to create, optionally upload a reference image or pick a model, and generate. Your creations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {generatedImages.map((img, idx) => (
              <div key={img.timestamp + idx} className="group relative rounded-lg overflow-hidden bg-muted animate-fade-in">
                <img 
                  src={img.url} 
                  alt={`Generated ${idx + 1}`} 
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDownload(img.url, idx)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openLightbox(idx)}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <Expand className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading progress */}
      {isLoading && (
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <div className="flex-1">
              <Progress value={progress} className="h-1.5" />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Sticky Bottom Prompt Bar */}
      <div className="border-t border-border bg-sidebar p-4 sm:p-5 flex-shrink-0">
        {/* Prompt Input Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Attach Image Button */}
          <div className="flex-shrink-0 pt-1">
            {sourceImagePreview ? (
              <div className="relative w-10 h-10">
                <img src={sourceImagePreview} alt="Attached" className="w-10 h-10 rounded-lg object-cover" />
                <button
                  onClick={removeSourceImage}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-sidebar-foreground/60 hover:bg-white/10 hover:text-sidebar-foreground transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Prompt Textarea */}
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            rows={2}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />

          {/* Generate Button */}
          <div className="flex-shrink-0 pt-1">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="h-10 px-5 gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Generate</span>
              <span className="text-xs opacity-80">({creditCost})</span>
            </Button>
          </div>
        </div>

        {/* Settings Chips Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Selector */}
          <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-sidebar-foreground/80 hover:bg-white/10 transition-colors">
                {selectedModel ? (
                  <>
                    <img src={selectedModel.previewUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                    {selectedModel.name}
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" />
                    No Model
                  </>
                )}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Character Reference</p>
              <button
                onClick={() => { setSelectedModel(null); setModelPopoverOpen(false); }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors',
                  !selectedModel ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                No Model
              </button>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {mockModels.map(model => (
                  <button
                    key={model.modelId}
                    onClick={() => { setSelectedModel(model); setModelPopoverOpen(false); }}
                    className={cn(
                      'relative rounded-lg overflow-hidden border-2 transition-all',
                      selectedModel?.modelId === model.modelId ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'
                    )}
                  >
                    <img src={model.previewUrl} alt={model.name} className="w-full aspect-square object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                      <p className="text-[10px] text-white truncate">{model.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Aspect Ratio */}
          <Popover open={aspectPopoverOpen} onOpenChange={setAspectPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-sidebar-foreground/80 hover:bg-white/10 transition-colors">
                <Square className="w-3.5 h-3.5" />
                {aspectRatio}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
              {ASPECT_RATIOS.map(ar => (
                <button
                  key={ar.value}
                  onClick={() => { setAspectRatio(ar.value); setAspectPopoverOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                    aspectRatio === ar.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  <ar.icon className="w-3.5 h-3.5" />
                  {ar.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Quality Toggle */}
          <button
            onClick={() => setQuality(q => q === 'standard' ? 'high' : 'standard')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              quality === 'high'
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-white/10 bg-white/5 text-sidebar-foreground/80 hover:bg-white/10'
            )}
          >
            {quality === 'high' ? '✦ High' : 'Standard'}
          </button>

          {/* Prompt Polish Toggle */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-sidebar-foreground/80">
            <Wand2 className="w-3.5 h-3.5" />
            Polish
            <Switch
              checked={polishPrompt}
              onCheckedChange={setPolishPrompt}
              className="scale-75 -my-1"
            />
          </div>

          {/* Image Count Stepper */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-sidebar-foreground/80">
            <button
              onClick={() => setImageCount(c => Math.max(1, c - 1))}
              disabled={imageCount <= 1}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center tabular-nums">{imageCount}</span>
            <button
              onClick={() => setImageCount(c => Math.min(4, c + 1))}
              disabled={imageCount >= 4}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
            <ImageIcon className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {generatedImages.length > 0 && (
        <ImageLightbox
          images={generatedImages.map(i => i.url)}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(idx) => handleDownload(generatedImages[idx].url, idx)}
        />
      )}
    </div>
  );
}
