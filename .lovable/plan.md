

# Phase 2-8: Visual Studio Evolution -- Full Implementation Plan

## Phase 2: Database Schema Migrations

Create all four new tables and add columns to `generation_jobs`:

**Migration 1 -- `brand_profiles` table:**
- Columns: `id` (uuid PK), `user_id` (uuid, not null), `name` (text), `brand_description` (text, default ''), `tone` (text, default 'clean'), `lighting_style` (text, default 'soft diffused'), `background_style` (text, default 'studio'), `color_temperature` (text, default 'neutral'), `composition_bias` (text, default 'centered'), `do_not_rules` (text[], default '{}'), `created_at`, `updated_at`
- RLS: SELECT, INSERT, UPDATE, DELETE all scoped to `auth.uid() = user_id`
- Trigger: `update_updated_at_column` on UPDATE

**Migration 2 -- `workflows` table:**
- Columns: `id` (uuid PK), `name` (text), `description` (text), `default_image_count` (integer), `required_inputs` (text[]), `recommended_ratios` (text[]), `uses_tryon` (boolean, default false), `template_ids` (text[]), `is_system` (boolean, default true), `created_at`
- RLS: System workflows readable by all authenticated users (SELECT where `is_system = true`)
- Seed 6 system workflows: Ad Refresh Set (20), Product Listing Set (10), Website Hero Set (6), Lifestyle Set (10), On-Model Set (10, uses_tryon=true), Social Media Pack (12)

**Migration 3 -- `creative_schedules` table:**
- Columns: `id` (uuid PK), `user_id` (uuid, not null), `brand_profile_id` (uuid, FK to brand_profiles), `name` (text), `frequency` (text, default 'monthly'), `products_scope` (text, default 'all'), `selected_product_ids` (uuid[]), `workflow_ids` (uuid[]), `active` (boolean, default true), `next_run_at` (timestamptz), `created_at`, `updated_at`
- RLS: Full CRUD scoped to `auth.uid() = user_id`

**Migration 4 -- `creative_drops` table:**
- Columns: `id` (uuid PK), `schedule_id` (uuid, FK to creative_schedules), `user_id` (uuid, not null), `run_date` (timestamptz), `status` (text, default 'scheduled'), `generation_job_ids` (uuid[]), `summary` (jsonb), `created_at`
- RLS: SELECT, UPDATE scoped to `auth.uid() = user_id`

**Migration 5 -- Update `generation_jobs`:**
- Add nullable columns: `brand_profile_id` (uuid), `workflow_id` (uuid), `creative_drop_id` (uuid)
- Add index on `brand_profile_id` and `workflow_id`

## Phase 3: Brand Profiles Feature

**New files to create:**
- `src/pages/BrandProfiles.tsx` -- Main page listing brand profiles with empty state
- `src/components/app/BrandProfileForm.tsx` -- Dialog-based form for create/edit
- `src/components/app/BrandProfileCard.tsx` -- Card displaying a brand profile

**Behavior:**
- Lists all user brand profiles from the database using React Query
- Empty state with guided "Create your first Brand Profile" prompt
- Form collects: name, description, tone (dropdown), lighting style (dropdown), background style (dropdown), color temperature (dropdown), composition bias (dropdown), do-not rules (chip/tag input)
- Cards show profile name, tone badge, and key settings at a glance
- Edit/delete actions on each card
- All data persisted to `brand_profiles` table via Supabase client

## Phase 4: Workflows Feature

**New files to create:**
- `src/pages/Workflows.tsx` -- Browse system workflows as visual cards
- `src/components/app/WorkflowCard.tsx` -- Card for each workflow showing name, description, image count, ratios, and whether it uses try-on

**Behavior:**
- Fetches system workflows from database
- Each card has a "Create Visual Set" button that navigates to the generation flow with the workflow pre-selected
- Cards visually show: workflow name, description, default image count, recommended ratios, and a try-on badge if applicable
- No user-created workflows in v1 -- all are system-seeded

## Phase 5: Refactor Generate Flow

The existing `Generate.tsx` (~956 lines) is restructured to be workflow-driven:

