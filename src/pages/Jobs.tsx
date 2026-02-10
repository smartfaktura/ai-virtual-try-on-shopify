import { useState, useEffect } from 'react';
import { Search, Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LibraryImageCard, type LibraryItem } from '@/components/app/LibraryImageCard';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { useLibraryItems, type LibrarySortBy } from '@/hooks/useLibraryItems';

const SORTS: { id: LibrarySortBy; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];

function useColumnCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 1024) setCount(3);
      else if (w < 1280) setCount(4);
      else setCount(5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function Jobs() {
  const [sortBy, setSortBy] = useState<LibrarySortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const { data: items = [], isLoading } = useLibraryItems(sortBy, searchQuery);
  const columnCount = useColumnCount();

  const columns: typeof items[] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => {
    columns[i % columnCount].push(item);
  });

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">Your generated images and freestyle creations</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product, model, scene..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border-0 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {SORTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-medium transition-all',
                  sortBy === s.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Image className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No results match your search.' : 'No creations yet. Start generating to build your library.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground hover:bg-muted/70 transition-all"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-1">
            {columns.map((col, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                {col.map(item => (
                  <LibraryImageCard key={item.id} item={item} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
