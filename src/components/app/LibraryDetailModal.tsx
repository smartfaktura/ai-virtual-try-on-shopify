import { useState, useEffect } from 'react';
import { saveOrShareImage, isMobileDevice } from '@/lib/mobileImageSave';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2, Camera, User, X, Sparkles, Globe, Send, Trophy, Maximize, Layers, Video, AtSign, Copy, Check, ClipboardCopy, Pencil } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';
import { AddToDiscoverModal } from '@/components/app/AddToDiscoverModal';
import { SubmitToDiscoverModal } from '@/components/app/SubmitToDiscoverModal';
import { UpscaleModal } from '@/components/app/UpscaleModal';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { LibraryItem } from '@/components/app/LibraryImageCard';


interface LibraryDetailModalProps {
  item: LibraryItem | null;
  open: boolean;
  onClose: () => void;
  isUpscaling?: boolean;
  onCopySettings?: (settings: { prompt: string; modelId?: string | null; sceneId?: string | null; productId?: string | null; aspectRatio?: string }) => void;
}

export function LibraryDetailModal({ item, open, onClose, isUpscaling, onCopySettings }: LibraryDetailModalProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [sceneModalUrl, setSceneModalUrl] = useState<string | null>(null);
  const [modelModalUrl, setModelModalUrl] = useState<string | null>(null);
  const [discoverModalOpen, setDiscoverModalOpen] = useState(false);
  const [submitDiscoverOpen, setSubmitDiscoverOpen] = useState(false);
  const [upscaleModalOpen, setUpscaleModalOpen] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  // Reset prompt expanded when item changes
  useEffect(() => { setPromptExpanded(false); }, [item?.id]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !item) return null;

  const handleDownload = async () => {
    await saveOrShareImage(item.imageUrl, `${item.label.replace(/\s+/g, '-').toLowerCase()}-${item.id.slice(0, 8)}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (item.source === 'freestyle') {
        const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
        if (error) throw error;
      } else {
        const dashIndex = item.id.lastIndexOf('-');
        const jobId = item.id.substring(0, dashIndex);
        const imageIndex = parseInt(item.id.substring(dashIndex + 1), 10);

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

  const isUpscaled = item.quality?.startsWith('upscaled_') || item.quality === 'upscaled';
  const upscaleLabel = item.quality === 'upscaled_4k' ? '4K' : item.quality === 'upscaled_2k' ? '2K' : item.quality === 'upscaled' ? 'HD' : null;

  return (
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
          <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
            <ShimmerImage
              src={item.imageUrl}
              alt={item.label}
              className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
              wrapperClassName="flex items-center justify-center max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)]"
            />
          </div>

          {/* Right — Info panel */}
          <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-7 h-7" strokeWidth={2} />
            </button>

            <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
              {/* Source + label */}
              <div className="space-y-2">
                {(() => {
                  const hasSeparator = item.label.includes(' — ');
                  const smallLabel = isUpscaled ? 'Enhanced' : item.source === 'freestyle' ? 'Freestyle Generation' : hasSeparator ? item.label.split(' — ')[0] : 'Generation';
                  const heading = isUpscaled ? 'Enhanced' : hasSeparator ? item.label.split(' — ')[1] : item.label;
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
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Prompt */}
              {item.prompt && !isUpscaled && (() => {
                const isLong = item.prompt!.length > 150;
                const displayText = isLong && !promptExpanded ? `${item.prompt!.slice(0, 150)}…` : item.prompt;
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
                      <AvatarImage src={luna?.avatar} alt="Luna" />
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
                  className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
                >
                  <Download className="w-4 h-4 mr-2" /> {isMobileDevice() ? 'Save to Photos' : 'Download Image'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/app/freestyle?editImage=${encodeURIComponent(item.imageUrl)}&imageRole=edit`);
                    onClose();
                  }}
                  className="w-full h-11 rounded-xl text-sm font-medium"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Image
                </Button>

                {item.source === 'freestyle' && onCopySettings && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onCopySettings({
                        prompt: item.prompt || '',
                        modelId: item.modelId,
                        sceneId: item.sceneId,
                        productId: item.productId,
                        aspectRatio: item.aspectRatio,
                      });
                      onClose();
                    }}
                    className="w-full h-11 rounded-xl text-sm font-medium"
                  >
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    Copy to Editor
                  </Button>
                )}

                {isUpscaling ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full h-11 rounded-xl text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Enhancing in progress…
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setUpscaleModalOpen(true)}
                    className="w-full h-11 rounded-xl text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {upscaleLabel ? `Re-enhance (currently ${upscaleLabel})` : 'Enhance to 2K / 4K'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/perspectives?source=${encodeURIComponent(item.imageUrl)}`)}
                  className="w-full h-11 rounded-xl text-sm font-medium"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Generate Perspectives
                </Button>

                <Button
                  variant="outline"
                  disabled
                  className="w-full h-11 rounded-xl text-sm font-medium"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video
                  <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coming Soon</span>
                </Button>

                <Separator className="my-1" />
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full h-10 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>

              {/* Share to Discover */}
              <div className="rounded-xl border border-border/40 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Share to Discover</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Submit your best work · Win up to 10,000 credits
                </p>
                <Button
                  onClick={() => setSubmitDiscoverOpen(true)}
                  className="w-full h-11 rounded-xl text-sm font-medium"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit for Review
                </Button>
              </div>

              {/* Social tag promo */}
              <div className="rounded-xl border border-border/40 bg-muted/30 p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <AtSign className="w-5 h-5 text-muted-foreground/70" />
                  <h3 className="text-base font-semibold text-foreground">Tag Us, Win a Free Year</h3>
                </div>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">
                  Post your creation on social media with{' '}
                  <a href="https://www.instagram.com/vovv.ai" target="_blank" rel="noopener noreferrer"
                     className="font-medium text-foreground underline underline-offset-2 hover:text-primary transition-colors">
                    @vovv.ai
                  </a>{' '}
                  and <span className="font-medium text-foreground">#vovvai</span> — we pick winners every month for a full year of free access.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg text-xs font-medium gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText('Created with @vovv.ai #vovvai');
                    setCaptionCopied(true);
                    setTimeout(() => setCaptionCopied(false), 2000);
                    toast.success('Caption copied!');
                  }}
                >
                  {captionCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
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
                      onClick={() => setSceneModalUrl(item.imageUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" /> Add as Scene
                    </button>
                    <button
                      onClick={() => setModelModalUrl(item.imageUrl)}
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
        <AddSceneModal open={!!sceneModalUrl} onClose={() => setSceneModalUrl(null)} imageUrl={sceneModalUrl} />
      )}
      {modelModalUrl && (
        <AddModelModal open={!!modelModalUrl} onClose={() => setModelModalUrl(null)} imageUrl={modelModalUrl} />
      )}
      {discoverModalOpen && item && (
        <AddToDiscoverModal
          open={discoverModalOpen}
          onClose={() => setDiscoverModalOpen(false)}
          imageUrl={item.imageUrl}
          prompt={item.prompt || ''}
          aspectRatio={item.aspectRatio}
          quality={item.quality}
          workflowName={item.source === 'generation' ? item.label : undefined}
          workflowSlug={item.workflowSlug}
          sceneName={item.sceneName}
          modelName={item.modelName}
          sceneImageUrl={item.sceneImageUrl}
          modelImageUrl={item.modelImageUrl}
          productName={item.productName}
          productImageUrl={item.productImageUrl}
        />
      )}
      {submitDiscoverOpen && item && (
        <SubmitToDiscoverModal
          open={submitDiscoverOpen}
          onClose={() => setSubmitDiscoverOpen(false)}
          imageUrl={item.imageUrl}
          prompt={item.prompt || ''}
          aspectRatio={item.aspectRatio}
          quality={item.quality}
          productName={item.productName}
          productImageUrl={item.productImageUrl}
        />
      )}
      {upscaleModalOpen && item && (
        <UpscaleModal
          open={upscaleModalOpen}
          onClose={() => setUpscaleModalOpen(false)}
          items={[{
            imageUrl: item.imageUrl,
            sourceType: item.source as 'freestyle' | 'generation',
            sourceId: item.id,
          }]}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            onClose();
          }}
        />
      )}
    </>
  );
}