**Key changes:**
- Step 1 becomes "Choose Workflow" instead of source/product/template selection
- The workflow determines which templates to use internally (users never see template names)
- Step 2 is "Select Product(s)" (keep existing upload + product library UX)
- Step 3 is "Select Brand Profile" (new dropdown/selector from user's brand profiles)
- Step 4 (conditional) is "Select Model + Pose" only if workflow.uses_tryon is true
- Step 5 is "Review & Generate" (shows summary of workflow + product + brand profile + cost)
- Brand profile settings replace the manual brand kit accordion (tone, background style come from the selected brand profile instead of manual dropdowns)
- The existing `useGenerateProduct` and `useGenerateTryOn` hooks are called unchanged -- the workflow just selects the right template internally and passes brand profile data

**Files modified:**
- `src/pages/Generate.tsx` -- Major restructure around workflow steps
- `src/hooks/useGenerateProduct.ts` -- Add optional `brandProfileId` to params (for DB tracking only, prompt logic unchanged)
- `src/hooks/useGenerateTryOn.ts` -- Same addition

## Phase 6: Creative Drops (Automation)

**New files to create:**
- `src/pages/CreativeDrops.tsx` -- Main page with schedule management + drop history
- `src/components/app/ScheduleForm.tsx` -- Dialog form to create/edit a creative schedule
- `src/components/app/DropCard.tsx` -- Card showing a completed or upcoming drop with status, date, image count
- `src/components/app/DropDetailModal.tsx` -- Modal showing all generated images from a drop in a gallery grid
- `supabase/functions/run-creative-drop/index.ts` -- Edge function that executes a creative drop

**UX:**
- Tab layout: "Schedules" tab and "Drops" tab
- Schedules tab: list of active/paused schedules with create button
- Schedule form: select workflows (multi-select), products (all or selected), brand profile, frequency (monthly/biweekly), schedule name
- Drops tab: timeline of past drops with status badges (scheduled/generating/ready/failed)
- Each drop card links to a detail modal showing the generated gallery

**Edge Function (`run-creative-drop`):**
- Accepts `schedule_id` in request body
- Authenticates using service role key
- Fetches the schedule, brand profile, products, and workflow definitions
- For each product x workflow combination, internally calls `generate-product` or `generate-tryon` edge functions
- Creates `generation_jobs` records with `creative_drop_id` set
- Aggregates results into a `creative_drops` record with summary stats
- Updates `next_run_at` on the schedule based on frequency

**Cron setup:**
- SQL migration to create a pg_cron job that runs every hour
- The cron calls the `run-creative-drop` edge function for each schedule where `active = true AND next_run_at <= now()`

## Phase 7: Update Navigation + Routing

**Changes to `AppShell.tsx` sidebar:**
- Dashboard (Home icon) -- `/app`
- Products (Package icon) -- `/app/products` (reuses existing product management from Generate's product selection)
- Brand Profiles (Palette icon) -- `/app/brand-profiles`
- Workflows (Layers icon) -- `/app/workflows`
- Creative Drops (Calendar icon) -- `/app/creative-drops`
- Library (Image icon) -- `/app/library` (replaces Jobs)
- Settings (Settings icon) -- `/app/settings`

**Changes to `App.tsx` routes:**
- Add routes: `/app/products`, `/app/brand-profiles`, `/app/workflows`, `/app/creative-drops`, `/app/library`
- Keep `/app/generate` (accessed from workflow "Create Visual Set" button)
- Remove `/app/templates` route (templates are internal now)
- Rename `/app/jobs` to `/app/library` (keep component, update labels)

**New page:**
- `src/pages/Products.tsx` -- Dedicated product management page (upload, list, edit, delete products from `user_products` table)

## Phase 8: Landing Page Copy Updates

**No layout changes.** Only text content updates across existing components:

**`HeroSection.tsx`:**
- Badge: "AI-powered visual studio for brands"
- Headline: "Create New Product Visuals" / "Without New Photoshoots"
- Subheadline: mention automated monthly creative drops and brand consistency
- Trust badge: change "5 free credits" to "5 free visuals"

**`FeatureGrid.tsx`:**
- Feature 1: "Brand-Consistent Photography" -- emphasize brand profiles and consistency
- Feature 2: "Virtual Try-On" -- keep but update description to mention workflow-driven
- Feature 3: "Creative Drops" -- replace "Bulk Generation" with automated drops messaging
- Feature 4: "Smart Workflows" -- replace "Smart Styling" with outcome-driven workflow messaging

**`HowItWorks.tsx`:**
- Step 1: "Upload Your Product" (keep)
- Step 2: "Set Your Brand Style" (replace "Choose Your Style" -- create brand profile once)
- Step 3: "Get Monthly Visuals" (replace "Get Pro Images Instantly" -- emphasize automation)

**`IntegrationSection.tsx`:**
- Remove Shopify/WooCommerce references
- Replace with: "Direct Upload", "Product Library", "Brand Profiles", "Automated Drops"

**`FinalCTA.tsx`:**
- Update headline to "Ready to Automate Your Product Photography?"
- Update description to mention Creative Drops

**New section -- `StudioTeamSection.tsx`:**
- Inserted between `BeforeAfterGallery` and `IntegrationSection` in `Landing.tsx`
- 6 conceptual "team member" cards: Product Photographer, Lifestyle Photographer, Ad Creative Specialist, CRO Visual Optimizer, Brand Consistency Manager, Format & Export Assistant
- Each card has an icon, title, and one-sentence description
- Clean grid layout matching existing section design patterns

## Implementation Sequence

Due to dependencies, implementation will follow this order:

1. Phase 2: Run all 5 database migrations (tables + columns + seeds)
2. Phase 3: Build Brand Profiles pages and components
3. Phase 7 (partial): Add new routes and navigation so new pages are accessible
4. Phase 4: Build Workflows page
5. Phase 5: Refactor Generate flow
6. Phase 6: Build Creative Drops + edge function
7. Phase 7 (complete): Clean up old routes (remove templates, rename jobs to library)
8. Phase 8: Landing page copy updates + Studio Team section

## Technical Details

- All new pages use React Query for data fetching with the existing Supabase client
- RLS policies follow the existing pattern: `auth.uid() = user_id` for all user-owned data
- Workflows table uses `is_system = true` for read-only system workflows
- No changes to existing `generate-product` or `generate-tryon` edge functions
- The `run-creative-drop` edge function calls the existing edge functions via HTTP internally using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
- Credit deduction logic remains in CreditContext -- Creative Drops will deduct credits when generating
- The `mockData.ts` references will be gradually replaced by real DB queries as pages are connected

