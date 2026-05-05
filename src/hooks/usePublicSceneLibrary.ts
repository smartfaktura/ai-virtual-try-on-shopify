import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_FAMILY_MAP, FAMILY_ORDER } from '@/lib/sceneTaxonomy';

/**
 * Public, lightweight scene library — used by /product-visual-library.
 * - Selects ONLY safe public columns (no prompt_template, no trigger_blocks).
 * - Active rows only.
 * - Cached separately from the wizard hook so neither pollutes the other.
 */

export interface PublicScene {
  scene_id: string;
  title: string;
  description: string | null;
  category_collection: string | null;
  sub_category: string | null;
  preview_image_url: string | null;
}

const PUBLIC_COLUMNS =
  'scene_id,title,description,category_collection,sub_category,preview_image_url,sort_order,category_sort_order,sub_category_sort_order';

async function fetchPublicScenes(): Promise<PublicScene[]> {
  const PAGE = 1000;
  let all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('product_image_scenes' as any)
      .select(PUBLIC_COLUMNS)
      .eq('is_active', true)
      .order('category_sort_order', { ascending: true })
      .order('sub_category_sort_order', { ascending: true })
      .order('sort_order', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const batch = data || [];
    all = all.concat(batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }
  return all as PublicScene[];
}

// Friendly family labels for the public page (super-set of taxonomy.ts).
export const FAMILY_LABEL_OVERRIDES: Record<string, string> = {
  Fashion: 'Fashion & Apparel',
  Footwear: 'Footwear',
  'Bags & Accessories': 'Bags & Accessories',
  Watches: 'Watches',
  Eyewear: 'Eyewear',
  Jewelry: 'Jewelry',
  'Beauty & Fragrance': 'Beauty & Fragrance',
  Home: 'Home & Lifestyle',
  Tech: 'Tech / Devices',
  'Food & Drink': 'Food & Drink',
  Wellness: 'Wellness',
};

// Pretty sub-category labels for known slugs.
export const COLLECTION_LABEL: Record<string, string> = {
  garments: 'Clothing & Apparel',
  dresses: 'Dresses',
  hoodies: 'Hoodies',
  jeans: 'Jeans',
  jackets: 'Jackets',
  activewear: 'Activewear',
  swimwear: 'Swimwear',
  lingerie: 'Lingerie',
  kidswear: 'Kidswear',
  streetwear: 'Streetwear',
  shoes: 'Shoes',
  sneakers: 'Sneakers',
  boots: 'Boots',
  'high-heels': 'High Heels',
  'bags-accessories': 'Bags',
  backpacks: 'Backpacks',
  'wallets-cardholders': 'Wallets & Cardholders',
  belts: 'Belts',
  scarves: 'Scarves',
  'caps': 'Caps', 'hats': 'Hats', 'beanies': 'Beanies',
  watches: 'Watches',
  eyewear: 'Eyewear',
  'jewellery-rings': 'Rings',
  'jewellery-necklaces': 'Necklaces',
  'jewellery-earrings': 'Earrings',
  'jewellery-bracelets': 'Bracelets',
  'beauty-skincare': 'Beauty & Skincare',
  'makeup-lipsticks': 'Makeup & Lipsticks',
  fragrance: 'Fragrance',
  'home-decor': 'Home Decor',
  furniture: 'Furniture',
  'tech-devices': 'Tech / Devices',
  food: 'Food & Snacks',
  beverages: 'Beverages',
  'snacks-food': 'Snacks',
  'supplements-wellness': 'Supplements & Wellness',
};

export function getCollectionLabel(slug: string | null | undefined): string {
  if (!slug) return 'General';
  if (COLLECTION_LABEL[slug]) return COLLECTION_LABEL[slug];
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getFamilyLabel(family: string): string {
  return FAMILY_LABEL_OVERRIDES[family] || family;
}

export interface SubGroup {
  label: string;
  scenes: PublicScene[];
}

export interface CollectionGroup {
  slug: string;
  label: string;
  totalCount: number;
  subGroups: SubGroup[];
}

export interface FamilyGroup {
  slug: string; // url-safe slug, e.g. "fashion-apparel"
  family: string; // raw family key (matches CATEGORY_FAMILY_MAP values)
  label: string;
  totalCount: number;
  previewThumbs: string[]; // up to 3 preview URLs
  collections: CollectionGroup[];
}

function familyToSlug(family: string): string {
  return family
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildFamilyTree(scenes: PublicScene[]): FamilyGroup[] {
  // family -> collection -> sub_category -> scenes
  const familyMap = new Map<string, Map<string, Map<string, PublicScene[]>>>();

  for (const s of scenes) {
    const collection = s.category_collection;
    if (!collection) continue;
    const family = CATEGORY_FAMILY_MAP[collection];
    if (!family) continue;

    if (!familyMap.has(family)) familyMap.set(family, new Map());
    const collMap = familyMap.get(family)!;

    if (!collMap.has(collection)) collMap.set(collection, new Map());
    const subMap = collMap.get(collection)!;

    const subKey = s.sub_category || 'General';
    if (!subMap.has(subKey)) subMap.set(subKey, []);
    subMap.get(subKey)!.push(s);
  }

  const orderedFamilies = [
    ...FAMILY_ORDER.filter(f => familyMap.has(f)),
    ...Array.from(familyMap.keys())
      .filter(f => !FAMILY_ORDER.includes(f as any))
      .sort(),
  ];

  return orderedFamilies.map(family => {
    const collMap = familyMap.get(family)!;
    const collections: CollectionGroup[] = Array.from(collMap.entries()).map(
      ([slug, subMap]) => {
        const subGroups: SubGroup[] = Array.from(subMap.entries()).map(
          ([label, sceneList]) => ({ label, scenes: sceneList }),
        );
        const totalCount = subGroups.reduce((acc, g) => acc + g.scenes.length, 0);
        return {
          slug,
          label: getCollectionLabel(slug),
          totalCount,
          subGroups,
        };
      },
    );

    const totalCount = collections.reduce((acc, c) => acc + c.totalCount, 0);

    // Pick 3 preview thumbs from the first scenes that have an image.
    const previewThumbs: string[] = [];
    for (const c of collections) {
      for (const g of c.subGroups) {
        for (const s of g.scenes) {
          if (s.preview_image_url) previewThumbs.push(s.preview_image_url);
          if (previewThumbs.length >= 3) break;
        }
        if (previewThumbs.length >= 3) break;
      }
      if (previewThumbs.length >= 3) break;
    }

    return {
      slug: familyToSlug(family),
      family,
      label: getFamilyLabel(family),
      totalCount,
      previewThumbs,
      collections,
    };
  });
}

export function usePublicSceneLibrary() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-scene-library'],
    queryFn: fetchPublicScenes,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const scenes = data ?? [];
  const families = useMemo(() => buildFamilyTree(scenes), [scenes]);
  const totalScenes = scenes.length;

  return { scenes, families, totalScenes, isLoading, error };
}
