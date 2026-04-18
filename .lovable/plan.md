
The previous sweep missed several files. User reports `/app/models` still has bad buttons, and library preview card modals too. Let me grep for remaining offenders before planning.
<lov-tool-use id="toolu_vrtx_01SrP4XRteL2dbrLf6XJAdrs" name="code--search_files" integration-id="code" data="{\"query\": \"className=\\\"[^\\\"]*\\\\b(h-11|h-12|rounded-xl|rounded-md|rounded-2xl|text-base|px-6|px-8)\\\\b\", \"include_patterns\": \"src/pages/**,src/components/app/**\", \"exclude_patterns\": \"*Sidebar*,*CreditIndicator*,Dashboard.tsx,Landing*\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_011LW95QPvJNRK9VDfnAdBv1" name="code--search_files" integration-id="code" data="{\"query\": \"rounded-full\", \"include_patterns\": \"src/pages/Models.tsx,src/components/app/LibraryDetailModal.tsx,src/components/app/library/**\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_011fDHrjxM25iaHuzJ6GsAB6" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/pages\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_016ABbQRwAw3R1j8jn2zhfPH" name="code--search_files" integration-id="code" data="{\"query\": \"className=\\\"[^\\\"]*(h-11|h-12|rounded-xl|rounded-2xl|text-base)\", \"include_patterns\": \"src/pages/**,src/components/app/**\", \"exclude_patterns\": \"*Sidebar*,*CreditIndicator*,Dashboard*,Landing*\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_018J9urST4zT22rn5X9TeybQ" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/pages\"}">
</lov-tool-use>
The search shows MANY non-button matches (cards, containers using rounded-xl/2xl which is fine). I need to scope to `<Button` and form controls specifically. Let me also check the actual /app/models page which is `BrandModels.tsx` and library cards/modals.
<lov-tool-use id="toolu_vrtx_01CcC9odehrtPCbv1H6CrvCF" name="code--search_files" integration-id="code" data="{\"exclude_patterns\": \"*Sidebar*,Dashboard*,Landing*,TryFree*,Home*,About*,Pricing*,Blog*,Careers*,Press*,Team*,Contact*,Privacy*,Terms*,Cookie*,Changelog*,HelpCenter*,Status*,NotFound*,Auth*,ResetPassword*,Public*\", \"include_patterns\": \"src/pages/**,src/components/app/**\", \"query\": \"(<Button|<Input|<Textarea|<SelectTrigger)[^>]*className=\\\"[^\\\"]*\\\\b(h-11|h-12|h-9|rounded-full|rounded-xl|rounded-2xl|rounded-md|text-base|px-6|px-7|px-8)\\\\b\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01RbhBtbtuAqx7YDhjZsf1Yy" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/BrandModels.tsx\"}">
</lov-tool-use>
I have enough context. The /app/models is `BrandModels.tsx`. The user has consistent pain — many `<Button>` and form controls with hardcoded `h-11/h-12/rounded-xl/rounded-full/rounded-md/text-base/px-6/px-7/px-8` overrides across 33 app files (excluding marketing).

Let me present a tight plan.

<lov-plan>

### Real fix: full sweep of 33 files

The previous sweep missed many because it didn't scope to `<Button|<Input|<Textarea|<SelectTrigger>` elements specifically. New audit found **358 override matches across 33 files** in `src/pages/**` and `src/components/app/**` (marketing/landing pages excluded).

### Standard (locked, no debate)
| Element | Spec |
|---|---|
| Page-header / hero CTA | `size="pill"` → `h-10 rounded-full px-5` |
| Standard button | default → `h-10 rounded-lg px-4` |
| Small button (chips, table actions) | `size="sm"` → `h-8 rounded-lg` |
| Input / Select / Textarea | inherit defaults: `h-10 rounded-lg px-3.5 text-sm` |

### Override patterns to strip
On `<Button>`, `<Input>`, `<Textarea>`, `<SelectTrigger>`:
- `h-9` (when not paired with `size="sm"`), `h-11`, `h-12` → strip
- `rounded-md`, `rounded-xl`, `rounded-2xl` → strip
- `rounded-full` (on standard buttons) → convert to `size="pill"` if it's a primary/header CTA, otherwise strip
- `text-base`, `text-sm` (on Inputs — already default), `px-6/7/8`, `py-5/6` → strip

Container `rounded-xl/2xl` on `<div>`, `<Card>`, `<TabsList>` etc. is FINE and stays — only stripping from interactive primitives.

### Files to edit (33)

**Pages (18):**
`AddProduct.tsx`, `AdminFeedback.tsx`, `AdminModels.tsx`, `AdminPlanPopups.tsx`, `AdminProductImageScenes.tsx`, `AdminScenes.tsx`, `AdminTrendWatch.tsx`, `BrandModels.tsx`, `CreativeDrops.tsx`, `Discover.tsx`, `Freestyle.tsx`, `Jobs.tsx`, `MobileUpload.tsx`, `Onboarding.tsx`, `ProductImages.tsx`, `Settings.tsx`, `Templates.tsx`, `TryShot.tsx`, `Workflows.tsx`

**App components (15):**
`AdminSubmissionsPanel.tsx`, `BrandProfileWizard.tsx` (if present), `CreativeDropWizard.tsx`, `DiscoverDetailModal.tsx`, `DropDetailModal.tsx`, `LibraryDetailModal.tsx`, `ManualProductTab.tsx`, `NoCreditsModal.tsx`, `ProductsEmptyUpload.tsx`, `StoreImportTab.tsx`, `WorkflowCard.tsx`, `WorkflowPreviewModal.tsx`, `freestyle/*`, `library/*`, `video/*` (any with overrides)

### Skip-list (intentional, do not touch)
- `src/components/app/AppSidebar*.tsx` — bespoke shimmer pills
- `src/components/app/CreditIndicator.tsx`
- `src/pages/Dashboard.tsx` — 6 hero cards with `min-h-[44px]` (oversized by design)
- `src/pages/features/**`, `Landing*.tsx`, `TryFree.tsx`, `Home.tsx`, `Pricing.tsx`, `About.tsx`, `Auth.tsx`, public pages — marketing context
- Sub-buttons inside FreestyleSettingsChips and similar chip-groups using `<button>` (not `<Button>`) — those are visual chips, not CTAs

### Process
1. For each of the 33 files, run targeted `line_replace` per offending line: strip the override classes, convert primary header/modal-footer CTAs to `size="pill"`.
2. Re-run grep audit; only skip-list matches should remain.
3. Spot-check `/app/models`, `/app/library` (detail modal), `/app/products`, `/app/freestyle`, `/app/workflows`, `/app/jobs`, `/app/onboarding`.

### Acceptance
- Grep `(<Button|<Input|<Textarea|<SelectTrigger)[^>]*className="[^"]*\b(h-9|h-11|h-12|rounded-md|rounded-xl|rounded-2xl|rounded-full|text-base|px-6|px-7|px-8)\b"` returns ZERO hits in `src/pages/**` and `src/components/app/**` (excluding skip-list).
- Library detail modal, BrandModels (/app/models), all wizard footers visually consistent: `h-10 rounded-lg` form fields, `h-10 rounded-full` (pill) for primary CTAs, `h-10 rounded-lg` for secondary.

