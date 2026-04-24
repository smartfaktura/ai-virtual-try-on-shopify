import { ArrowRight, ImageIcon } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import type { FamilyGroup } from '@/hooks/usePublicSceneLibrary';

interface CategoryOverviewCardProps {
  family: FamilyGroup;
  onClick: () => void;
}

export function CategoryOverviewCard({ family, onClick }: CategoryOverviewCardProps) {
  const thumbs = family.previewThumbs.slice(0, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]"
    >
      {/* Collage */}
      <div className="grid h-44 grid-cols-3 gap-1 bg-[#efece8] p-1 sm:h-52">
        {[0, 1, 2].map((i) => {
          const url = thumbs[i];
          return (
            <div
              key={i}
              className="relative h-full w-full overflow-hidden rounded-2xl bg-[#e8e5e0]"
            >
              <div className="absolute inset-0 flex items-center justify-center text-foreground/15">
                <ImageIcon className="h-5 w-5" />
              </div>
              {url && (
                <img
                  src={getOptimizedUrl(url, { width: 400, quality: 60 })}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                  className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {family.label}
          </h3>
          <p className="text-xs text-foreground/55">
            {family.totalCount} visual {family.totalCount === 1 ? 'idea' : 'ideas'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors group-hover:text-foreground">
          Explore
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
