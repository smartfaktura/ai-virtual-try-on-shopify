import { Skeleton } from '@/components/ui/skeleton';
import { MASONRY_SKELETON_RATIOS } from '@/lib/discoverAspect';

interface MasonrySkeletonGridProps {
  columnCount: number;
  cardsPerColumn?: number;
}

/**
 * Loading skeleton that mirrors the masonry grid's vertical rhythm so the
 * page does not "snap" when real data arrives. Uses the same column count
 * and gap as the live Discover grid (`flex gap-1`).
 */
export function MasonrySkeletonGrid({ columnCount, cardsPerColumn = 6 }: MasonrySkeletonGridProps) {
  const columns = Array.from({ length: columnCount }, (_, colIdx) =>
    Array.from({ length: cardsPerColumn }, (_, rowIdx) => {
      const idx = (colIdx * 3 + rowIdx) % MASONRY_SKELETON_RATIOS.length;
      return MASONRY_SKELETON_RATIOS[idx];
    })
  );

  return (
    <div className="flex gap-1 animate-fade-in">
      {columns.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-1">
          {col.map((ratio, j) => (
            <Skeleton
              key={j}
              className="w-full rounded-lg"
              style={{ aspectRatio: ratio }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
