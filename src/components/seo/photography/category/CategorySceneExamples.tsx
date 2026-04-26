import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SmartImage } from './SmartImage';
import { PREVIEW, type CategoryPage } from '@/data/aiProductPhotographyCategoryPages';
import { useSeoVisualOverridesMap } from '@/hooks/useSeoVisualOverrides';
import { resolveSlotImageUrl, resolveSlotAlt } from '@/lib/resolveSlotImage';
import { getVisualLibraryHrefForCategory } from '@/lib/visualLibraryDeepLink';

export function CategorySceneExamples({ page }: { page: CategoryPage }) {
  const overrides = useSeoVisualOverridesMap();

  return (
    <section id="scene-library" className="py-16 lg:py-32 bg-[#f5f5f3] scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Scene examples
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            {page.groupName} scenes built for e-commerce
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Studio, lifestyle, editorial, and seasonal — one click.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {page.sceneExamples.map((ex, i) => {
            const slotKey = `sceneExample${i + 1}`;
            const resolvedSrc = resolveSlotImageUrl(overrides, page.url, slotKey, PREVIEW(ex.imageId));
            const resolvedAlt = resolveSlotAlt(overrides, page.url, slotKey, ex.alt);
            return (
              <div
                key={ex.label}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-muted/30"
              >
                <SmartImage
                  src={getOptimizedUrl(resolvedSrc, { quality: 55 })}
                  alt={resolvedAlt}
                  imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
                  <span className="block text-[11px] uppercase tracking-wider text-white/85 font-semibold">
                    {ex.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to={getVisualLibraryHrefForCategory(page.slug)}
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-[#1a1a2e]/15 bg-white text-[#1a1a2e] text-base font-semibold hover:bg-[#1a1a2e] hover:text-white transition-colors"
          >
            Browse the full scene library
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
