

# Evolve nanobanna into a Visual Studio with Creative Drops

## Overview

This plan transforms the existing AI product image generator into a "Visual Studio for e-commerce brands" by introducing three new core concepts -- **Brand Profiles**, **Workflows**, and **Creative Drops** -- while preserving all existing edge functions, database tables, auth, and landing page structure. The key shift: users choose *what* they want to create (not *how*), and automation becomes the default mode of operation.

## What Stays Untouched

- Edge functions: `generate-product` and `generate-tryon` (logic unchanged, only new optional parameters passed)
- Database tables: `profiles`, `user_products`, `generation_jobs` (only additive columns)
- Auth flow (`/auth`, AuthContext, ProtectedRoute)
- Landing page layout (10 sections, all component files remain)
- Upload UX, file upload hooks, image utils
- Credit system structure (CreditContext, thresholds, cost calculations)

## What Changes

### Phase 1: Fix Build Errors + Remove Polaris from Pages

Before adding new features, finish the Polaris migration. Six files still import from `@shopify/polaris`:

| File | Status |
|------|--------|
| `Dashboard.tsx` | Uses Polaris `BlockStack`, `InlineGrid`, `Card`, `Text`, `Button`, `DataTable`, `InlineStack`, `Thumbnail` + Polaris icons causing TS errors |
| `Generate.tsx` (~2000 lines) | Heaviest Polaris usage: `BlockStack`, `InlineStack`, `Card`, `Text`, `Button`, `Modal`, `TextField`, `Thumbnail`, `Badge`, `Checkbox`, `Select`, `InlineGrid`, `Divider`, `Banner`, `ProgressBar`, `Collapsible`, `Icon` |
| `Templates.tsx` | Uses `BlockStack`, `InlineStack`, `Card`, `Text`, `Button`, `DataTable`, `Badge`, `TextField`, `Select`, `InlineGrid`, `Icon` |
| `Jobs.tsx` | Uses `BlockStack`, `InlineStack`, `Card`, `Text`, `Button`, `DataTable`, `TextField`, `Select`, `Thumbnail`, `InlineGrid`, `Icon` |
| `Settings.tsx` | Uses `BlockStack`, `InlineStack`, `Card`, `Text`, `Button`, `TextField`, `Select`, `Checkbox`, `Divider`, `Banner`, `InlineGrid`, `ProgressBar`, `Badge`, `ButtonGroup` |
| `BulkGenerate.tsx` | Uses `BlockStack`, `InlineStack`, `Card`, `Text`, `Button`, `Banner`, `Divider` |
| `BulkSettingsCard.tsx` | Uses `Card`, `BlockStack`, `InlineStack`, `Text`, `Button`, `Badge`, `Divider`, `Banner`, `Select`, `ChoiceList` |
| `BulkProgressTracker.tsx` | Likely uses Polaris components |
| `BulkResultsView.tsx` | Likely uses Polaris components |

All will be rewritten using shadcn/ui + Tailwind. After this, `@shopify/polaris` and `@shopify/polaris-icons` are removed from `package.json`, and the `AppProvider` wrapper and Polaris CSS import are removed from `App.tsx`.

### Phase 2: Database Schema -- New Tables

**New table: `brand_profiles`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| name | text | e.g. "My Premium Brand" |
| brand_description | text | What the brand is about |
| tone | text | luxury / clean / bold / minimal / playful |
| lighting_style | text | e.g. "soft diffused", "dramatic side" |
| background_style | text | studio / lifestyle / gradient / contextual |
| color_temperature | text | warm / neutral / cool |
| composition_bias | text | centered / rule-of-thirds / dynamic |
| do_not_rules | text[] | Array of things to avoid |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

RLS: Users can only CRUD their own brand profiles.

**New table: `workflows`** (seeded with defaults)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | e.g. "Ad Refresh Set" |
| description | text | What this workflow produces |
| default_image_count | integer | 6-20 |
| required_inputs | text[] | ['product', 'model', 'season'] |
| recommended_ratios | text[] | ['1:1', '4:5'] |
| uses_tryon | boolean | Whether this workflow needs model selection |
| template_ids | text[] | Which internal templates to use |
| is_system | boolean | True for built-in workflows |
| created_at | timestamptz | Default now() |

