import { Skeleton } from '@/components/ui/skeleton';

// Rotating aspect ratios to mimic real masonry rhythm (height as % of width)
const ASPECT_PATTERN = [125, 100, 133, 75, 150, 100, 125, 80]; // 4:5, 1:1, 3:4, 4:3, 2:3, 1:1, 4:5, 5:4

interface LibrarySkeletonGridProps {
  columnCount: number;
  cardsPerColumn?: number;
}

export function LibrarySkeletonGrid({ columnCount, cardsPerColumn = 6 }: LibrarySkeletonGridProps) {
  const columns = Array.from({ length: columnCount }, (_, colIdx) =>
    Array.from({ length: cardsPerColumn }, (_, rowIdx) => {
      // Offset each column so adjacent columns get different ratios
      const idx = (colIdx * 3 + rowIdx) % ASPECT_PATTERN.length;
      return ASPECT_PATTERN[idx];
    })
  );

  return (
    <div className="flex gap-2 animate-fade-in">
      {columns.map((col, i) => (
        <div key={i} className="flex-1 flex flex-col gap-2">
          {col.map((heightPct, j) => (
            <Skeleton
              key={j}
              className="w-full rounded-2xl"
              style={{ paddingBottom: `${heightPct}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
