import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Camera, ShoppingBag, Scissors, Megaphone, Sun, Clapperboard, Loader2, LayoutGrid, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/app/PageHeader';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { mockTryOnPoses } from '@/data/mockData';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'scenes', label: 'Scenes', icon: Image },
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard },
  { id: 'commercial', label: 'Commercial', icon: ShoppingBag },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'styling', label: 'Styling', icon: Scissors },
  { id: 'ads', label: 'Ads', icon: Megaphone },
  { id: 'lifestyle', label: 'Lifestyle', icon: Sun },
] as const;

export default function Discover() {
  const navigate = useNavigate();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPreset, setSelectedPreset] = useState<DiscoverPreset | null>(null);

  // Build unified feed
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const sceneItems: DiscoverItem[] = mockTryOnPoses.map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'scenes') return item.type === 'scene';
      if (selectedCategory !== 'all') {
        if (item.type === 'scene') return false;
        if (item.data.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (item.type === 'preset') {
          return (
            item.data.title.toLowerCase().includes(q) ||
            item.data.prompt.toLowerCase().includes(q) ||
            item.data.tags?.some((t) => t.toLowerCase().includes(q))
          );
        } else {
          return (
            item.data.name.toLowerCase().includes(q) ||
            item.data.description.toLowerCase().includes(q) ||
            item.data.category.toLowerCase().includes(q)
          );
        }
      }
      return true;
    });
  }, [allItems, selectedCategory, searchQuery]);

  const relatedPresets = useMemo(() => {
    if (!selectedPreset) return [];
    return presets
      .filter((p) => p.category === selectedPreset.category && p.id !== selectedPreset.id)
      .slice(0, 4);
  }, [presets, selectedPreset]);

  const handleItemClick = (item: DiscoverItem) => {
    if (item.type === 'scene') {
      navigate(`/app/freestyle?scene=${item.data.poseId}`);
    } else {
      setSelectedPreset(item.data);
    }
  };

  const handleUsePrompt = (preset: DiscoverPreset) => {
    const params = new URLSearchParams({
      prompt: preset.prompt,
      ratio: preset.aspect_ratio,
      quality: preset.quality,
    });
    navigate(`/app/freestyle?${params.toString()}`);
  };

  return (
    <PageHeader title="Discover" subtitle="Browse curated prompts and styles for inspiration">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts, scenes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200',
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Try different keywords or{' '}
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-primary hover:underline"
              >
                browse all
              </button>
            </p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1">
            {filtered.map((item) => (
              <DiscoverCard
                key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <DiscoverDetailModal
        preset={selectedPreset}
        open={!!selectedPreset}
        onClose={() => setSelectedPreset(null)}
        onUsePrompt={handleUsePrompt}
        relatedPresets={relatedPresets}
        onSelectRelated={setSelectedPreset}
      />
    </PageHeader>
  );
}