RLS: System workflows readable by all authenticated users. No user-created workflows in v1.

**New table: `creative_schedules`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK to auth.users |
| brand_profile_id | uuid | FK to brand_profiles |
| name | text | Schedule name |
| frequency | text | monthly / biweekly |
| products_scope | text | all / selected |
| selected_product_ids | uuid[] | If scope is "selected" |
| workflow_ids | uuid[] | Which workflows to run |
| active | boolean | Default true |
| next_run_at | timestamptz | When to run next |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

RLS: Users can only CRUD their own schedules.

**New table: `creative_drops`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| schedule_id | uuid | FK to creative_schedules |
| user_id | uuid | FK to auth.users |
| run_date | timestamptz | When this drop ran |
| status | text | scheduled / generating / ready / failed |
| generation_job_ids | uuid[] | References to generation_jobs |
| summary | jsonb | Stats: total images, workflows used, etc. |
| created_at | timestamptz | Default now() |

RLS: Users can only view their own drops.

**Update `generation_jobs` table** -- add columns:

| Column | Type | Notes |
|--------|------|-------|
| brand_profile_id | uuid | Nullable, FK to brand_profiles |
| workflow_id | uuid | Nullable, FK to workflows |
| creative_drop_id | uuid | Nullable, FK to creative_drops |

### Phase 3: Brand Profiles Feature

**New files:**
- `src/pages/BrandProfiles.tsx` -- List + create/edit brand profiles
- `src/components/app/BrandProfileForm.tsx` -- Form for creating/editing a brand profile
- `src/components/app/BrandProfileCard.tsx` -- Card displaying a brand profile summary

**UX Flow:**
1. User navigates to "Brand Profiles" from sidebar
2. If no profiles exist, guided empty state: "Create your first Brand Profile"
3. Form collects: name, description, tone, lighting, background, color temperature, composition, do-not rules
4. Saved profiles appear as selectable cards
5. During generation, user picks which Brand Profile to apply
6. Brand Profile settings automatically inject into the prompt (replacing the manual brand kit accordion)

### Phase 4: Workflows Feature

**New files:**
- `src/pages/Workflows.tsx` -- Browse system workflows
- `src/components/app/WorkflowCard.tsx` -- Card for each workflow
- `src/data/workflows.ts` -- Seed data for system workflows

**System Workflows (seeded):**

| Workflow | Images | Uses Try-On | Description |
|----------|--------|-------------|-------------|
| Ad Refresh Set | 20 | No | Fresh ad creatives across multiple styles |
| Product Listing Set | 10 | No | E-commerce ready product images |
| Website Hero Set | 6 | No | Wide-format hero images |
| Lifestyle Set | 10 | No | Lifestyle context shots |
| On-Model Set | 10 | Yes | Virtual try-on with diverse models |
| Social Media Pack | 12 | No | Multi-ratio pack (1:1, 4:5, 16:9) |

**UX Flow:**
1. User sees workflow cards with descriptions and image counts
2. Clicking "Create Visual Set" opens the generation flow
3. User picks product(s) and brand profile
4. Workflow internally maps to the right templates and settings
5. Users never see raw templates -- they see outcome descriptions

### Phase 5: Refactor Generate Flow

The current Generate page (~2000 lines) is rebuilt around workflows:

**New flow:**
1. Choose Workflow (replaces "Choose Template")
2. Select Product(s) (upload or pick from library)
3. Select Brand Profile
4. If workflow uses try-on: Select Model + Pose
5. Generate Visual Set
6. Review + Download results

The existing `generate-product` and `generate-tryon` edge functions are called unchanged. The workflow just selects the right template internally and passes brand profile settings instead of manual brand kit toggles.

### Phase 6: Creative Drops (Automation)

