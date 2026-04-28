import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiscoverGalleryStripProps {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  /** Number of images to render. Defaults to 8. */
  count?: number;
  /** Tailwind grid columns. Defaults to "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4". */
  gridClassName?: string;
  /** Section background. */
  background?: 'soft' | 'background' | 'transparent';
  /** Optional CTA below the grid. Pass null to hide. */
  cta?: { label: string; to: string } | null;
  /** Tile aspect ratio class. Defaults to "aspect-[4/5]". */
  tileAspect?: string;
}

interface PresetImage {
  id: string;
  title: string;
  image_url: string;
  slug: string | null;
}

// Curated fallback drawn from the live Discover feed so the gallery
// always renders real visuals even if the public API is slow or unreachable.
const FALLBACK_IMAGES: PresetImage[] = [
  {
    id: '8eac52c3-de1a-44af-a597-c982bce67c13',
    title: 'Linen Blazer Under Blue Sky',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/904eb61c-c152-4b45-ba7b-96f8559100eb.png',
    slug: 'linen-blazer-under-blue-sky-8eac52',
  },
  {
    id: 'cb65ad93-1f17-43d1-ba93-4a6d2e1efb56',
    title: 'Lumière Renewal Night Treatment',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2026-04-02_e0144a37-614c-4046-9d2d-baaecdd6b618.jpg',
    slug: 'lumi-re-renewal-5-advanced-night-treatme-cb65ad',
  },
  {
    id: 'c93d7706-587a-40b9-988f-5732b0f6084a',
    title: 'Advanced Day Ultimate Protect',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/69e3414c-d8b3-405f-a315-8e9d66a795b2.png',
    slug: 'advanced-day-ultimate-protect-c93d77',
  },
  {
    id: '76778506-301a-42d7-bef5-965324ef79ce',
    title: 'Fisheye Fashion Editorial',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c419c552-d27e-45f8-8384-d4164f96ad32.png',
    slug: 'fisheye-fashion-editorial-767785',
  },
  {
    id: '12ff98bb-5454-4834-83cb-7535e3646c33',
    title: 'Aquatic Reflection',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a29b5c3e-72c8-40dd-abc8-a9b5335923b4.png',
    slug: 'aquatic-reflection-12ff98',
  },
  {
    id: 'db9de4d5-0261-4a77-bfad-19d7f45cd919',
    title: 'Sculpted Strength',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8dd4d0ed-65db-4871-bd30-1c0b2068af6d.png',
    slug: 'sculpted-strength-db9de4',
  },
  {
    id: 'bede4a8a-9365-4ea0-a8f9-46c273928694',
    title: 'Beyond the Blues',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2026-04-02_7a9ab6ef-6249-41b7-bb4f-c8e960ee64af.jpg',
    slug: 'beyond-the-blues-bede4a',
  },
  {
    id: '9c34ba9e-1376-498a-a300-fa28b560911e',
    title: 'Soft Light Radiance',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/920ca008-c659-4690-812b-2ac414ace96e.png',
    slug: 'soft-light-radiance-9c34ba',
  },
  {
    id: 'fallback-9',
    title: 'Editorial Studio',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/904eb61c-c152-4b45-ba7b-96f8559100eb.png',
    slug: 'linen-blazer-under-blue-sky-8eac52',
  },
  {
    id: 'fallback-10',
    title: 'Brand-Ready Visual',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c419c552-d27e-45f8-8384-d4164f96ad32.png',
    slug: 'fisheye-fashion-editorial-767785',
  },
  {
    id: 'fallback-11',
    title: 'Lifestyle Scene',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8dd4d0ed-65db-4871-bd30-1c0b2068af6d.png',
    slug: 'sculpted-strength-db9de4',
  },
  {
    id: 'fallback-12',
    title: 'Campaign Visual',
    image_url:
      'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a29b5c3e-72c8-40dd-abc8-a9b5335923b4.png',
    slug: 'aquatic-reflection-12ff98',
  },
];

function useFeaturedDiscoverImages(count: number) {
  return useQuery({
    queryKey: ['compare-discover-gallery', count],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<PresetImage[]> => {
      const { data, error } = await supabase
        .from('discover_presets')
        .select('id, title, image_url, slug')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(count);
      if (error) throw error;
      return (data || []).filter((d) => !!d.image_url) as PresetImage[];
    },
  });
}

export function DiscoverGalleryStrip({
  eyebrow = 'Made with VOVV.AI',
  headline = 'A glimpse of what brands create',
  intro = 'A small sample from the VOVV.AI Discover feed — real product visuals generated from a single product photo.',
  count = 8,
  gridClassName = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  background = 'background',
  cta = { label: 'Explore all examples', to: '/discover' },
  tileAspect = 'aspect-[4/5]',
}: DiscoverGalleryStripProps) {
  const { data, isLoading, error } = useFeaturedDiscoverImages(count);

  // Always render real imagery: use API data when available, otherwise fall back
  // to a curated static set so /compare pages never show empty skeletons.
  const apiImages = data ?? [];
  const useFallback = !isLoading && (error || apiImages.length === 0);
  const images: PresetImage[] = useFallback
    ? FALLBACK_IMAGES.slice(0, count)
    : apiImages;

  const bgClass =
    background === 'soft'
      ? 'bg-[#f5f5f3]'
      : background === 'transparent'
      ? ''
      : 'bg-[#FAFAF8]';

  return (
    <section className={`py-16 lg:py-24 ${bgClass}`}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            {headline}
          </h2>
          {intro && (
            <p className="mt-4 text-[#475569] text-base sm:text-lg leading-relaxed">
              {intro}
            </p>
          )}
        </div>

        <div className={`grid ${gridClassName} gap-3 sm:gap-4`}>
          {isLoading && images.length === 0
            ? Array.from({ length: count }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className={`${tileAspect} rounded-2xl bg-[#1a1a2e]/5 animate-pulse`}
                />
              ))
            : images.map((img) => (
                <Link
                  key={img.id}
                  to={`/discover/${img.slug || img.id}`}
                  className={`group relative ${tileAspect} overflow-hidden rounded-2xl bg-[#1a1a2e]/5 border border-[#f0efed] shadow-sm`}
                  aria-label={img.title}
                >
                  <img
                    src={img.image_url}
                    alt={img.title || 'Made with VOVV.AI'}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[12px] font-medium line-clamp-1">
                      {img.title}
                    </p>
                  </div>
                </Link>
              ))}
        </div>

        {cta && (
          <div className="mt-10 lg:mt-12 flex justify-center">
            <Link
              to={cta.to}
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-[#1a1a2e] text-white text-sm font-semibold hover:bg-[#1a1a2e]/90 transition-colors"
            >
              {cta.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
