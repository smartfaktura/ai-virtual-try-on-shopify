// Single source of truth for Discover taxonomy.
// Wraps onboardingTaxonomy so Discover, Settings, and Add-to-Discover modal
// always render the exact same families + sub-types.

import {
  SUB_TYPES_BY_FAMILY,
  FAMILY_ID_TO_NAME,
  FAMILY_NAME_TO_ID,
  type SubType,
} from '@/lib/onboardingTaxonomy';
import { FAMILY_ORDER } from '@/lib/sceneTaxonomy';

export type { SubType };
export { SUB_TYPES_BY_FAMILY, FAMILY_ID_TO_NAME, FAMILY_NAME_TO_ID, FAMILY_ORDER };

export interface DiscoverFamily {
  /** kebab-case id, persisted in `discover_presets.category` */
  id: string;
  /** Canonical name from FAMILY_ORDER (e.g. 'Fashion') */
  name: string;
  /** Display label */
  label: string;
}

/** All families in canonical order, ready for chip rows. */
export function getDiscoverFamilies(): DiscoverFamily[] {
  return FAMILY_ORDER.map((name) => {
    const id = FAMILY_NAME_TO_ID[name];
    return id ? { id, name, label: name } : null;
  }).filter(Boolean) as DiscoverFamily[];
}

/** Sub-types for a given family id (kebab-case). */
export function getDiscoverSubtypes(familyId: string): SubType[] {
  const name = FAMILY_ID_TO_NAME[familyId];
  if (!name) return [];
  return SUB_TYPES_BY_FAMILY[name] ?? [];
}

/** True when a family has 2+ sub-types (sub-row should show). */
export function isMultiSubFamily(familyId: string): boolean {
  return getDiscoverSubtypes(familyId).length >= 2;
}

/** Sub-types for a family by canonical name (used by AI validation). */
export function getSubtypeSlugsForFamilyName(name: string): string[] {
  return (SUB_TYPES_BY_FAMILY[name] ?? []).map((s) => s.slug);
}

/** Set of all valid family ids. */
export const DISCOVER_FAMILY_IDS: readonly string[] = getDiscoverFamilies().map(
  (f) => f.id,
);

/** Family id (kebab-case) for a given sub-type slug, or null. */
export function familyIdForSubtype(slug: string): string | null {
  for (const fam of getDiscoverFamilies()) {
    if (getDiscoverSubtypes(fam.id).some((s) => s.slug === slug)) return fam.id;
  }
  return null;
}

/**
 * Test whether a discover item matches the active family / sub-type filter.
 *
 * Item shape: { category: string; subcategory?: string|null; discover_categories?: string[] }
 *
 * Rules:
 *  - familyId === 'all' → match everything.
 *  - subFilter === '__all__' (default for a family) → match items where:
 *       category === familyId OR subcategory belongs to that family
 *       OR discover_categories includes familyId (legacy).
 *  - subFilter === '<slug>' → match items where subcategory === slug.
 *    Backwards-compat: also match legacy items that lack a subcategory but
 *    whose category matches the family (so old rows still appear when the
 *    user has only the family pill or any sub-type within it picked).
 *    To keep sub-type filtering meaningful we only fall back when the item
 *    has NO subcategory at all.
 */
export function itemMatchesDiscoverFilter(
  item: { category?: string | null; subcategory?: string | null; discover_categories?: string[] | null },
  familyId: string,
  subFilter: string,
): boolean {
  if (familyId === 'all') return true;

  const cat = (item.category ?? '').toLowerCase();
  const sub = (item.subcategory ?? '').toLowerCase();
  const extra = Array.isArray(item.discover_categories)
    ? item.discover_categories.map((c) => c.toLowerCase())
    : [];
  const familySubs = getDiscoverSubtypes(familyId).map((s) => s.slug.toLowerCase());

  const inFamily =
    cat === familyId.toLowerCase() ||
    extra.includes(familyId.toLowerCase()) ||
    (sub && familySubs.includes(sub));

  if (!inFamily) return false;

  if (subFilter === '__all__' || !subFilter) return true;

  if (sub) return sub === subFilter.toLowerCase();
  // Legacy row with no subcategory — surface under any sub-type pill within
  // its family so old data isn't hidden.
  return true;
}

