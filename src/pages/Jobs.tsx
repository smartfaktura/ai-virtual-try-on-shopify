import { useState } from 'react';
import { Search, Image, Sparkles, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LibraryImageCard } from '@/components/app/LibraryImageCard';
import { useLibraryItems, type LibraryTab, type LibrarySortBy } from '@/hooks/useLibraryItems';

const TABS = [
  { id: 'all' as LibraryTab, label: 'All', icon: Image },
  { id: 'generations' as LibraryTab, label: 'Generations', icon: Camera },
  { id: 'freestyle' as LibraryTab, label: 'Freestyle', icon: Sparkles },
];

const SORTS: { id: LibrarySortBy; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];

export default function Jobs() {
  const [tab, setTab] = useState<LibraryTab>('all');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: items = [], isLoading } = useLibraryItems(tab, sortBy, searchQuery);

  const displayItems = tab === 'all' ? items : items.filter(i => i.source === tab);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">Your generated images and freestyle creations</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search prompts, workflows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border-0 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                tab === t.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              )}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

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

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayItems.length === 0 ? (
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
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1">
            {displayItems.map(item => (
              <LibraryImageCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
