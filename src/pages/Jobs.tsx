import { useState } from 'react';
import { Search, LayoutGrid, List, Image, Sparkles, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { LibraryImageCard } from '@/components/app/LibraryImageCard';
import { useLibraryItems, type LibraryTab, type LibrarySortBy } from '@/hooks/useLibraryItems';

export default function Jobs() {
  const [tab, setTab] = useState<LibraryTab>('all');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: items = [], isLoading } = useLibraryItems(tab, sortBy, searchQuery);

  const counts = {
    all: items.length,
    generations: items.filter(i => i.source === 'generation').length,
    freestyle: items.filter(i => i.source === 'freestyle').length,
  };

  const displayItems = tab === 'all' ? items : items.filter(i => i.source === tab);

  return (
    <PageHeader title="Library" subtitle="Your generated images and freestyle creations">
      <div className="space-y-5">
        {/* Tabs + View toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs value={tab} onValueChange={(v) => setTab(v as LibraryTab)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                <Image className="w-3.5 h-3.5" /> All
              </TabsTrigger>
              <TabsTrigger value="generations" className="gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Generations
              </TabsTrigger>
              <TabsTrigger value="freestyle" className="gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Freestyle
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts, workflows..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as LibrarySortBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <div className="rounded-2xl bg-muted animate-pulse" style={{ height: `${180 + (i % 3) * 60}px` }} />
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Image className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No results match your search.' : 'No creations yet. Start generating to build your library.'}
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {displayItems.map(item => (
              <LibraryImageCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {item.prompt && (
                    <p className="text-xs text-muted-foreground truncate">{item.prompt}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.date}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {item.source === 'freestyle' ? 'Freestyle' : 'Generation'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageHeader>
  );
}
