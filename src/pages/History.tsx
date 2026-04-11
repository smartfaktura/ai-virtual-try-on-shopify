import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Clock, Sparkles, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { toSignedUrls } from '@/lib/signedUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { PageHeader } from '@/components/app/PageHeader';
import { useNavigate } from 'react-router-dom';
import type { LibraryItem } from '@/components/app/LibraryImageCard';

const teamAvatar = (file: string) => getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 });

const WORKFLOW_AVATARS = [
  { file: 'avatar-sophia.jpg', name: 'Sophia' },
  { file: 'avatar-max.jpg', name: 'Max' },
  { file: 'avatar-sienna.jpg', name: 'Sienna' },
];

const FREESTYLE_AVATARS = [
  { file: 'avatar-yuki.jpg', name: 'Yuki' },
  { file: 'avatar-luna.jpg', name: 'Luna' },
  { file: 'avatar-amara.jpg', name: 'Amara' },
  { file: 'avatar-kenji.jpg', name: 'Kenji' },
];

function pickAvatar(id: string, pool: typeof WORKFLOW_AVATARS) {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

interface HistoryItem {
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
  avatarSrc: string;
  avatarName: string;
}

const PAGE_SIZE = 40;

function useHistoryItems(source: 'all' | 'generation' | 'freestyle') {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['history', user?.id, source],
    queryFn: async () => {
      const items: HistoryItem[] = [];
      const limit = 200;

      const fetchJobs = source !== 'freestyle';
      const fetchFreestyle = source !== 'generation';

      const promises: Promise<void>[] = [];

      if (fetchJobs) {
        promises.push(
          (async () => {
            const { data, error } = await supabase
              .from('generation_jobs')
              .select('id, results, created_at, workflow_slug, scene_name, model_name, product_name, product_image_url, prompt_final, ratio, quality')
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(limit);
            if (error || !data) return;
            for (const job of data) {
              const results = job.results as any;
              if (!Array.isArray(results)) continue;
              for (let i = 0; i < results.length; i++) {
                const r = results[i];
                const url = typeof r === 'string' ? r : r?.url || r?.image_url;
                if (!url) continue;
                const isTryOn = url.includes('tryon-images');
                const label = isTryOn ? 'Virtual Try-On' : (job.workflow_slug || 'Product Shot');
                const avatar = pickAvatar(job.id, WORKFLOW_AVATARS);
                items.push({
                  id: `${job.id}-${i}`,
                  imageUrl: url,
                  label,
                  subtitle: job.product_name || job.scene_name || undefined,
                  date: new Date(job.created_at).toLocaleDateString(),
                  rawDate: job.created_at,
                  source: 'generation',
                  prompt: job.prompt_final || undefined,
                  aspectRatio: job.ratio,
                  quality: job.quality,
                  providerUsed: null,
                  avatarSrc: teamAvatar(avatar.file),
                  avatarName: avatar.name,
                });
              }
            }
          })()
        );
      }

      if (fetchFreestyle) {
        promises.push(
          (async () => {
            const { data, error } = await supabase
              .from('freestyle_generations')
              .select('id, image_url, prompt, quality, aspect_ratio, created_at, provider_used')
              .order('created_at', { ascending: false })
              .limit(limit);
            if (error || !data) return;
            for (const f of data) {
              const isUpscaled = f.quality?.startsWith('upscaled_');
              const resolution = f.quality?.includes('4k') ? '4K' : '2K';
              const avatar = pickAvatar(f.id, FREESTYLE_AVATARS);
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
                avatarSrc: teamAvatar(avatar.file),
                avatarName: avatar.name,
              });
            }
          })()
        );
      }

      await Promise.all(promises);
      items.sort((a, b) => b.rawDate.localeCompare(a.rawDate));

      // Sign URLs
      const rawUrls = items.map(i => i.imageUrl);
      const signedUrls = await toSignedUrls(rawUrls);
      for (let i = 0; i < items.length; i++) {
        items[i].imageUrl = signedUrls[i];
      }

      return items;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const items = query.data ?? [];
  const visibleItems = items.slice(0, page * PAGE_SIZE);
  const hasMore = visibleItems.length < items.length;

  return {
    items: visibleItems,
    allCount: items.length,
    isLoading: query.isLoading,
    hasMore,
    loadMore: () => setPage(p => p + 1),
  };
}

function HistoryGrid({ items, isLoading, hasMore, loadMore, allCount }: {
  items: HistoryItem[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  allCount: number;
}) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const openItem = useCallback((item: HistoryItem) => {
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

  const handleCardClick = useCallback((item: HistoryItem) => {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyStateCard
        heading="No creations yet"
        description="Start creating visuals and they'll appear here as your complete history."
        action={{ content: 'Create Visuals', onAction: () => navigate('/app/workflows') }}
        icon={<Clock className="w-8 h-8 text-muted-foreground" />}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((item) => {
          const isActive = isMobile && activeItemId === item.id;
          return (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border relative shadow-sm bg-muted">
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
                  className={`absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" /> View
                  </span>
                </div>

                {/* Bottom metadata strip */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 pt-6">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.avatarSrc}
                      alt={item.avatarName}
                      className="w-5 h-5 rounded-full border border-white/30 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-white truncate leading-tight">{item.label}</p>
                      <p className="text-[10px] text-white/70 truncate leading-tight">{item.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} className="rounded-full px-8">
            Load More
          </Button>
        </div>
      )}

      <LibraryDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

export default function History() {
  const [tab, setTab] = useState<'all' | 'generation' | 'freestyle'>('all');
  const { items, isLoading, hasMore, loadMore, allCount } = useHistoryItems(tab);

  return (
    <PageHeader
      title="History"
      subtitle="Browse all your generated visuals in one place."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            All
            {!isLoading && allCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{allCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generation" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="freestyle" className="gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            Freestyle
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <HistoryGrid
            items={items}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            allCount={allCount}
          />
        </TabsContent>
      </Tabs>
    </PageHeader>
  );
}
