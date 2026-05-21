# Brand Scenes — backend-first architecture

Goal: ship a system where users can spin up their own reusable scenes across **all 30+ product subcategories** we already support, answer a smart set of questions, and get a saved, replayable scene that drops into Visual Studio exactly like our built-in scenes. Backend, taxonomy and question schema first — UI is the thin layer on top.

## 1. Single source of truth for categories

Reuse the taxonomy already in code so nothing forks:

- **10 families** from `src/data/aiProductPhotographyCategories.ts` (Fashion, Footwear, Beauty & Skincare, Fragrance, Jewelry, Bags & Accessories, Home & Furniture, Food & Beverage, Supplements & Wellness, Electronics & Gadgets).
- **35+ subcategories** from `CATEGORY_FAMILY_MAP` in `src/lib/sceneTaxonomy.ts` (garments, dresses, hoodies, jeans, jackets, activewear, swimwear, lingerie, kidswear, streetwear, wedding-dress, shoes, sneakers, boots, high-heels, bags-accessories, backpacks, wallets, belts, scarves, caps, hats, beanies, watches, eyewear, jewellery-rings, …-necklaces, …-earrings, …-bracelets, beauty-skincare, makeup-lipsticks, fragrance, home-decor, furniture, tech-devices, food, beverages, snacks-food, supplements-wellness).

New shared module `src/lib/brandScenes/taxonomy.ts` re-exports the family list + subcategory slugs + display labels so the wizard, the prompt builder, the DB enums and the Visual Studio picker all read the same map. No second list.

User picks **family first** (10 tiles, real preview thumbnails from the visual library hub), then **subcategory chip** (filtered to that family — every subcategory the platform supports is reachable). A scene can target one family + one subcategory, or family + "All".

## 2. Question schema (data-driven, not hardcoded UI)

Questions live in a typed config, not JSX, so we can extend without touching the wizard shell:

```ts
// src/lib/brandScenes/questionSchema.ts
type Question =
  | { id: string; kind: 'single'; label: string; options: Option[]; appliesTo?: Filter }
  | { id: string; kind: 'multi'; label: string; options: Option[]; max?: number; appliesTo?: Filter }
  | { id: string; kind: 'text'; label: string; max: number; appliesTo?: Filter };

type Filter = {
  families?: Family[];
  subcategories?: string[];
  requiresPeople?: boolean;
};
```

Each question declares the categories it applies to via `appliesTo`. The wizard renders only relevant questions — a Fragrance scene never sees outfit questions, a Footwear scene auto-hides the "footwear" outfit slot, etc.

### Question groups (all optional except Category)

1. **Scope** — family (required), subcategory (optional), people-in-scene (On-model / Product only / Either).
2. **Scene** — setting, time/light, color mood, surface, props, framing, aspect ratio, free-text notes.
3. **Outfit direction** (only when people = On-model or Either): vibe, silhouette, top, bottom, footwear, outerwear, palette, fabrics, accessories, hair, notes. Category-aware overrides:
   - Footwear locks footwear slot to "matches product"
   - Swimwear / lingerie collapses top+bottom into "swim/lingerie style"
   - Bags & Accessories defaults to supporting neutral wardrobe
   - Beauty / Skincare / Fragrance defaults to "soft neutral basics", collapsed
   - Jewelry defaults to bare neckline / minimal layers
4. **Product fidelity hints** — only when subcategory implies product type quirks (e.g. fragrance bottle glass cues, sneaker hard-shadow, food plating). Pulled from same trigger-block library already used by `product_image_scenes.trigger_blocks`.

The wizard reads this schema, the prompt builder reads this schema, and the saved scene stores the raw answers (not just the rendered prompt) so we can re-render prompts later when the engine improves.

## 3. Data model

New table `user_scenes` (user-scope; separate from admin `custom_scenes` and `product_image_scenes` so RLS stays simple):

