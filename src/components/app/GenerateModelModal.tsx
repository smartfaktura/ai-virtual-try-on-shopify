import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Upload, Loader2, Crown, X, Check } from 'lucide-react';
import { useGenerateUserModel } from '@/hooks/useUserModels';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface GenerateModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPlan: string;
}

export function GenerateModelModal({ open, onOpenChange, userPlan }: GenerateModelModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();
  const generateMutation = useGenerateUserModel();
  const { balance, refreshBalance } = useCredits();

  const isPaidPlan = ['growth', 'pro', 'enterprise'].includes(userPlan);
  const hasEnoughCredits = balance >= 20;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to storage
    const url = await upload(file);
    if (url) setUploadedUrl(url);
  };

  const handleGenerate = async () => {
    if (!uploadedUrl) return;

    try {
      const data = await generateMutation.mutateAsync(uploadedUrl);
      setResult(data.model);
      refreshBalance();
      toast.success('Model generated successfully!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate model';
      if (msg.includes('PLAN_REQUIRED')) {
        toast.error('Upgrade to Growth or Pro to use this feature');
      } else if (msg.includes('INSUFFICIENT_CREDITS')) {
        toast.error('Not enough credits. You need 20 credits.');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setPreviewUrl(null);
      setUploadedUrl(null);
      setResult(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Your Model
          </DialogTitle>
        </DialogHeader>

        {!isPaidPlan ? (
          <div className="text-center py-6 space-y-3">
            <Crown className="w-10 h-10 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Custom model generation is available on <strong>Growth</strong> and <strong>Pro</strong> plans.
            </p>
            <Button variant="default" onClick={handleClose}>
              Upgrade Plan
            </Button>
          </div>
        ) : result ? (
          /* Success state */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Check className="w-4 h-4" />
              Model created successfully
            </div>
            <div className="flex gap-3 items-center">
              <img
                src={getOptimizedUrl(result.image_url, { quality: 60 })}
                alt={result.name}
                className="w-20 h-20 rounded-lg object-cover border border-border"
              />
              <div>
                <p className="font-medium text-sm">{result.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {result.gender} · {result.body_type} · {result.ethnicity}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your model is now available in the model selector.
            </p>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          /* Upload & generate state */
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Upload a reference photo and our AI will generate a professional model portrait for your generations.
            </p>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                previewUrl ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              {previewUrl ? (
                <div className="relative">
                  <img src={getOptimizedUrl(previewUrl, { quality: 65 })} alt="Reference" loading="lazy" className="w-24 h-24 mx-auto rounded-lg object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setUploadedUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isUploading ? 'Uploading...' : 'Click to change'}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Upload reference photo</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG · Clear face visible</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Credit info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Cost: <strong>20 credits</strong></span>
              <span className={cn("font-medium", hasEnoughCredits ? "text-foreground" : "text-destructive")}>
                Balance: {balance} credits
              </span>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={!uploadedUrl || isUploading || generateMutation.isPending || !hasEnoughCredits}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating model...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Model (20 credits)
                </>
              )}
            </Button>

            {!hasEnoughCredits && uploadedUrl && (
              <p className="text-xs text-destructive text-center">
                Not enough credits. You need at least 20 credits.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
