// Auto-classify Discover preset subcategory based on tags/prompt/title.
// Admin-only. Supports dry-run preview before committing.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mirror of SUB_TYPES_BY_FAMILY from src/lib/onboardingTaxonomy (kebab-case family ids).
// Keep in sync if taxonomy changes — only slugs are needed here.
const SUBS_BY_FAMILY: Record<string, string[]> = {
  fashion: ['clothing', 'hoodies', 'dresses', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'streetwear', 'garments'],
  footwear: ['sneakers', 'shoes', 'boots', 'heels', 'sandals'],
  bags: ['handbags', 'backpacks', 'totes', 'clutches', 'travel-bags'],
  accessories: ['hats', 'belts', 'scarves', 'gloves', 'wallets'],
  jewelry: ['rings', 'necklaces', 'earrings', 'bracelets', 'watches'],
  beauty: ['skincare', 'makeup', 'haircare', 'tools'],
  fragrance: ['eau-de-parfum', 'eau-de-toilette', 'cologne', 'body-mist'],
  fragrances: ['eau-de-parfum', 'eau-de-toilette', 'cologne', 'body-mist'],
  eyewear: ['sunglasses', 'optical'],
  electronics: ['headphones', 'phones', 'laptops', 'wearables', 'speakers'],
  home: ['decor', 'kitchen', 'bedding', 'lighting'],
  food: ['snacks', 'beverages', 'desserts', 'meals'],
  beverage: ['coffee', 'tea', 'spirits', 'wine', 'soft-drinks'],
  beverages: ['coffee', 'tea', 'spirits', 'wine', 'soft-drinks'],
  pets: ['toys', 'food', 'accessories'],
  kids: ['toys', 'clothing', 'accessories'],
  sports: ['equipment', 'apparel', 'footwear'],
};

function findSlugMatch(family: string, haystack: string): string | null {
  const subs = SUBS_BY_FAMILY[family?.toLowerCase()] ?? [];
  const text = haystack.toLowerCase();
  for (const slug of subs) {
    // word-boundary, also accept hyphen-as-space
    const variants = [slug, slug.replace(/-/g, ' '), slug.replace(/-/g, '')];
    for (const v of variants) {
      const re = new RegExp(`(^|[^a-z0-9])${v.replace(/[.*+?^${}()|[\\\\]\\\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
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
    const updates: { id: string; subcategory: string }[] = [];
    const byFamily: Record<string, number> = {};

    for (const r of rows ?? []) {
      const fam = (r.category || '').toLowerCase();
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
      // Batch update
      for (const u of updates) {
        await supabase.from('discover_presets').update({ subcategory: u.subcategory }).eq('id', u.id);
      }
    }

    return new Response(JSON.stringify({
      total: rows?.length ?? 0,
      classified,
      skipped,
      byFamily,
      dryRun,
      committed: !dryRun ? updates.length : 0,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
