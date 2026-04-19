import { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Download, Trash2, Copy, ShieldAlert, X, Pencil, Camera, User, Wand2, Send, Globe, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/lib/brandedToast';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';
import { SubmitToDiscoverModal } from '@/components/app/SubmitToDiscoverModal';
import { AddToDiscoverModal } from '@/components/app/AddToDiscoverModal';
import { mockModels, mockTryOnPoses } from '@/data/mockData';

import { getLandingAssetUrl } from '@/lib/landingAssets';

const teamAvatar = (file: string) => getLandingAssetUrl(`team/${file}`);

const STUDIO_CREW = [
  { name: 'Sophia', avatar: teamAvatar('avatar-sophia.jpg') },
  { name: 'Luna', avatar: teamAvatar('avatar-luna.jpg') },
  { name: 'Kenji', avatar: teamAvatar('avatar-kenji.jpg') },
] as const;

const STATUS_MESSAGES = [
  'Setting up the lighting…',
  'Composing the scene…',
  'Styling the shot…',
  'Refining the details…',
  'Adjusting the colors…',
  'Adding finishing touches…',
];

const RATIO_MAP: Record<string, string> = {
  '1:1': '1/1',
  '3:4': '3/4',
  '4:5': '4/5',
  '9:16': '9/16',
  '16:9': '16/9',
};

export interface BlockedEntry {
  id: string;
  prompt: string;
  reason: string;
}

export type FailedErrorType = 'timeout' | 'rate_limit' | 'generic';

export interface FailedEntry {
  id: string;
  prompt: string;
  errorType: FailedErrorType;
  message: string;
}

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  userPrompt?: string | null;
  aspectRatio?: string;
  modelId?: string | null;
  sceneId?: string | null;
  productId?: string | null;
  providerUsed?: string | null;
}

export interface CopySettings {
  prompt: string;
  modelId?: string | null;
  sceneId?: string | null;
  productId?: string | null;
  aspectRatio?: string;
}

interface FreestyleGalleryProps {
  images: GalleryImage[];
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  onCopySettings?: (settings: CopySettings) => void;
  generatingCount?: number;
  generatingProgress?: number;
  generatingAspectRatio?: string;
  blockedEntries?: BlockedEntry[];
  onDismissBlocked?: (id: string) => void;
  onEditBlockedPrompt?: (prompt: string) => void;
  failedEntries?: FailedEntry[];
  onDismissFailed?: (id: string) => void;
  onRetryFailed?: (id: string, prompt: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  upscalingSourceIds?: Set<string>;
}

function GeneratingCard({ progress = 0, aspectRatio, className }: { progress?: number; aspectRatio?: string; className?: string }) {
  const [crew] = useState(() => STUDIO_CREW[Math.floor(Math.random() * STUDIO_CREW.length)]);
  const [msgIdx, setMsgIdx] = useState(0);
  const cssRatio = RATIO_MAP[aspectRatio || '1:1'] || '1/1';
  const isWide = aspectRatio === '16:9' || aspectRatio === '3:2';

  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % STATUS_MESSAGES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden flex items-center justify-center',
        'border border-border/30 w-full',
        'bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer',
        isWide ? 'flex-row gap-4 sm:gap-6 px-6 sm:px-10' : 'flex-col gap-3 sm:gap-5 px-4 sm:px-8',
        className,
      )}
      style={{ aspectRatio: cssRatio }}
    >
      {/* Avatar with glow ring */}
      <div className="relative flex-shrink-0">
        <div className={cn('absolute rounded-full bg-primary/20 animate-[pulse_2s_ease-in-out_infinite]', isWide ? '-inset-1' : '-inset-1 sm:-inset-1.5')} />
        <img
          src={getOptimizedUrl(crew.avatar, { quality: 60 })}
          alt={crew.name}
          className={cn('relative rounded-full object-cover ring-2 ring-primary/40', isWide ? 'w-10 h-10' : 'w-10 h-10 sm:w-16 sm:h-16')}
        />
      </div>

      <div className={cn(isWide ? 'flex flex-col gap-1.5 min-w-0' : 'contents')}>
        {/* Status text */}
        <div className={cn('space-y-0.5', isWide ? 'text-left' : 'text-center min-h-0 sm:min-h-[3.5rem] space-y-1.5')}>
          <p className="text-xs sm:text-sm font-medium text-foreground/70">
            {crew.name} is working on this…
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/60 transition-opacity duration-300">
            {STATUS_MESSAGES[msgIdx]}
          </p>
        </div>

        {/* Progress bar */}
        <div className={cn('space-y-1', isWide ? 'w-full max-w-[180px]' : 'w-full max-w-[140px] sm:max-w-[200px] sm:space-y-2')}>
          <Progress value={progress} className="h-1" />
          <p className={cn('text-[10px] sm:text-xs text-muted-foreground/40', isWide ? 'text-left' : 'text-center')}>Wrapping up shortly</p>
        </div>
      </div>
    </div>
  );
}