- `id`, `user_id`, `created_at`, `updated_at`, `is_active`
- `name` (auto-derived, editable, 60 char)
- `family` (text, enum-validated against taxonomy module)
- `subcategory` (text, nullable)
- `aspect_ratio` (text, default `4:5`)
- `people_mode` (`on_model` | `product_only` | `either`)
- `answers` (jsonb — raw question → answer map, source of truth)
- `outfit_direction` (jsonb — structured outfit object, null when no people)
- `prompt_template` (text — rendered from answers via prompt builder, stored for fast read)
- `trigger_blocks` (text[] — auto-attached from subcategory)
- `preview_image_url` (text — chosen variation from Step 3)
- `preview_thumbs` (text[] — all 3 generated previews for re-pick)
- `source` (`guided` | `upload` | `prompt`) — how it was created
- `reference_image_url` (text, nullable — for upload mode)

RLS: owner-only CRUD. SECURITY DEFINER RPC `get_my_brand_scenes()` for listing; a future `get_org_brand_scenes()` slot is reserved for team sharing.

Visual Studio scene picker hits a unified RPC `list_scenes_for_family(family, subcategory)` that merges `product_image_scenes` (public) + `custom_scenes` (admin curated) + `user_scenes` (owner's). One pipeline, three sources, identical render contract.

## 4. Prompt builder

`src/lib/brandScenes/buildPrompt.ts` is a pure function: `(answers, taxonomyEntry) → { prompt, triggerBlocks, aspectRatio, negative }`. It mirrors the structure of the existing scene prompt system (Setting · Light · Mood · Surface · Props · Framing · Outfit · Saugikliai), so user scenes feed the same generation pipeline as admin scenes. No new generation path, no new edge function — we reuse `freestyle` / `process-queue` exactly.

Outfit answers compile into the same `outfit_direction` block the engine already consumes (see existing Scene-Controlled Outfits memory), so user scenes can override outfits identically to admin scenes.

## 5. Generation & preview loop

Step 3 of the wizard generates **3 variations** through the existing freestyle endpoint with the freshly built prompt. User picks 1 → that becomes `preview_image_url`. We keep all 3 in `preview_thumbs` so they can switch later from the edit screen without re-spending credits.

Credits: charge standard freestyle rate × 3 for preview generation, separate from "use this scene" generations afterward. Show the exact cost before Step 3 runs.

## 6. Upload-mode and prompt-only-mode

- **Upload**: reuse existing `create-scene-from-image` edge function. It already returns name, description, suggested category, prompt hint. Pre-fills the answers JSON; user can override every field before save.
- **Prompt-only**: single textarea → routed through the same builder by stuffing the raw prompt into `answers.freeText` and skipping derived fields.

Both modes write to the same `user_scenes` table — one shape, three entry points.

## 7. Visual Studio integration

`/app/workflows` scene picker gains a "My scenes" tab and the user's scenes also surface inside their matching family tab (so a user's "Sunlit linen kitchen" appears under Home & Furniture next to the public scenes). Hidden behind the same `family` / `subcategory` filters everything else uses.

Brand Profile already stores `preferred_scenes` — extend the picker logic to surface a user's own scenes there first.

## 8. Implementation order

1. Taxonomy module (`src/lib/brandScenes/taxonomy.ts`) — pure exports, no UI.
2. Question schema (`src/lib/brandScenes/questionSchema.ts`) — typed config.
3. Prompt builder (`src/lib/brandScenes/buildPrompt.ts`) — pure function + unit tests.
4. `user_scenes` table + RLS + `get_my_brand_scenes` + `list_scenes_for_family` RPCs.
5. `useBrandScenes()` hook for CRUD.
6. Wizard pages (`/app/brand-scenes`, `/app/brand-scenes/new`) — thin shell over the schema.
7. Visual Studio picker integration.
8. Brand Profile preferred scenes surfacing.

## Out of scope (explicit)

- Team / org sharing (RPC slot reserved, no UI).
- Admin promotion of user scenes to public Discover.
- Editing the underlying reference image after save.
- New generation engine — we reuse the existing freestyle pipeline as-is.
