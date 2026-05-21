# Brand Scenes — guided creation UX

Mirror the Brand Model wizard pattern: an entry chooser, then a small set of focused picker questions, then preview + save. Only UX/flow here — no backend, generation, or storage decisions in this plan.

## Route shape

- `/app/brand-scenes` — grid of the user's saved scenes + big "+ New scene" card.
- `/app/brand-scenes/new` — wizard (this plan).
- After save → returns to grid with the new scene appearing under its chosen category.

## Wizard flow

```text
[ Step 0: How do you want to start? ]   ← chooser, like Brand Model
   ├─ Describe it (guided picks)          ← default, recommended
   ├─ Upload a reference photo
   └─ Generate from a prompt
              │
              ▼
[ Step 1: Where does this scene belong? ]   ← always shown, always first after chooser
              │
              ▼
[ Step 2: Tell us about the scene ]          ← guided question chips (mode-dependent)
              │
              ▼
[ Step 3: Preview 3 variations ]             ← pick favorite
              │
              ▼
[ Step 4: Name + save ]
```

A persistent top progress strip ("Category · Details · Preview · Save") shows where the user is. Back button between steps, no data loss.

## Step 0 — Chooser (entry card)

Three large equal-weight cards, same visual language as Brand Model's `chooser` mode:

- **Describe it** — "Answer a few quick questions, we'll build it for you." (Sparkles icon)
- **Upload a photo** — "We'll analyze your reference and turn it into a reusable scene." (Camera icon)
- **From a prompt** — "Write what you want, we'll generate the scene image." (Wand2 icon)

Recommended badge on "Describe it" since it's the most guided.

## Step 1 — Category (always first, you flagged this)

One question, big tappable tiles with a real preview thumbnail per category (reuse the collage previews already used on `/product-visual-library`):

> **Where should this scene live?**

The 10 tiles mirror the Product Visual Library hub exactly, sourced from `src/data/aiProductPhotographyCategories.ts` so any future category edits stay in sync:

1. Fashion
2. Footwear
3. Beauty & Skincare
4. Fragrance
5. Jewelry
6. Bags & Accessories
7. Home & Furniture
8. Food & Beverage
9. Supplements & Wellness
10. Electronics & Gadgets

Layout: responsive grid — 2 cols mobile, 3 cols tablet, 4–5 cols desktop. Each tile = square preview image + name overlay + subcategory count chip. Selected state = primary ring + check badge.

After picking a category, a **second inline picker reveals the subcategories** for that category (chips, single-select, optional — the scene can live at the top level if none picked). Subcategories come from the same data file (e.g. Fashion → Clothing · Dresses · Hoodies · Jeans · Jackets · Activewear · Swimwear · Lingerie).

Secondary (optional, collapsible "Refine fit"):
- **People in scene?** segmented: On-model · Product only · Either.
- **Aesthetic tone hint** (optional): Editorial · Lifestyle · Studio · Flatlay — purely a sort tag inside the chosen category.

Continue button disabled until a category is picked.

## Step 2 — Details (depends on the chosen mode)

### Mode A — Describe it (guided picks)

Compact `Section` cards stacked vertically, each one question with chip pickers. Picks are single-select unless noted. Skippable (any field can stay empty).

1. **Setting** — Indoor studio · Living room · Bedroom · Kitchen · Bathroom · Cafe · Street · Beach · Garden · Forest · Desert · Rooftop · Custom (text)
2. **Time & light** — Morning soft · Golden hour · Midday bright · Overcast diffuse · Studio strobe · Window light · Night/neon · Candle warm
3. **Color mood** — Neutral warm · Neutral cool · Pastel · Earth tones · Monochrome · Bold accent · Muted editorial
4. **Surface / floor** (only if relevant for category) — Linen · Marble · Concrete · Wood · Tile · Sand · Grass · Paper
5. **Props** — multi-select: Glassware · Plants · Books · Fabric drape · Stones · Flowers · Mirror · None
6. **Camera framing** — Wide environment · Medium · Tight detail · Overhead flatlay · Low angle
7. **Aspect ratio** — 1:1 · 4:5 · 3:4 · 16:9 (default 4:5)
8. **Optional free-text** — "Anything else? (mood, references, dos and don'ts)" — small textarea, 280 char cap.

A live one-line "scene summary" sentence updates underneath as the user picks ("Soft morning light, linen surface, pastel mood, tight detail, 4:5") — gives them confidence without showing the raw prompt.

### Mode B — Upload reference

- Big drop zone (drag/drop, paste, file picker) — same component pattern as Brand Model reference upload.
- Once uploaded: AI auto-analyzes the image and pre-fills name + a short description + suggested category (user can override category from Step 1 — they'll see "Suggested: Editorial" and can switch).
- Rights & content acknowledgement checkbox (same wording as Brand Model: "I have rights to this image and it follows our content policy").
- Optional "Anything to emphasize?" short textarea.

### Mode C — From a prompt

- Single textarea with placeholder examples ("Warm sunlit Mediterranean kitchen, linen napkins, soft window light…").
- Below the textarea: 6–8 "Quick add" chips that append style cues to the prompt (Cinematic · Soft window light · Editorial · Cozy · Minimal · Moody · Bright · Pastel).
- Aspect ratio picker (same as Mode A).

## Step 3 — Preview 3 variations

- Same layout as Brand Model variation picker: 3 image tiles in a row, clickable to select, selected one shows a Check.
- "Regenerate this one" hover action on each tile.
- Branded loading state while generating (reuse pattern from `BrandedLoadingState`, copy adapted: "Composing your scene…", "Setting the light…", "Styling props…").

## Step 4 — Name + save

- Auto-filled name field (e.g. "Sunlit linen kitchen" derived from picks). Editable, 32 char cap with counter.
- Read-only summary chips of what's saved: Category · Products · People · Aspect.
- Primary CTA: "Save scene" → toast "Scene added to {Category}" → navigate back to grid.
- Secondary: "Save and use now" → navigates straight to Visual Studio with this scene pre-selected.

## Empty state on `/app/brand-scenes`

Big centered card with three example thumbnails fanned out, headline "Design your own signature scenes", subline "Backgrounds, environments, and moods that match your brand. Use them on any product, anytime." Single CTA → "+ Create your first scene".

## Grid item (after at least one scene exists)

Square thumbnail · name overlay on hover · tiny category badge top-left · 3-dot menu: Edit · Rename · Duplicate · Delete. Same density as Brand Models grid.

## Microcopy rules

- Follow the project's no-terminal-period rule on headers and one-line subtitles.
- Always say "scene" (singular) in CTAs, never "preset" or "template" or "workflow".

## Things I'm deliberately handling that are easy to miss

- **Category is step 1, not buried** — so the user always knows where the scene will end up before answering anything else.
- **Mode chooser sits above category** so the user picks "how" before "what", matching Brand Model's mental model and avoiding wasted picks if they switch modes.
- **Live summary sentence** during guided picks — keeps the wizard feeling smart without exposing the underlying prompt.
- **AI pre-fill on upload** auto-suggests name + category, but never silently overrides a category the user already chose.
- **People-in-scene toggle** at Step 1 so the scene picker in Visual Studio can correctly include/exclude it for on-model vs product-only workflows.
- **"Save and use now"** secondary CTA closes the loop — user sees their scene working immediately, not just stored.
- **Skippable details** — every Step 2 chip is optional; only Category is required. Lowers friction for power users.

## Out of scope (for this UX pass)

- Backend tables, RLS, edge functions, storage paths.
- Admin promotion of brand scenes to public Discover.
- Team sharing.
- Editing the underlying reference image after save.
