// Auto-classify Discover preset subcategory based on tags/prompt/title.
// Admin-only. Supports dry-run preview before committing.
// Only writes the `subcategory` column on rows where it IS NULL — never touches other fields.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Canonical family id (kebab-case, matches discover_presets.category) → canonical sub-type slugs.
// Mirrors src/lib/onboardingTaxonomy SUB_TYPES_BY_FAMILY. Edge functions can't import from src/.
const SUBS_BY_FAMILY: Record<string, string[]> = {
  fashion: ['garments', 'hoodies', 'dresses', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'streetwear'],
  footwear: ['shoes', 'sneakers', 'boots', 'high-heels'],
  'bags-accessories': ['bags-accessories', 'backpacks', 'wallets-cardholders', 'belts', 'scarves', 'hats-small'],
  watches: ['watches'],
  eyewear: ['eyewear'],
  jewelry: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'],
  'beauty-fragrance': ['beauty-skincare', 'makeup-lipsticks', 'fragrance'],
  home: ['home-decor', 'furniture'],
  tech: ['tech-devices'],
  'food-drink': ['food', 'beverages', 'snacks-food'],
  wellness: ['supplements-wellness'],
};

// Loose tag/prompt phrases → canonical slug. Word-boundary, case-insensitive.
const SLUG_SYNONYMS: Record<string, string[]> = {
  garments: ['clothing', 'garment', 'tee', 't-shirt', 'shirt', 'top', 'blouse'],
  hoodies: ['hoodie', 'sweatshirt'],
  dresses: ['dress', 'gown'],
  jeans: ['jean', 'denim'],
  jackets: ['jacket', 'blazer', 'coat'],
  activewear: ['activewear', 'sportswear', 'gym', 'yoga', 'pilates', 'athleisure', 'leggings'],
  swimwear: ['swimwear', 'bikini', 'swimsuit'],
  lingerie: ['lingerie', 'underwear', 'bra'],
  streetwear: ['streetwear', 'urban'],
  shoes: ['shoe', 'loafer', 'derby', 'oxford'],
  sneakers: ['sneaker', 'trainer', 'runner'],
  boots: ['boot', 'bootie'],
  'high-heels': ['heel', 'heels', 'stiletto', 'pump'],
  'bags-accessories': ['handbag', 'tote', 'clutch', 'shoulder bag', 'crossbody', 'purse'],
  backpacks: ['backpack', 'rucksack'],
  'wallets-cardholders': ['wallet', 'cardholder', 'card holder'],
  belts: ['belt'],
  scarves: ['scarf', 'scarves'],
  'hats-small': ['hat', 'cap', 'beanie', 'beret'],
  'jewellery-rings': ['ring', 'rings'],
  'jewellery-necklaces': ['necklace', 'pendant', 'chain'],
  'jewellery-earrings': ['earring', 'earrings', 'stud', 'hoop'],
  'jewellery-bracelets': ['bracelet', 'bangle', 'cuff'],
  'beauty-skincare': ['skincare', 'serum', 'moisturizer', 'cream', 'cleanser', 'toner'],
  'makeup-lipsticks': ['lipstick', 'makeup', 'mascara', 'foundation', 'blush', 'lip gloss'],
  fragrance: ['fragrance', 'perfume', 'eau de parfum', 'cologne', 'body mist'],
  'home-decor': ['decor', 'vase', 'candle', 'art'],
  furniture: ['furniture', 'chair', 'sofa', 'table', 'lamp'],
  'tech-devices': ['headphone', 'speaker', 'phone', 'laptop', 'wearable', 'device'],
  food: ['meal', 'dish', 'snack', 'dessert'],
  beverages: ['beverage', 'coffee', 'tea', 'wine', 'spirit', 'soft drink', 'juice'],
  'snacks-food': ['snack', 'chips', 'cookie', 'bar'],
  'supplements-wellness': ['supplement', 'vitamin', 'wellness', 'protein'],
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findSlugMatch(family: string, haystack: string): string | null {
  const subs = SUBS_BY_FAMILY[family?.toLowerCase()] ?? [];
  const text = haystack.toLowerCase();
  for (const slug of subs) {
    const candidates = [slug, ...(SLUG_SYNONYMS[slug] ?? [])];
    for (const c of candidates) {
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(c.toLowerCase())}([^a-z0-9]|$)`, 'i');
      if (re.test(text)) return slug;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(url, serviceKey);

    // Auth: admin only
    const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!auth) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: userData } = await supabase.auth.getUser(auth);
    if (!userData?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: roleRow } = await supabase.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json().catch(() => ({}));
    const dryRun: boolean = body?.dryRun !== false; // default true

    const { data: rows, error } = await supabase
      .from('discover_presets')
      .select('id, category, subcategory, title, prompt, tags, scene_name')
      .is('subcategory', null);
    if (error) throw error;

    let classified = 0;
    let skipped = 0;
    let unknownFamily = 0;
    const updates: { id: string; subcategory: string }[] = [];
    const byFamily: Record<string, number> = {};
    const unknownFamilies: Record<string, number> = {};

    for (const r of rows ?? []) {
      const fam = (r.category || '').toLowerCase();
      if (!SUBS_BY_FAMILY[fam]) {
        unknownFamily++;
        unknownFamilies[fam || '(empty)'] = (unknownFamilies[fam || '(empty)'] ?? 0) + 1;
        continue;
      }
      const haystack = [r.title, r.prompt, r.scene_name, ...(r.tags ?? [])].filter(Boolean).join(' ');
      const slug = findSlugMatch(fam, haystack);
      if (slug) {
        classified++;
        byFamily[fam] = (byFamily[fam] ?? 0) + 1;
        updates.push({ id: r.id, subcategory: slug });
      } else {
        skipped++;
      }
    }

    if (!dryRun && updates.length > 0) {
      for (const u of updates) {
        await supabase.from('discover_presets').update({ subcategory: u.subcategory }).eq('id', u.id);
      }
    }

    return new Response(JSON.stringify({
      total: rows?.length ?? 0,
      classified,
      skipped,
      unknownFamily,
      byFamily,
      unknownFamilies,
      dryRun,
      committed: !dryRun ? updates.length : 0,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
