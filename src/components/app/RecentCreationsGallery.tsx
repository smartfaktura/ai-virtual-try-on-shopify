import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Eye, Compass, X, Sparkles, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toSignedUrl } from '@/lib/signedUrl';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { toast } from 'sonner';

interface CreationItem {
  id: string;
  imageUrl: string;
  label: string;
  subtitle?: string;
  date: string;
  rawDate: string;
}

export function RecentCreationsGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<DiscoverPreset | null>(null);

  const { data: presets = [] } = useDiscoverPresets();

  const { data: creations = [], isLoading } = useQuery({
    queryKey: ['recent-creations', user?.id],
    queryFn: async () => {
      const items: CreationItem[] = [];

      const [jobsResult, freestyleResult] = await Promise.all([
        supabase
          .from('generation_jobs')
          .select('id, results, created_at, workflows(name), user_products(title, image_url)')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, quality, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (!jobsResult.error) {
        for (const job of jobsResult.data ?? []) {
          const results = job.results as any;
          const workflowName = (job.workflows as any)?.name;
          const productTitle = (job.user_products as any)?.title;
          let pushed = false;

          if (Array.isArray(results)) {
            for (let i = 0; i < results.length; i++) {
              const r = results[i];
              const url = typeof r === 'string' ? r : r?.url || r?.image_url;
              if (url) {
                const isTryOn = url.includes('tryon-images');
                const label = isTryOn ? 'Virtual Try-On' : (workflowName || 'Product Shot');
                const signedUrl = await toSignedUrl(url);
                items.push({
                  id: `${job.id}-${i}`,
                  imageUrl: signedUrl,
                  label,
                  subtitle: productTitle || undefined,
                  date: new Date(job.created_at).toLocaleDateString(),
                  rawDate: job.created_at,
                });
                pushed = true;
              }
            }
          }

          if (!pushed) {
            const fallback = (job.user_products as any)?.image_url;
            if (fallback) {
              items.push({
                id: job.id,
                imageUrl: fallback,
                label: workflowName || 'Product Shot',
                subtitle: productTitle || undefined,
                date: new Date(job.created_at).toLocaleDateString(),
                rawDate: job.created_at,
              });
            }
          }
        }
      }

      if (!freestyleResult.error) {
        for (const f of freestyleResult.data ?? []) {
          const signedUrl = await toSignedUrl(f.image_url);
          const isUpscaled = f.quality?.startsWith('upscaled_');
          const resolution = f.quality?.includes('4k') ? '4K' : '2K';
          items.push({
            id: f.id,
            imageUrl: signedUrl,
            label: isUpscaled ? 'Enhanced' : 'Freestyle',
            subtitle: isUpscaled ? `${resolution} Upscale` : undefined,
            date: new Date(f.created_at).toLocaleDateString(),
            rawDate: f.created_at,
          });
        }
      }

      items.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
      return items.slice(0, 10);
    },
    enabled: !!user,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-shrink-0 w-[180px] aspect-[4/5] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isPlaceholder = creations.length === 0;

  // Use featured discover presets for new users
  const featuredPresets = presets.filter(p => p.is_featured).slice(0, 10);
  const discoverPresets = featuredPresets.length > 0 ? featuredPresets : presets.slice(0, 10);

  const displayItems: CreationItem[] = isPlaceholder
    ? discoverPresets.map((p) => ({
        id: p.id,
        imageUrl: p.image_url,
        label: p.category.charAt(0).toUpperCase() + p.category.slice(1),
        subtitle: p.title,
        date: '',
        rawDate: '',
      }))
    : creations;

  const handleCardClick = (item: CreationItem) => {
    if (isPlaceholder) {
      const preset = discoverPresets.find(p => p.id === item.id);
      if (preset) setSelectedPreset(preset);
    } else {
      navigate('/app/library');
    }
  };


  const handleUseStyle = (preset: DiscoverPreset) => {
    setSelectedPreset(null);
    navigate('/app/freestyle', { state: { prefillPrompt: preset.prompt } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {isPlaceholder ? 'What You Can Create' : 'Recent Creations'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPlaceholder
              ? 'Explore scenes and styles to get started.'
              : 'Your latest generated visuals.'}
          </p>
        </div>
        {isPlaceholder ? (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/discover')}>
            <Compass className="w-3.5 h-3.5" /> View More
          </Button>
        ) : (
          <Button variant="link" className="text-sm font-medium gap-1" onClick={() => navigate('/app/library')}>
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className="flex gap-4 overflow-x-auto pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[180px] group cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border relative shadow-sm">
                <ShimmerImage
                  src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  aspectRatio="4/5"
                  onError={(e: any) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  {item.subtitle && <p className="text-[10px] text-white/70 truncate">{item.subtitle}</p>}
                  {item.date && <p className="text-[10px] text-white/50">{item.date}</p>}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" /> {isPlaceholder ? 'Preview' : 'View'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset preview — Discover-style split modal */}
      {selectedPreset && <PresetDetailOverlay preset={selectedPreset} onClose={() => setSelectedPreset(null)} onUseStyle={handleUseStyle} navigate={navigate} />}
    </div>
  );
}

function PresetDetailOverlay({ preset, onClose, onCopyPrompt, onUseStyle, navigate }: {
  preset: DiscoverPreset;
  onClose: () => void;
  onCopyPrompt: (prompt: string) => void;
  onUseStyle: (preset: DiscoverPreset) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
      style={{ margin: 0, padding: 0 }}
      onClick={onClose}
    >
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — Image */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          <ShimmerImage
            src={getOptimizedUrl(preset.image_url, { quality: 80 })}
            alt={preset.title}
            wrapperClassName="flex items-center justify-center"
            className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right — Controls */}
        <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
          <button onClick={onClose} className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors">
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
            {/* Category + Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {preset.category}
                </p>
                {preset.workflow_name && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/70">
                    · <Workflow className="w-3 h-3" /> {preset.workflow_name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{preset.title}</h2>
              <div className="flex items-center gap-2 pt-0.5">
                {preset.model_name && <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{preset.model_name}</span>}
                {preset.scene_name && <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">· {preset.scene_name}</span>}
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">Prompt</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{preset.prompt}</p>
            </div>

            {/* Tags */}
            {preset.tags && preset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {preset.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/70 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary CTA */}
            <Button
              onClick={() => onUseStyle(preset)}
              className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Use This Style
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Workflow CTA */}
            {preset.workflow_slug && (
              <Button
                variant="outline"
                onClick={() => { onClose(); navigate(`/app/generate?workflow=${preset.workflow_slug}`); }}
                className="w-full h-11 rounded-xl text-sm font-medium gap-2 border-primary/20 hover:bg-primary/5"
              >
                <Workflow className="w-4 h-4" />
                Try {preset.workflow_name || 'This Workflow'}
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Button>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onCopyPrompt(preset.prompt)}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
