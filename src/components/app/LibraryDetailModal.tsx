import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { saveOrShareImage, isMobileDevice } from '@/lib/mobileImageSave';
import { buildLibraryFileName } from '@/lib/downloadFileName';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Camera, User, X, Sparkles, Globe, Send, Trophy, Maximize, Layers, Video, AtSign, Copy, Check, ClipboardCopy, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { ContextualFeedbackCard } from '@/components/app/ContextualFeedbackCard';
import { AddModelModal } from '@/components/app/AddModelModal';
import { AddToDiscoverModal } from '@/components/app/AddToDiscoverModal';
import { SubmitToDiscoverModal } from '@/components/app/SubmitToDiscoverModal';
import { UpscaleModal } from '@/components/app/UpscaleModal';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { LibraryItem } from '@/components/app/LibraryImageCard';


interface LibraryDetailModalProps {
  item: LibraryItem | null;
  open: boolean;
  onClose: () => void;
  isUpscaling?: boolean;
  onCopySettings?: (settings: { prompt: string; modelId?: string | null; sceneId?: string | null; productId?: string | null; aspectRatio?: string }) => void;
  items?: LibraryItem[];
  initialIndex?: number;
}

export function LibraryDetailModal({ item, open, onClose, isUpscaling, onCopySettings, items, initialIndex = 0 }: LibraryDetailModalProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [sceneModalUrl, setSceneModalUrl] = useState<string | null>(null);
  const [sceneModalPrompt, setSceneModalPrompt] = useState<string>('');
  const [modelModalUrl, setModelModalUrl] = useState<string | null>(null);
  const [discoverModalOpen, setDiscoverModalOpen] = useState(false);
  const [submitDiscoverOpen, setSubmitDiscoverOpen] = useState(false);
  const [upscaleModalOpen, setUpscaleModalOpen] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  // Multi-image navigation
  const hasMultiple = items && items.length > 1;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens with new items
  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex, open]);

  const activeItem = hasMultiple ? items[currentIndex] ?? item : item;

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex(i => (i > 0 ? i - 1 : items.length - 1));
  }, [hasMultiple, items?.length]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex(i => (i < items.length - 1 ? i + 1 : 0));
  }, [hasMultiple, items?.length]);

  // Reset prompt expanded when item changes
  useEffect(() => { setPromptExpanded(false); }, [activeItem?.id]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape + arrow key navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (hasMultiple && e.key === 'ArrowLeft') goPrev();
      if (hasMultiple && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, hasMultiple, goPrev, goNext]);

  if (!open || !activeItem) return null;

  const handleDownload = async () => {
    await saveOrShareImage(activeItem.imageUrl, buildLibraryFileName(activeItem));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (activeItem.source === 'freestyle') {
        const { error } = await supabase.from('freestyle_generations').delete().eq('id', activeItem.id);
        if (error) throw error;
      } else {
        const dashIndex = activeItem.id.lastIndexOf('-');
        const jobId = activeItem.id.substring(0, dashIndex);
        const imageIndex = parseInt(activeItem.id.substring(dashIndex + 1), 10);

        const { data: job } = await supabase
          .from('generation_jobs')
          .select('results')
          .eq('id', jobId)
          .maybeSingle();

        if (job) {
          const results = job.results as any[];
          if (results.length <= 1) {
            const { error } = await supabase.from('generation_jobs').delete().eq('id', jobId);
            if (error) throw error;
          } else {
            const updated = results.filter((_: any, i: number) => i !== imageIndex);
            const { error } = await supabase.from('generation_jobs').update({ results: updated }).eq('id', jobId);
            if (error) throw error;
          }
        }
      }
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
      queryClient.invalidateQueries({ queryKey: ['generation_jobs'] });
      onClose();
    } catch {
      toast.error('Failed to delete');
    }
    setDeleting(false);
  };

  const isUpscaled = activeItem.quality?.startsWith('upscaled_') || activeItem.quality === 'upscaled';
  const upscaleLabel = activeItem.quality === 'upscaled_4k' ? '4K' : activeItem.quality === 'upscaled_2k' ? '2K' : activeItem.quality === 'upscaled' ? 'HD' : null;

  return createPortal(
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
        style={{ margin: 0, padding: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />

        {/* Split layout */}
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left — Image */}
          <div className="relative w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12 group/img">
            <ShimmerImage
              src={activeItem.imageUrl}
              alt={activeItem.label}
              className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
              wrapperClassName="flex items-center justify-center max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)]"
            />

            {/* Multi-image navigation arrows */}
            {hasMultiple && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/20 dark:bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/30 dark:hover:bg-white/25 hover:text-white transition-all md:opacity-0 md:group-hover/img:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/20 dark:bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-black/30 dark:hover:bg-white/25 hover:text-white transition-all md:opacity-0 md:group-hover/img:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Right — Info panel */}
          <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-7 h-7" strokeWidth={2} />
            </button>

            <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
              {/* Source + label */}
              <div className="space-y-2">
              {(() => {
                  const slugCategoryMap: Record<string, string> = {
                    'product-images': 'PRODUCT VISUALS',
                    'virtual-try-on-set': 'VIRTUAL TRY-ON',
                    'virtual-tryon': 'VIRTUAL TRY-ON',
                    'catalog-studio': 'CATALOG STUDIO',
                    'text-to-product': 'TEXT TO PRODUCT',
                  };

                  let smallLabel: string;
                  let heading: string;

                  if (isUpscaled) {
                    smallLabel = 'Enhanced';
                    heading = 'Enhanced';
                  } else if (activeItem.workflowSlug && slugCategoryMap[activeItem.workflowSlug]) {
                    smallLabel = slugCategoryMap[activeItem.workflowSlug];
                    heading = activeItem.productName
                      || (activeItem.modelName && activeItem.sceneName ? `${activeItem.modelName} · ${activeItem.sceneName}` : '')
                      || activeItem.modelName
                      || (activeItem.label.includes(' — ') ? activeItem.label.split(' — ')[1] : activeItem.label);
                  } else if (activeItem.workflowSlug) {
                    smallLabel = activeItem.workflowSlug.replace(/-/g, ' ').toUpperCase();
                    heading = activeItem.productName || activeItem.label;
                  } else if (activeItem.source === 'freestyle') {
                    smallLabel = 'FREESTYLE';
                    heading = activeItem.modelName && activeItem.sceneName
                      ? `${activeItem.modelName} · ${activeItem.sceneName}`
                      : activeItem.modelName || activeItem.label;
                  } else {
                    const hasSeparator = activeItem.label.includes(' — ');
                    smallLabel = hasSeparator ? activeItem.label.split(' — ')[0].toUpperCase() : 'GENERATION';
                    heading = hasSeparator ? activeItem.label.split(' — ')[1] : activeItem.label;
                  }
                  return (
                    <>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                        {smallLabel}
                      </p>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight flex items-center gap-2">
                        {heading}
                        {upscaleLabel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> {upscaleLabel}
                          </span>
                        )}
                      </h2>
                    </>
                  );
                })()}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {activeItem.date}
                  </span>
                </div>
              </div>

              {/* Prompt */}
              {activeItem.prompt && !isUpscaled && (() => {
                const isLong = activeItem.prompt!.length > 150;
                const displayText = isLong && !promptExpanded ? `${activeItem.prompt!.slice(0, 150)}…` : activeItem.prompt;
                return (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                      Prompt
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {displayText}
                      {isLong && (
                        <button
                          onClick={() => setPromptExpanded(!promptExpanded)}
                          className="ml-1 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                        >
                          {promptExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </p>
                  </div>
                );
              })()}

              {/* Upscaling in-progress state */}
              {isUpscaling && (() => {
                const luna = TEAM_MEMBERS.find(m => m.name === 'Luna');
                return (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in">
                    <Avatar className="w-10 h-10 ring-2 ring-primary/30 animate-pulse">
                      <AvatarImage src={getOptimizedUrl(luna?.avatar, { quality: 60 })} alt="Luna" />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">LP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Luna is enhancing this image…</p>
                      <p className="text-xs text-muted-foreground">Adding detail and sharpness</p>
                    </div>
                    <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleDownload}
                  size="pill"
                  className="w-full font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
                >
                  <Download className="w-4 h-4 mr-2" /> {isMobileDevice() ? 'Save to Photos' : 'Download Image'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/freestyle?editImage=${encodeURIComponent(activeItem.imageUrl)}&imageRole=edit`);
                    onClose();
                  }}
                  className="w-full font-medium"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Image
                </Button>

                {activeItem.source === 'freestyle' && onCopySettings && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onCopySettings({
                        prompt: activeItem.prompt || '',
                        modelId: activeItem.modelId,
                        sceneId: activeItem.sceneId,
                        productId: activeItem.productId,
                        aspectRatio: activeItem.aspectRatio,
                      });
                      onClose();
                    }}
                    className="w-full font-medium"
                  >
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    Copy to Editor
                  </Button>
                )}

                {isUpscaling ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Enhancing in progress…
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setUpscaleModalOpen(true)}
                    className="w-full font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {upscaleLabel ? `Re-enhance (currently ${upscaleLabel})` : 'Enhance to 2K / 4K'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/perspectives?source=${encodeURIComponent(activeItem.imageUrl)}`)}
                  className="w-full font-medium"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Generate Perspectives
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/video/animate?imageUrl=${encodeURIComponent(activeItem.imageUrl)}`);
                    onClose();
                  }}
                  className="w-full font-medium"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>

                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>

              {/* Survey feedback — per image */}
              <ContextualFeedbackCard
                workflow="freestyle"
                questionText="How was this result?"
                buttonLabels={{ yes: 'Nailed it', almost: 'Almost', no: 'Not quite' }}
                reasonChips={['Prompt ignored', 'Product changed', 'Model/look off', 'Scene/style off', 'Bad composition', 'Not realistic', 'Low quality', 'Too slow']}
                textPlaceholder="What did you expect instead?"
                resultId={activeItem?.id}
                imageUrl={activeItem?.imageUrl}
                triggerType="result_ready"
              />

              {/* Share to Discover */}
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">Share to Explore</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submit your best work · Win up to 10,000 credits
                </p>
                <Button
                  onClick={() => setSubmitDiscoverOpen(true)}
                  variant="outline"
                  size="pill"
                  className="mt-3 w-full font-medium gap-1.5"
                >
                  <Send className="w-4 h-4" /> Submit for Review
                </Button>
              </div>

              {/* Social tag promo */}
              <div className="bg-card border border-border/60 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-muted-foreground shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">Tag Us, Win a Free Year</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Post your creation on social media with{' '}
                  <a href="https://www.instagram.com/vovv.ai" target="_blank" rel="noopener noreferrer"
                     className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                    @vovv.ai
                  </a>{' '}
                  and <span className="font-medium text-foreground">#vovvai</span> — we pick winners every month for a full year of free access.
                </p>
                <Button
                  variant="outline"
                  size="pill"
                  className="mt-3 w-full font-medium gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText('Created with @vovv.ai #vovvai');
                    setCaptionCopied(true);
                    setTimeout(() => setCaptionCopied(false), 2000);
                    toast.success('Caption copied!');
                  }}
                >
                  {captionCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {captionCopied ? 'Copied!' : 'Copy Caption'}
                </Button>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="pt-5 border-t border-border/30">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                    Admin Actions
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSceneModalUrl(activeItem.imageUrl); setSceneModalPrompt(activeItem.prompt || ''); }}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" /> Add as Scene
                    </button>
                    <button
                      onClick={() => setModelModalUrl(activeItem.imageUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <User className="w-3.5 h-3.5" /> Add as Model
                    </button>
                    <button
                      onClick={() => setDiscoverModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" /> Add to Discover
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sceneModalUrl && (
        <AddSceneModal open={!!sceneModalUrl} onClose={() => setSceneModalUrl(null)} imageUrl={sceneModalUrl} sourcePrompt={sceneModalPrompt} />
      )}
      {modelModalUrl && (
        <AddModelModal open={!!modelModalUrl} onClose={() => setModelModalUrl(null)} imageUrl={modelModalUrl} />
      )}
      {discoverModalOpen && item && (
        <AddToDiscoverModal
          open={discoverModalOpen}
          onClose={() => setDiscoverModalOpen(false)}
          imageUrl={activeItem.imageUrl}
          prompt={activeItem.prompt || ''}
          aspectRatio={activeItem.aspectRatio}
          quality={activeItem.quality}
          workflowName={activeItem.source === 'generation' ? activeItem.label : undefined}
          workflowSlug={activeItem.workflowSlug}
          sceneName={activeItem.sceneName}
          modelName={activeItem.modelName}
          sceneImageUrl={activeItem.sceneImageUrl}
          modelImageUrl={activeItem.modelImageUrl}
          productName={activeItem.productName}
          productImageUrl={activeItem.productImageUrl}
        />
      )}
      {submitDiscoverOpen && item && (
        <SubmitToDiscoverModal
          open={submitDiscoverOpen}
          onClose={() => setSubmitDiscoverOpen(false)}
          imageUrl={activeItem.imageUrl}
          prompt={activeItem.prompt || ''}
          aspectRatio={activeItem.aspectRatio}
          quality={activeItem.quality}
          productName={activeItem.productName}
          productImageUrl={activeItem.productImageUrl}
        />
      )}
      {upscaleModalOpen && item && (
        <UpscaleModal
          open={upscaleModalOpen}
          onClose={() => setUpscaleModalOpen(false)}
          items={[{
            imageUrl: activeItem.imageUrl,
            sourceType: activeItem.source as 'freestyle' | 'generation',
            sourceId: activeItem.id,
          }]}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            onClose();
          }}
        />
      )}
    </>,
    document.body
  );
}
