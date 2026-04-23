import { useState, useMemo, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import {
  CATEGORY_FAMILY_MAP,
  FAMILY_ORDER,
  getSubFamilyLabel,
} from '@/lib/sceneTaxonomy';
import type { PickerSceneOption } from '@/hooks/useDiscoverPickerOptions';

interface SceneBrowserModalProps {
  open: boolean;
  onClose: () => void;
  scenes: PickerSceneOption[];
  value: string | null;
  onSelect: (scene: PickerSceneOption) => void;
}

const OTHER_FAMILY = 'Other';

/**
 * Structured scene browser — replaces the 1000-row Popover when a scene is missing.
 * Two-pane: families left, subfamily chips + 4-col thumb grid right.
 * Reuses CATEGORY_FAMILY_MAP from sceneTaxonomy.
 */
export function SceneBrowserModal({ open, onClose, scenes, value, onSelect }: SceneBrowserModalProps) {
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Group scenes by family
  const familyGroups = useMemo(() => {
    const map = new Map<string, PickerSceneOption[]>();
    for (const scene of scenes) {
      const fam = CATEGORY_FAMILY_MAP[scene.category] ?? OTHER_FAMILY;
      if (!map.has(fam)) map.set(fam, []);
      map.get(fam)!.push(scene);
    }
    return map;
  }, [scenes]);

  const orderedFamilies = useMemo(() => {
    const known = FAMILY_ORDER.filter(f => familyGroups.has(f));
    const extras = Array.from(familyGroups.keys())
      .filter(f => !FAMILY_ORDER.includes(f as any) && f !== OTHER_FAMILY)
      .sort();
    const result = [...known, ...extras];
    if (familyGroups.has(OTHER_FAMILY)) result.push(OTHER_FAMILY);
    return result;
  }, [familyGroups]);

  // Default to first family on open
  useEffect(() => {
    if (open && !activeFamily && orderedFamilies.length > 0) {
      setActiveFamily(orderedFamilies[0]);
    }
    if (!open) {
      setSearch('');
      setActiveSub(null);
    }
  }, [open, orderedFamilies, activeFamily]);

  // Sub-family slugs available within active family, with counts (sorted by count desc, then alpha)
  const subSlugCounts = useMemo<Array<[string, number]>>(() => {
    if (!activeFamily) return [];
    const items = familyGroups.get(activeFamily) ?? [];
    const counts = new Map<string, number>();
    for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [familyGroups, activeFamily]);

  // Reset sub when family changes
  useEffect(() => { setActiveSub(null); }, [activeFamily]);

  // Filtered scene list shown in grid
  const visibleScenes = useMemo(() => {
    if (!activeFamily) return [];
    let list = familyGroups.get(activeFamily) ?? [];
    if (activeSub) list = list.filter(s => s.category === activeSub);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [familyGroups, activeFamily, activeSub, search]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[340] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background rounded-2xl border border-border/50 shadow-2xl w-full max-w-5xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/30 shrink-0">
          <h3 className="text-lg font-semibold text-foreground">Browse Scenes</h3>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeFamily ? `Search in ${activeFamily}...` : 'Search scenes...'}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: families | grid */}
        <div className="flex flex-1 min-h-0">
          {/* Left rail — families */}
          <div className="w-48 shrink-0 border-r border-border/30 overflow-y-auto py-2">
            {orderedFamilies.map(fam => {
              const count = familyGroups.get(fam)?.length ?? 0;
              const active = activeFamily === fam;
              return (
                <button
                  key={fam}
                  onClick={() => setActiveFamily(fam)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors',
                    active
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <span className="truncate">{fam}</span>
                  <span className="text-[10px] text-muted-foreground/60 ml-2">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Right — subfamily chips + grid */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Subfamily chips */}
            {subSlugs.length > 1 && (
              <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b border-border/20 shrink-0">
                <button
                  onClick={() => setActiveSub(null)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    activeSub === null
                      ? 'bg-foreground text-background'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                  )}
                >
                  All
                </button>
                {subSlugs.map(slug => (
                  <button
                    key={slug}
                    onClick={() => setActiveSub(slug)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      activeSub === slug
                        ? 'bg-foreground text-background'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {getSubFamilyLabel(slug)}
                  </button>
                ))}
              </div>
            )}

            {/* Scene grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {visibleScenes.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground/60">
                  No scenes found
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {visibleScenes.map(scene => {
                    const selected = value === scene.name;
                    return (
                      <button
                        key={scene.name + scene.category}
                        onClick={() => onSelect(scene)}
                        className={cn(
                          'group relative flex flex-col items-stretch gap-1.5 rounded-lg overflow-hidden border transition-all text-left',
                          selected
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border/40 hover:border-border',
                        )}
                      >
                        <div className="aspect-square bg-muted overflow-hidden">
                          {scene.imageUrl ? (
                            <img
                              src={scene.imageUrl}
                              alt={scene.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="px-2 pb-1.5 text-[11px] text-foreground truncate">{scene.name}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
