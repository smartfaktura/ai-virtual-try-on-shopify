import { useState, useRef, useCallback } from 'react';
import { Upload, ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { StylePresetSelector } from '@/components/app/video/StylePresetSelector';
import { MotionPresetSelector } from '@/components/app/video/MotionPresetSelector';
import { AudioModeSelector } from '@/components/app/video/AudioModeSelector';
import { CreditEstimateBox } from '@/components/app/video/CreditEstimateBox';
import { ValidationWarnings, type ValidationWarning } from '@/components/app/video/ValidationWarnings';
import { VideoResultsPanel } from '@/components/app/video/VideoResultsPanel';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AspectRatio = '9:16' | '1:1' | '16:9';
type Duration = '5' | '10';
type MotionIntensity = 'low' | 'medium' | 'high';
type AudioMode = 'silent' | 'ambient';

export default function AnimateVideo() {
  const navigate = useNavigate();
  const { status, videoUrl, error, elapsedSeconds, startGeneration, reset } = useGenerateVideo();
  const { upload, isUploading, progress: uploadProgress } = useFileUpload();
  const { balance } = useCredits();

  // Step state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [stylePreset, setStylePreset] = useState('product_motion');
  const [motionRecipe, setMotionRecipe] = useState('slow_push_in');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<Duration>('5');
  const [audioMode, setAudioMode] = useState<AudioMode>('silent');
  const [motionIntensity, setMotionIntensity] = useState<MotionIntensity>('low');
  const [preserveScene, setPreserveScene] = useState(true);
  const [userPrompt, setUserPrompt] = useState('');
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    const newWarnings: ValidationWarning[] = [];
    if (file.size > 20 * 1024 * 1024) {
      newWarnings.push({ type: 'error', message: 'Image must be under 20MB.' });
      setWarnings(newWarnings);
      return;
    }
    if (file.type === 'image/png' && file.name.toLowerCase().endsWith('.png')) {
      newWarnings.push({ type: 'info', message: 'Transparent PNGs may produce edge artifacts in video. Consider using JPG.' });
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const url = await upload(file);
    if (url) {
      setImageUrl(url);
      setWarnings(newWarnings);
    }
  }, [upload]);

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    setWarnings([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = () => {
    if (!imageUrl) {
      toast.error('Please upload an image first');
      return;
    }

    startGeneration({
      imageUrl,
      prompt: userPrompt || undefined,
      duration,
      aspectRatio: aspectRatio as '1:1' | '16:9' | '9:16',
      mode: 'std',
    });
  };

  const handleReuse = () => {
    reset();
    // Keep settings, just reset generation state
  };

  const handleNewProject = () => {
    reset();
    removeImage();
    setStylePreset('product_motion');
    setMotionRecipe('slow_push_in');
    setUserPrompt('');
  };

  const isGenerating = status === 'creating' || status === 'processing';
  const isComplete = status === 'complete' && videoUrl;

  const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '9:16', label: '9:16' },
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
  ];

  const INTENSITIES: { value: MotionIntensity; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Animate Image"
        subtitle="Turn one still image into a polished short video."
      >
        <div /></PageHeader>

      {/* Results View */}
      {isComplete && (
        <VideoResultsPanel
          videoUrl={videoUrl}
          sourceImageUrl={imagePreview || undefined}
          onReuse={handleReuse}
          onVariation={handleGenerate}
          onNewProject={handleNewProject}
        />
      )}

      {/* Processing View */}
      {isGenerating && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div>
            <p className="font-medium text-foreground">
              {status === 'creating' ? 'Starting generation...' : 'Generating your video...'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This typically takes 1-3 minutes • {elapsedSeconds}s elapsed
            </p>
          </div>
          <Progress value={Math.min((elapsedSeconds / 120) * 100, 95)} className="h-1.5 max-w-xs mx-auto" />
        </div>
      )}

      {/* Error View */}
      {status === 'error' && error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
            Try Again
          </Button>
        </div>
      )}

      {/* Main Form — hidden during generation/results */}
      {!isGenerating && !isComplete && (
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Upload Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 max-w-sm">
                <img src={imagePreview} alt="Upload" className="w-full aspect-square object-contain" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
                {isUploading && (
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full max-w-sm aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 bg-muted/10"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <span className="text-xs text-muted-foreground/60">JPG, PNG, WebP • Max 20MB</span>
                  </>
                )}
              </button>
            )}
          </div>

          <ValidationWarnings warnings={warnings} />

          {/* Step 2: Style */}
          <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

          {/* Step 3: Motion */}
          <MotionPresetSelector value={motionRecipe} onChange={setMotionRecipe} />

          {/* Step 4: Settings */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground">Settings</h3>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Aspect Ratio</label>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm border transition-colors',
                      aspectRatio === ar.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Duration</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDuration('5')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm border transition-colors',
                    duration === '5'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  5 seconds
                </button>
                <button
                  onClick={() => setDuration('10')}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm border transition-colors',
                    duration === '10'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  10 seconds
                </button>
              </div>
            </div>

            {/* Audio */}
            <AudioModeSelector value={audioMode} onChange={(v) => setAudioMode(v as AudioMode)} />

            {/* Motion Intensity */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Motion Intensity</label>
              <div className="flex gap-2">
                {INTENSITIES.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setMotionIntensity(i.value)}
                    className={cn(
                      'px-3 py-1 rounded-md text-sm border transition-colors',
                      motionIntensity === i.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preserve Scene */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Preserve scene composition</label>
              <Switch checked={preserveScene} onCheckedChange={setPreserveScene} />
            </div>
          </div>

          {/* Optional Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Additional Direction <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Add any specific direction for the video..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
          </div>

          {/* Credit Estimate + Generate */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <CreditEstimateBox
              params={{
                workflowType: 'animate',
                duration,
                audioMode,
                motionRecipe,
              }}
            />
            <Button
              onClick={handleGenerate}
              disabled={!imageUrl || isUploading}
              className="gap-2"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Generate Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
