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

function useFeaturedDiscoverImages(count: number) {
  return useQuery({
    queryKey: ['compare-discover-gallery', count],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<PresetImage[]> => {
      const { data, error } = await supabase
        .from('discover_presets')
        .select('id, title, image_url, slug')
        .order('sort_order', { ascending: true })
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
  const { data: images = [] } = useFeaturedDiscoverImages(count);

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
          {images.length === 0
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