function ContentBlockedCard({
  entry,
  onDismiss,
  onEditPrompt,
  className,
}: {
  entry: BlockedEntry;
  onDismiss?: (id: string) => void;
  onEditPrompt?: (prompt: string) => void;
  className?: string;
}) {
  const [crew] = useState(() => STUDIO_CREW[Math.floor(Math.random() * STUDIO_CREW.length)]);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 sm:gap-4 px-6',
        'w-full',
        'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
        className,
      )}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Avatar with subtle glow */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-full bg-red-500/15 animate-[pulse_3s_ease-in-out_infinite]" />
        <img
          src={getOptimizedUrl(crew.avatar, { quality: 60 })}
          alt={crew.name}
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/20"
        />
      </div>

      {/* Copy */}
      <div className="text-center space-y-1.5 max-w-[220px]">
        <p className="text-xs sm:text-sm font-medium text-white/80">
          {crew.name} couldn't create this
        </p>
        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed">
          Your prompt was flagged by our content policy. Credits have been refunded.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 mt-1">
        {onEditPrompt && (
          <button
            onClick={() => onEditPrompt(entry.prompt)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-white text-[#0f172a] hover:bg-white/90 transition-colors shadow-md"
          >
            <Pencil className="w-3 h-3" />
            Rephrase prompt
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(entry.id)}
            className="text-[10px] sm:text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
const FAILED_MESSAGES: Record<FailedErrorType, (name: string) => { title: string; body: string }> = {
  timeout: (name) => ({
    title: `${name} ran out of time on this one`,
    body: 'Complex prompts with multiple references can take longer. Your credits have been refunded.',
  }),
  rate_limit: (name) => ({
    title: `${name} is handling a lot right now`,
    body: 'Our AI is processing a high volume of requests right now. Your credits have been refunded — try again in a minute or two.',
  }),
  generic: (name) => ({
    title: `${name} hit an unexpected issue`,
    body: 'Something unexpected happened on our end. Credits refunded — try again shortly.',
  }),
};

function GenerationFailedCard({
  entry,
  onDismiss,
  onRetry,
  className,
}: {
  entry: FailedEntry;
  onDismiss?: (id: string) => void;
  onRetry?: (prompt: string) => void;
  className?: string;
}) {
  const [crew] = useState(() => STUDIO_CREW[Math.floor(Math.random() * STUDIO_CREW.length)]);
  const { isAdmin: isAdminFlag } = useIsAdmin();
  const msg = FAILED_MESSAGES[entry.errorType](crew.name);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 sm:gap-4 px-6',
        'w-full',
        'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]',
        className,
      )}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-full bg-amber-500/15 animate-[pulse_3s_ease-in-out_infinite]" />
        <img
          src={getOptimizedUrl(crew.avatar, { quality: 60 })}
          alt={crew.name}
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/20"
        />
      </div>

      {/* Copy */}
      <div className="text-center space-y-1.5 max-w-[220px]">
        <p className="text-xs sm:text-sm font-medium text-white/80">
          {msg.title}
        </p>
        <p className="text-[10px] sm:text-xs text-white/40 leading-relaxed">
          {msg.body}
        </p>
      </div>

      {/* Admin-only raw error detail */}
      {isAdminFlag && entry.message && (
        <div className="w-full max-w-[260px] text-[9px] font-mono bg-white/5 rounded p-2 text-white/30 break-all leading-relaxed">
          {entry.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 mt-1">
        {onDismiss && (
          <button
            onClick={() => onDismiss(entry.id)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

function UpscalingOverlay() {
  const luna = STUDIO_CREW.find(m => m.name === 'Luna')!;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-[3px] rounded-xl">
      <img src={getOptimizedUrl(luna.avatar, { quality: 60 })} alt="Luna" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 mb-2" />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[11px] font-medium text-primary">Luna is enhancing…</span>
      </div>
    </div>
  );
}

function getProviderLabel(provider: string): string {
  if (provider.includes('seedream')) return 'SDR';
  if (provider.includes('pro')) return 'PRO';
  if (provider.includes('flash')) return 'FLASH';
  return provider.slice(0, 5).toUpperCase();
}

function ImageCard({
  img,
  idx,
  onDownload,
  onExpand,
  onDelete,
  onCopySettings,
  onAddAsScene,
  onAddAsModel,
  onShareToDiscover,
  onAddToDiscover,
  className,
  natural,
  isUpscaling,
  isAdmin,
}: {
  img: GalleryImage;
  idx: number;
  onDownload: (imageUrl: string, index: number) => void;
  onExpand: (index: number) => void;
  onDelete?: (imageId: string) => void;
  onCopySettings?: (settings: CopySettings) => void;
  onAddAsScene?: (imageUrl: string, prompt: string) => void;
  onAddAsModel?: (imageUrl: string) => void;
  onShareToDiscover?: (img: { id: string; url: string; prompt: string; aspectRatio?: string; productId?: string | null }) => void;
  onAddToDiscover?: (img: { id: string; url: string; prompt: string; aspectRatio?: string }) => void;
  className?: string;
  natural?: boolean;
  isUpscaling?: boolean;
  isAdmin?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const prevSrcRef = useRef(img.url);

  // When URL changes (new signed URL for same image), preserve loaded state
  useEffect(() => {
    if (prevSrcRef.current !== img.url) {
      prevSrcRef.current = img.url;
      // Don't reset loaded — same image, just a new signed URL
    }
  }, [img.url]);

  const actionButtons = (
    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {onCopySettings && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopySettings({
                prompt: img.userPrompt || img.prompt,
                modelId: img.modelId,
                sceneId: img.sceneId,
                productId: img.productId,
                aspectRatio: img.aspectRatio,
              });
              toast.success('Settings copied to editor');
            }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            title="Copy settings to editor"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
        {onAddAsScene && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddAsScene(img.url, img.prompt || ''); }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            title="Add as Scene"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
        {onAddAsModel && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddAsModel(img.url); }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            title="Add as Model"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onAddToDiscover && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToDiscover(img); }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-emerald-500/40 transition-colors"
            title="Add to Discover"
          >
            <Globe className="w-4 h-4" />
          </button>
        )}
        {onShareToDiscover && (
          <button
            onClick={(e) => { e.stopPropagation(); onShareToDiscover(img); }}
            className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary/40 transition-colors"
            title="Share to Explore"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(img.url, idx); }}
          className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const imgAspectStyle = img.aspectRatio ? { aspectRatio: RATIO_MAP[img.aspectRatio] || undefined } : undefined;

  if (natural) {
    return (
      <div
        className={cn(
          'group relative inline-block cursor-pointer animate-fade-in',
          !loaded && 'bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer rounded-xl',
          className,
        )}
        style={imgAspectStyle}
        onClick={() => onExpand(idx)}
      >
        <img
        src={getOptimizedUrl(img.url, { quality: 75 })}
        alt={`Generated ${idx + 1}`}
        className={cn(
          'w-auto h-auto max-w-full max-h-[50vh] sm:max-h-[calc(100vh-400px)] rounded-xl shadow-md shadow-black/20 transition-opacity duration-700 ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isAdmin && img.providerUsed && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-black/60 text-white text-[9px] px-1.5 py-0 font-bold shadow-md border-0">
              {getProviderLabel(img.providerUsed)}
            </Badge>
          </div>
        )}
        {isUpscaling && <UpscalingOverlay />}
        {actionButtons}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl shadow-md shadow-black/20 cursor-pointer animate-fade-in',
        !loaded && 'bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
      style={imgAspectStyle}
      onClick={() => onExpand(idx)}
    >
      <img
        src={getOptimizedUrl(img.url, { quality: 60 })}
        alt={`Generated ${idx + 1}`}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {isAdmin && img.providerUsed && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="bg-black/60 text-white text-[9px] px-1.5 py-0 font-bold shadow-md border-0">
            {getProviderLabel(img.providerUsed)}
          </Badge>
        </div>
      )}
      {isUpscaling && <UpscalingOverlay />}
      {actionButtons}
    </div>
  );
}

export function FreestyleGallery({ images, onDownload, onExpand, onDelete, onCopySettings, generatingCount = 0, generatingProgress = 0, generatingAspectRatio, blockedEntries = [], onDismissBlocked, onEditBlockedPrompt, failedEntries = [], onDismissFailed, onRetryFailed, onLoadMore, hasMore, isFetchingMore, upscalingSourceIds }: FreestyleGalleryProps) {
  const { isAdmin } = useIsAdmin();
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore || isFetchingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isFetchingMore]);
  const [sceneModalUrl, setSceneModalUrl] = useState<string | null>(null);
  const [sceneModalPrompt, setSceneModalPrompt] = useState<string>('');
  const [modelModalUrl, setModelModalUrl] = useState<string | null>(null);
  const [shareImg, setShareImg] = useState<{ url: string; prompt: string; aspectRatio?: string; id?: string; productId?: string | null } | null>(null);
  const [addToDiscoverImg, setAddToDiscoverImg] = useState<{ id: string; url: string; prompt: string; aspectRatio?: string; modelId?: string | null; sceneId?: string | null } | null>(null);

  // Resolve product info for share modal
  const shareProductId = shareImg?.productId;
  const { data: shareProduct } = useQuery({
    queryKey: ['product-for-share', shareProductId],
    queryFn: async () => {
      const { data } = await supabase.from('user_products').select('title, image_url').eq('id', shareProductId!).single();
      return data;
    },
    enabled: !!shareProductId,
  });

  const hasContent = images.length > 0 || generatingCount > 0 || blockedEntries.length > 0 || failedEntries.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-24 h-24 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center mb-6">
          <Wand2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-light tracking-tight text-foreground/80 mb-3">
          Freestyle Studio
        </h2>
        <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed">
          Describe what you want to create, attach a reference, pick a model or scene — your creations appear here.
        </p>
      </div>
    );
  }

  const adminSceneHandler = isAdmin ? (url: string, prompt: string) => { setSceneModalUrl(url); setSceneModalPrompt(prompt); } : undefined;
  const adminModelHandler = isAdmin ? (url: string) => setModelModalUrl(url) : undefined;
  const shareHandler = (img: { id: string; url: string; prompt: string; aspectRatio?: string; productId?: string | null }) => setShareImg(img);
  const addToDiscoverHandler = isAdmin ? (img: GalleryImage) => setAddToDiscoverImg(img) : undefined;

  const generatingCards = generatingCount > 0
    ? Array.from({ length: generatingCount }, (_, i) => (
        <GeneratingCard key={`generating-${i}`} progress={generatingProgress} aspectRatio={generatingAspectRatio} />
      ))
    : [];

  const blockedCards = blockedEntries.map(entry => (
    <ContentBlockedCard
      key={`blocked-${entry.id}`}
      entry={entry}
      onDismiss={onDismissBlocked}
      onEditPrompt={onEditBlockedPrompt}
    />
  ));

  const failedCards = failedEntries.map(entry => (
    <GenerationFailedCard
      key={`failed-${entry.id}`}
      entry={entry}
      onDismiss={onDismissFailed}
      onRetry={(prompt) => onRetryFailed?.(entry.id, prompt)}
    />
  ));

  const count = images.length + generatingCount + blockedEntries.length + failedEntries.length;

  const imageCards = (natural?: boolean) => images.map((img, idx) => (
    <ImageCard
      key={img.id}
      img={img}
      idx={idx}
      onDownload={onDownload}
      onExpand={onExpand}
      onDelete={onDelete}
      onCopySettings={onCopySettings}
      onAddAsScene={adminSceneHandler}
      onAddAsModel={adminModelHandler}
      onShareToDiscover={shareHandler}
      onAddToDiscover={addToDiscoverHandler}
      natural={natural}
      isAdmin={isAdmin}
      isUpscaling={upscalingSourceIds?.has(img.id)}
    />
  ));

  const modals = (
    <>
      {sceneModalUrl && (
        <AddSceneModal open={!!sceneModalUrl} onClose={() => setSceneModalUrl(null)} imageUrl={sceneModalUrl} sourcePrompt={sceneModalPrompt} />
      )}
      {modelModalUrl && (
        <AddModelModal open={!!modelModalUrl} onClose={() => setModelModalUrl(null)} imageUrl={modelModalUrl} />
      )}
      {shareImg && (
        <SubmitToDiscoverModal
          open={!!shareImg}
          onClose={() => setShareImg(null)}
          imageUrl={shareImg.url}
          prompt={shareImg.prompt}
          aspectRatio={shareImg.aspectRatio}
          sourceGenerationId={shareImg.id}
          productName={shareProduct?.title}
          productImageUrl={shareProduct?.image_url}
        />
      )}
      {addToDiscoverImg && (
          <AddToDiscoverModal
            open={!!addToDiscoverImg}
            onClose={() => setAddToDiscoverImg(null)}
            imageUrl={addToDiscoverImg.url}
            prompt={addToDiscoverImg.prompt}
            aspectRatio={addToDiscoverImg.aspectRatio}
            modelId={addToDiscoverImg.modelId}
            sceneId={addToDiscoverImg.sceneId}
            sourceGenerationId={addToDiscoverImg.id}
          />
      )}
    </>
  );


  // Masonry layout: distribute all cards into 3 columns
  const allCards: React.ReactNode[] = [
    ...generatingCards,
    ...blockedCards,
    ...failedCards,
    ...imageCards(),
  ];
  const columnCount = isMobile ? 2 : 3;
  const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
  allCards.forEach((card, i) => columns[i % columnCount].push(card));

  return (
    <>
      <div className="flex gap-2.5 px-3 lg:px-1 pb-4">
        {columns.map((col, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2.5">
            {col}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-1" />}
      {isFetchingMore && (
        <div className="flex justify-center pb-6">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {modals}
    </>
  );
}
