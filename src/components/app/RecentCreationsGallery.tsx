import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Eye, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toSignedUrls } from '@/lib/signedUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

const CURATED_SCENE_IDS = [
  '5401494e-1aae-4953-8a10-bf90e525d980',
  '038e7ba5-0f3e-4679-8a1f-8a63a54b3baf',
  '83eda438-1afe-4bef-9250-1fc580a1affc',
  'ead64b8c-31eb-4427-9e1c-974021e5b7d8',
  'bf507e3a-ccd5-41b8-af12-f920e565cc60',
  '5c6c138a-3097-47cb-beaf-36fef3e6fb2c',
  'ff2ff0f9-535b-40a2-ba6f-75c846112123',
];

interface CreationItem {
  id: string;
  imageUrl: string;
  label: string;
  subtitle?: string;
  date: string;
  rawDate: string;
  source: 'generation' | 'freestyle';
  prompt?: string;
  aspectRatio?: string;
  quality?: string;
}

export function RecentCreationsGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const { data: curatedScenes = [] } = useQuery({
    queryKey: ['curated-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scenes')
        .select('id, name, category, image_url, optimized_image_url')
        .in('id', CURATED_SCENE_IDS)
        .eq('is_active', true);
      if (error) throw error;
      const ordered = CURATED_SCENE_IDS
        .map(id => (data as any[]).find(s => s.id === id))
        .filter(Boolean);
      return ordered;
    },
    staleTime: 10 * 60 * 1000,
  });

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
          .select('id, image_url, prompt, quality, aspect_ratio, created_at')
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
                items.push({
                  id: `${job.id}-${i}`,
                  imageUrl: url,
                  label,
                  subtitle: productTitle || undefined,
                  date: new Date(job.created_at).toLocaleDateString(),
                  rawDate: job.created_at,
                  source: 'generation',
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
                source: 'generation',
              });
            }
          }
        }
      }

      if (!freestyleResult.error) {
        for (const f of freestyleResult.data ?? []) {
          const isUpscaled = f.quality?.startsWith('upscaled_');
          const resolution = f.quality?.includes('4k') ? '4K' : '2K';
          items.push({
            id: f.id,
            imageUrl: f.image_url,
            label: isUpscaled ? 'Enhanced' : 'Freestyle',
            subtitle: isUpscaled ? `${resolution} Upscale` : undefined,
            date: new Date(f.created_at).toLocaleDateString(),
            rawDate: f.created_at,
            source: 'freestyle',
            prompt: f.prompt,
            aspectRatio: f.aspect_ratio,
            quality: f.quality,
          });
        }
      }

      items.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
      const top = items.slice(0, 10);

      // Batch-sign all URLs in 1-2 calls instead of sequential
      const rawUrls = top.map(i => i.imageUrl);
      const signedUrls = await toSignedUrls(rawUrls);
      for (let i = 0; i < top.length; i++) {
        top[i].imageUrl = signedUrls[i];
      }

      return top;
    },
    enabled: !!user,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const openItem = useCallback((item: CreationItem) => {
    const libraryItem: LibraryItem = {
      id: item.id,
      imageUrl: item.imageUrl,
      source: item.source,
      label: item.label,
      prompt: item.prompt,
      date: item.date,
      createdAt: item.rawDate,
      aspectRatio: item.aspectRatio,
      quality: item.quality,
    };
    setSelectedItem(libraryItem);
    setActiveItemId(null);
  }, []);

  const handleCardClick = useCallback((item: CreationItem, isPlaceholder: boolean) => {
    if (isPlaceholder) {
      navigate(`/app/freestyle?scene=custom-${item.id}`);
      return;
    }

    if (isMobile) {
      if (activeItemId === item.id) {
        // Second tap — open the item
        openItem(item);
      } else {
        // First tap — reveal overlay
        setActiveItemId(item.id);
      }
    } else {
      // Desktop — single click opens
      openItem(item);
    }
  }, [isMobile, activeItemId, navigate, openItem]);

  // Dismiss active overlay when tapping outside
  const handleContainerClick = useCallback(() => {
    if (isMobile && activeItemId) {
      setActiveItemId(null);
    }
  }, [isMobile, activeItemId]);

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

  const displayItems: CreationItem[] = isPlaceholder
    ? curatedScenes.map((s: any) => ({
        id: s.id,
        imageUrl: s.optimized_image_url || s.image_url,
        label: s.name,
        subtitle: s.category.charAt(0).toUpperCase() + s.category.slice(1),
        date: '',
        rawDate: '',
        source: 'generation' as const,
      }))
    : creations;

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

      <div className="relative" onClick={handleContainerClick}>
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className="flex gap-4 overflow-x-auto pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayItems.map((item) => {
            const isActive = isMobile && activeItemId === item.id;
            const showOverlay = isActive || !isMobile;

            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-[180px] group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(item, isPlaceholder);
                }}
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
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5" /> {isPlaceholder ? 'Use Scene' : 'View'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LibraryDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
