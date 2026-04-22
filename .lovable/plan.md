
## Unify all feedback / request banners to the `/app/workflows` aesthetic

Today there are four different visual treatments for what is essentially the same pattern ("tell us something / request something"):

| Component | Look today | Where it appears |
|---|---|---|
| `WorkflowRequestBanner` ✅ canonical | Rounded-2xl card, soft primary tint, **avatar stack**, dark pill **"Share Request"** button, expands inline | `/app/workflows` footer |
| `SceneRequestBanner` | Same shape, slightly different copy | Step 2 of Product Images |
| `FeedbackBanner` | Thin pill row, **Popover** with bug/feature/general chips | Dashboard, Settings, Jobs, Products, Creative Drops |
| `MissingRequestBanner` | Dashed muted box (full) **or** tiny inline pill (compact) | Generate page, freestyle Model/Scene catalog modals + selector chips, WorkflowSettingsPanel |

Goal: make all of them look like `WorkflowRequestBanner` — same rounded card, same avatar stack, same dark "Share Request" pill, same inline expand/textarea/submit. Only the **headline / subheadline / placeholder / submit button label** change per use case. The bug/feature/general type chips inside `FeedbackBanner` are kept (they're the only piece with extra logic), but moved into the unified card layout.

### Approach — one canonical component, three modes

**1. Promote `WorkflowRequestBanner` into a generic `<UnifiedFeedbackBanner />`** (`src/components/app/UnifiedFeedbackBanner.tsx`).

Props (all optional except `category`):
```ts
type Mode = 'request' | 'feedback';      // request = single CTA, feedback = type chips
type Density = 'default' | 'compact';    // compact for inside dropdowns / catalog modals
interface Props {
  category: 'workflow' | 'scene' | 'model' | 'general';
  mode?: Mode;                           // default: 'request'
  title?: string;                        // headline
  subtitle?: string;                     // sub copy under headline
  placeholder?: string;                  // textarea placeholder
  ctaLabel?: string;                     // collapsed-state button — default 'Share Request' / 'Share feedback'
  submitLabel?: string;                  // expanded-state submit — default 'Send Request' / 'Send Feedback'
  showImageLinkField?: boolean;          // for scene/model requests
  showAvatars?: boolean;                 // default true; false in compact
  density?: Density;                     // default 'default'
  className?: string;
}
```

Visual rules — locked to the `/app/workflows` look:
- `rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6` (default), `rounded-xl p-3` (compact).
- Avatar stack from `TEAM_MEMBERS.slice(0,4)` on the left (hidden in compact and on mobile when space-constrained — same responsive rules already in `WorkflowRequestBanner`).
- Headline `text-sm font-semibold`, subtitle `text-xs text-muted-foreground`.
- CTA: dark filled pill with `MessageSquarePlus` icon — `rounded-full font-semibold px-5 h-10 gap-1.5`.
- Expanded state: textarea (`min-h-[80px] text-sm bg-background`), optional URL input, Cancel link + filled pill submit. `submitted` state = primary check circle + thank-you copy. All matches `WorkflowRequestBanner` exactly.
- `feedback` mode adds the three type chips (Bug / Feature / General) **above** the textarea — same rounded chip style already used in `FeedbackBanner`. Submit disabled until type + message both present.

Submit logic: same `supabase.from('feedback').insert({...})` call all four currently use, with `type` = `'feature'` for request mode (or selected chip in feedback mode), and `message` prefixed with `[${category}-request] …` for request mode (preserves admin filtering already wired in `AdminFeedbackPanel`).

**2. Replace the four old components with thin re-exports** so existing imports don't break:
- `WorkflowRequestBanner` → `<UnifiedFeedbackBanner category="workflow" mode="request" title="Missing a Visual Type for your brand?" subtitle="Tell us what you need — we'll build it and add it to our lineup." />`
- `SceneRequestBanner` → `<UnifiedFeedbackBanner category="scene" mode="request" title="Missing a scene for your products?" subtitle="Tell us what you need — we'll create it in 1–2 business days." showImageLinkField />`
- `FeedbackBanner` → `<UnifiedFeedbackBanner category="general" mode="feedback" title="Help us improve VOVV.AI" subtitle="Bugs, feature ideas, anything — we read every one." ctaLabel="Share feedback" submitLabel="Send Feedback" />`
- `MissingRequestBanner` → `<UnifiedFeedbackBanner category={category} mode="request" density={compact ? 'compact' : 'default'} ... showImageLinkField={showImageLinkField} title={...} placeholder={...} />`

Keep the original file paths exporting these wrappers so no call site needs touching.

**3. Compact density tweaks** for inside Catalog modals / selector dropdowns / Generate's inline grids:
- Drop avatars, drop subtitle.
- Smaller paddings (`p-3`), title `text-xs font-medium`, button `size="sm"` pill.
- Same dark pill style and same primary-tinted card — so even compact instances clearly read as the same family as the workflows footer card.

### Visual consistency this delivers

- Every "ask the team" / "send feedback" surface in the app now uses the **same primary-tinted rounded card + dark pill CTA** as `/app/workflows`.
- The avatar stack visually grounds the team-driven promise everywhere it fits.
- Differences are reduced to **copy + one optional reference-URL field + optional type chips** — exactly your ask.

### Files

**New**
- `src/components/app/UnifiedFeedbackBanner.tsx`

**Edited (each becomes a 5-10 line wrapper around `UnifiedFeedbackBanner`)**
- `src/components/app/FeedbackBanner.tsx`
- `src/components/app/MissingRequestBanner.tsx`
- `src/components/app/WorkflowRequestBanner.tsx`
- `src/components/app/SceneRequestBanner.tsx`

**Untouched**
- `ContextualFeedbackCard` (post-generation thumbs-up/down survey — different UX pattern, not a "request" banner; leave as-is unless you want it folded in too).
- All call sites: `Dashboard`, `Settings`, `Jobs`, `Products`, `CreativeDrops`, `Generate`, `Workflows`, `WorkflowSettingsPanel`, `ModelSelectorChip`, `SceneSelectorChip`, `ModelCatalogModal`, `ProductImagesStep2Scenes` — all keep their current imports.
- `AdminFeedbackPanel` reads from same `feedback` table, no changes.

### Validation

- `/app/workflows` footer: pixel-identical to today (it IS the canonical look).
- `/app/dashboard`, `/app/settings`, `/app/jobs`, `/app/products`, `/app/creative-drops`: thin "Help us improve VOVV.AI" pill row is replaced by the avatar-stack card with a dark "Share feedback" pill; opens inline with the three type chips above the textarea. No popover anymore.
- Product Images Step 2 "Missing a scene" card: unchanged look (already canonical).
- Generate page "Missing a model / scene" full-width banners: now match the workflows aesthetic.
- Compact instances inside Model/Scene catalog modals & selector chip dropdowns: same primary-tinted card style, just smaller — no more dashed muted box.
- All submissions still land in the `feedback` table with the existing `[${category}-request]` prefixes intact.

### Open question

The current `FeedbackBanner` is a **popover** (button opens a floating panel). The unified banner expands **inline** like the workflows version. That's the intended change — confirm you want the inline expansion everywhere (preferred for consistency), or whether `Dashboard` / `Settings` / `Jobs` / `Products` / `CreativeDrops` should keep popover behavior. Default in this plan: inline expansion everywhere.
