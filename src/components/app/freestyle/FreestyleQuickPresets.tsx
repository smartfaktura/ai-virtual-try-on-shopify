import React, { useRef, useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { poseCategoryLabels } from '@/data/mockData';
import { TEAM_MEMBERS } from '@/data/teamData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { TryOnPose } from '@/types';

const amara = TEAM_MEMBERS.find(m => m.name === 'Amara')!;

/** Maps user product categories to relevant scene categories */
const CATEGORY_SCENE_MAP: Record<string, string[]> = {
  fashion: ['studio', 'lifestyle', 'editorial', 'streetwear'],
  beauty: ['clean-studio', 'surface', 'bathroom', 'botanical'],
  fragrances: ['clean-studio', 'surface', 'bathroom', 'botanical'],
  jewelry: ['clean-studio', 'surface', 'flat-lay'],
  accessories: ['clean-studio', 'surface', 'flat-lay', 'editorial'],
  home: ['living-space', 'clean-studio', 'botanical', 'outdoor'],
  food: ['surface', 'kitchen', 'clean-studio'],
  electronics: ['clean-studio', 'surface'],
  sports: ['lifestyle', 'streetwear', 'outdoor'],
  supplements: ['clean-studio', 'surface', 'botanical'],
};

const ALL_SCENE_CATEGORIES = Object.keys(poseCategoryLabels);

function buildPersonalizedScenes(
  userCategories: string[],
  allScenes: TryOnPose[],
  count = 8,
): TryOnPose[] {
  const filtered = userCategories.filter(c => c !== 'any');
  
  // Resolve relevant scene categories
  let sceneCategories: string[];
  if (filtered.length === 0) {
    sceneCategories = ALL_SCENE_CATEGORIES;
  } else {
    const set = new Set<string>();
    filtered.forEach(cat => {
      (CATEGORY_SCENE_MAP[cat] ?? ALL_SCENE_CATEGORIES).forEach(sc => set.add(sc));
    });
    sceneCategories = Array.from(set);
  }

  // Group available scenes by category
  const byCategory: Record<string, TryOnPose[]> = {};
  allScenes.forEach(scene => {
    if (sceneCategories.includes(scene.category)) {
      (byCategory[scene.category] ??= []).push(scene);
    }
  });

  const cats = Object.keys(byCategory);
  if (cats.length === 0) return allScenes.slice(0, count);

  // Distribute slots evenly, then round-robin fill
  const perCat = Math.max(1, Math.floor(count / cats.length));
  const result: TryOnPose[] = [];
  const used = new Set<string>();

  // First pass: take perCat from each category
  cats.forEach(cat => {
    const scenes = byCategory[cat];
    for (let i = 0; i < Math.min(perCat, scenes.length); i++) {
      if (result.length >= count) break;
      result.push(scenes[i]);
      used.add(scenes[i].poseId);
    }
  });

  // Fill remaining slots round-robin
  let catIdx = 0;
  while (result.length < count) {
    const cat = cats[catIdx % cats.length];
    const next = byCategory[cat].find(s => !used.has(s.poseId));
    if (next) {
      result.push(next);
      used.add(next.poseId);
    }
    catIdx++;
    if (catIdx > cats.length * 10) break; // safety
  }

  return result.slice(0, count);
}

interface FreestyleQuickPresetsProps {
  onSelect: (scene: TryOnPose) => void;
  activeSceneId?: string | null;
  userCategories?: string[];
  allScenes?: TryOnPose[];
}

export function FreestyleQuickPresets({ onSelect, activeSceneId, userCategories = [] }: FreestyleQuickPresetsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scenes = useMemo(
    () => buildPersonalizedScenes(userCategories, mockTryOnPoses, 8),
    [userCategories],
  );

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <div className="w-full px-4 sm:px-0">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <img
          src={amara.avatar}
          alt={amara.name}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
        />
        <p className="text-sm font-semibold text-foreground">
          {amara.name} picked these for you
        </p>
      </div>
      <p className="text-xs text-muted-foreground/70 text-center mb-5 px-4">
        Pick a quick-start scene or describe what you want to create
      </p>

      <div className="relative group">
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        )}

        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-10 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-10 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
        >
          {scenes.map(scene => {
            const isActive = activeSceneId === scene.poseId;
            return (
              <button
                key={scene.poseId}
                onClick={() => onSelect(scene)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all snap-start shrink-0',
                  'hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]',
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border/60 bg-background'
                )}
              >
                <img
                  src={scene.previewUrl}
                  alt={scene.name}
                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{scene.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {poseCategoryLabels[scene.category] ?? scene.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
