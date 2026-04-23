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
