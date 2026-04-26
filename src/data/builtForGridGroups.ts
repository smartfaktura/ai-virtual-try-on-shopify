/**
 * Shared "Built for every {category} shot" group resolver.
 *
 * Both the public CategoryBuiltForEveryCategory component and the SEO image
 * slot registry must agree on how raw BUILT_FOR_GRIDS entries are merged into
 * chip groups, otherwise admin overrides would target a different image than
 * the one the page actually renders.
 */
import { BUILT_FOR_GRIDS, type BuiltForGroup } from './aiProductPhotographyBuiltForGrids';

export function slotSlugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[·•]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitLabel(s: string): { subject: string; style?: string } {
  const parts = s.split('·').map((p) => p.trim());
  return { subject: parts[0], style: parts.slice(1).join(' · ') || undefined };
}

/** Merge raw BUILT_FOR_GRIDS groups for a page into the chip groups the
 *  CategoryBuiltForEveryCategory section actually renders. Capped at 8 cards
 *  per group to mirror the live grid. */
export function getBuiltForGroupsForPage(slug: string): BuiltForGroup[] {
  const rawGroups = BUILT_FOR_GRIDS[slug] ?? [];
  if (rawGroups.length === 0) return [];

  const subjects = rawGroups.map((g) => splitLabel(g.subCategory).subject);
  const singleSubject = subjects.length > 0 && subjects.every((s) => s === subjects[0]);
  const groupKey = (s: string) => {
    const { subject, style } = splitLabel(s);
    return singleSubject && style ? style : subject;
  };

  const order: string[] = [];
  const map = new Map<string, BuiltForGroup>();
  for (const g of rawGroups) {
    const key = groupKey(g.subCategory);
    const existing = map.get(key);
    if (existing) {
      const seen = new Set(existing.cards.map((c) => c.imageId));
      for (const c of g.cards) if (!seen.has(c.imageId)) { existing.cards.push(c); seen.add(c.imageId); }
    } else {
      order.push(key);
      map.set(key, { subCategory: key, cards: [...g.cards] });
    }
  }
  return order.map((s) => {
    const g = map.get(s)!;
    return { ...g, cards: g.cards.slice(0, 8) };
  });
}