**New files:**
- `src/pages/CreativeDrops.tsx` -- Main Creative Drops page
- `src/components/app/ScheduleForm.tsx` -- Create/edit schedule
- `src/components/app/DropCard.tsx` -- Card showing a completed/upcoming drop
- `src/components/app/DropDetailModal.tsx` -- Modal showing all images from a drop
- `supabase/functions/run-creative-drop/index.ts` -- Edge function that executes a drop

**UX Flow:**
1. User navigates to "Creative Drops" from sidebar
2. Empty state: "Set up your first Creative Drop schedule"
3. Create schedule: pick workflows, products, brand profile, frequency
4. Dashboard shows upcoming drops and past drops
5. Each completed drop shows a gallery of generated images

**Automation Logic (Edge Function):**
- `run-creative-drop` function receives a schedule ID
- Fetches the schedule, brand profile, products, and workflow definitions
- For each product x workflow combination, calls `generate-product` or `generate-tryon`
- Aggregates results into a `creative_drops` record
- Updates `next_run_at` on the schedule

**Cron trigger:** A pg_cron job runs every hour, checks `creative_schedules` where `active = true AND next_run_at <= now()`, and calls the edge function for each due schedule.

### Phase 7: Update Navigation

**New sidebar items:**

| Item | Icon | Path |
|------|------|------|
| Dashboard | Home | /app |
| Products | Package | /app/products |
| Brand Profiles | Palette | /app/brand-profiles |
| Workflows | Layers | /app/workflows |
| Creative Drops | Calendar | /app/creative-drops |
| Library | Image | /app/library |
| Settings | Settings | /app/settings |

"Generate" becomes accessed through Workflows (clicking "Create Visual Set"), not a standalone nav item. "Templates" and "Jobs" are replaced by "Workflows" and "Library" respectively.

### Phase 8: Landing Page Copy Updates

No layout or component restructure. Only text content changes:

| Section | Change |
|---------|--------|
| Hero headline | "Professional Product Images In Seconds, Not Days" becomes "Create New Product Visuals Without New Photoshoots" |
| Hero subheadline | Update to mention automated monthly creative drops |
| Feature Grid | Update descriptions to emphasize brand consistency and automation |
| How It Works | Steps become: Upload Product, Set Your Brand Style, Get Monthly Visuals |
| Integration Section | Keep as-is (already de-Shopified) |
| Final CTA | Update copy to mention automation angle |

**New section: "Meet Your Studio Team"** -- inserted between BeforeAfterGallery and IntegrationSection:
- Product Photographer
- Lifestyle Photographer
- Ad Creative Specialist
- CRO Visual Optimizer
- Brand Consistency Manager
- Format and Export Assistant

These are conceptual roles, not separate agents -- presented as cards showing what the AI handles.

## Implementation Order

Due to dependencies, implementation must follow this sequence:

1. **Phase 1**: Fix build errors + rewrite remaining Polaris pages to shadcn/ui + remove Polaris dependency
2. **Phase 2**: Database migrations (new tables + updated columns)
3. **Phase 3**: Brand Profiles (pages + components + DB integration)
4. **Phase 4**: Workflows (seed data + pages + components)
5. **Phase 5**: Refactor Generate flow around workflows + brand profiles
6. **Phase 6**: Creative Drops (schedules, drops, cron automation)
7. **Phase 7**: Navigation restructure
8. **Phase 8**: Landing page copy updates + Studio Team section

Each phase builds on the previous one. Phases 1-2 are prerequisites for everything else. The entire implementation will be done incrementally across multiple responses to avoid overwhelming the build system.

## Technical Notes

- All new tables get RLS policies following the existing pattern (users access own data only)
- The `workflows` table uses `is_system = true` for built-in workflows -- no user CRUD in v1
- Edge functions `generate-product` and `generate-tryon` are NOT modified -- the orchestration happens client-side or in the new `run-creative-drop` function
- The `run-creative-drop` edge function calls the other edge functions via HTTP internally
- Brand profile data flows into the existing `brandSettings` parameter of the generation hooks
- Mock data in `mockData.ts` will be gradually replaced by real DB queries as features are connected
- The Polaris cleanup (Phase 1) must happen first to fix the current TS build errors before any new features can be added

