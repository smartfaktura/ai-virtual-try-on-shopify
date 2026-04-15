import React, { useRef, useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { poseCategoryLabels } from '@/data/mockData';
import { TEAM_MEMBERS } from '@/data/teamData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useIsMobile } from '@/hooks/use-mobile';
import type { TryOnPose } from '@/types';

const amara = TEAM_MEMBERS.find(m => m.name === 'Amara')!;

/** Maps user product categories to relevant scene categories */
const CATEGORY_SCENE_MAP: Record<string, string[]> = {
  fashion:     ['studio', 'lifestyle', 'editorial', 'streetwear'],
  beauty:      ['clean-studio', 'botanical', 'bathroom', 'surface'],
  fragrances:  ['clean-studio', 'botanical', 'bathroom'],
  jewelry:     ['clean-studio', 'flat-lay'],
  accessories: ['clean-studio', 'flat-lay', 'surface'],
  home:        ['living-space', 'clean-studio', 'botanical', 'outdoor'],
  food:        ['surface', 'kitchen', 'clean-studio'],
  electronics: ['clean-studio'],
  sports:      ['lifestyle', 'streetwear', 'outdoor', 'clean-studio'],
  supplements: ['clean-studio', 'botanical', 'surface'],
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

  let final = result.slice(0, count);

  // Pin "Studio Profile" first for fashion users
  if (filtered.includes('fashion')) {
    const studioProfile = allScenes.find(s => s.poseId === 'pose_002');
    if (studioProfile) {
      final = [studioProfile, ...final.filter(s => s.poseId !== 'pose_002')].slice(0, count);
    }
  }

  return final;
}

interface FreestyleQuickPresetsProps {
  onSelect: (scene: TryOnPose) => void;
  activeSceneId?: string | null;
  userCategories?: string[];
  allScenes?: TryOnPose[];
}

export function FreestyleQuickPresets({ onSelect, activeSceneId, userCategories = [], allScenes = [] }: FreestyleQuickPresetsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isMobile = useIsMobile();
  const hasAnimated = useRef(false);

  const scenes = useMemo(
    () => buildPersonalizedScenes(userCategories, allScenes, 8),
    [userCategories, allScenes],
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

  // Mobile onboarding: micro-scroll hint (once per session)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isMobile || hasAnimated.current) return;
    if (sessionStorage.getItem('freestyle_scroll_hint')) return;
    hasAnimated.current = true;

    const timer = setTimeout(() => {
      el.scrollTo({ left: 40, behavior: 'smooth' });
      setTimeout(() => {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        sessionStorage.setItem('freestyle_scroll_hint', '1');
        // Safety reset
        setTimeout(() => { el.scrollTo({ left: 0 }); }, 400);
      }, 600);
    }, 500);

    return () => clearTimeout(timer);
  }, [isMobile, scenes]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  return (
    <div className="w-full sm:px-0">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <img
          src={getOptimizedUrl(amara.avatar, { quality: 60 })}
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
          className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none pl-4 sm:pl-0"
        >
          {scenes.map(scene => {
            const isActive = activeSceneId === scene.poseId;
            return (
              <button
                key={scene.poseId}
                onClick={() => onSelect(scene)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all snap-start shrink-0',
                  'hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]',
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border/60 bg-background'
                )}
              >
                <img
                  src={getOptimizedUrl(scene.previewUrl, { quality: 60 })}
                  alt={scene.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{scene.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {poseCategoryLabels[scene.category] ?? scene.category}
                  </p>
                </div>
              </button>
            );
          })}
          {/* Trailing spacer for partial card cut on mobile */}
          <div className="shrink-0 w-4 sm:hidden" />
        </div>
      </div>
    </div>
  );
}
