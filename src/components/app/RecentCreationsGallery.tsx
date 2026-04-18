import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toSignedUrls } from '@/lib/signedUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

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
  providerUsed?: string | null;
}

export function RecentCreationsGallery() {
  
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const isMobile = useIsMobile();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

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
          .limit(12),
        supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, quality, aspect_ratio, created_at, provider_used')
          .order('created_at', { ascending: false })
          .limit(12),
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
            providerUsed: (f as any).provider_used || null,
          });
        }
      }

      items.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
      const top = items.slice(0, 16);

      const rawUrls = top.map(i => i.imageUrl);
      const signedUrls = await toSignedUrls(rawUrls);
      for (let i = 0; i < top.length; i++) {
        top[i].imageUrl = signedUrls[i];
      }

      return top;
    },
    enabled: !!user,
    refetchInterval: 60_000,
    staleTime: 2 * 60 * 1000,
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
      providerUsed: item.providerUsed,
    };
    setSelectedItem(libraryItem);
    setActiveItemId(null);
  }, []);

  const handleCardClick = useCallback((item: CreationItem) => {
    if (isMobile) {
      if (activeItemId === item.id) {
        openItem(item);
      } else {
        setActiveItemId(item.id);
      }
    } else {
      openItem(item);
    }
  }, [isMobile, activeItemId, openItem]);


  // Preload first 4 images to eliminate shimmer for above-fold cards
  useEffect(() => {
    if (creations.length > 0) {
      creations.slice(0, 4).forEach((item) => {
        const img = new window.Image();
        img.src = item.imageUrl;
      });
    }
  }, [creations]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (creations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Recent Creations</h2>
          <p className="text-base text-muted-foreground mt-1.5">Your latest generated visuals</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {creations.slice(0, 8).map((item) => {
          const isActive = isMobile && activeItemId === item.id;

          return (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border relative shadow-sm">
                {isAdmin && item.providerUsed && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-black/60 text-white text-[9px] px-1.5 py-0 font-bold shadow-md border-0">
                      {item.providerUsed.includes('seedream') ? 'SDR' : item.providerUsed.includes('pro') ? 'PRO' : 'FLASH'}
                    </Badge>
                  </div>
                )}
                <ShimmerImage
                  src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  aspectRatio="3/4"
                  onError={(e: any) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" /> View
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <LibraryDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
