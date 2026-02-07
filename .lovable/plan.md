

## Comprehensive Dashboard Overhaul: Real Data + Feature-Aware First-Run Experience

### What This Solves

The current Dashboard is broken in two fundamental ways:

1. **Fake data everywhere.** It imports `mockMetrics` and `mockJobs` from a static file, showing 234 images generated, 847 credits, 12.4s avg time, and 78% publish rate to a user who has done nothing. This destroys trust immediately after signup.

2. **No connection to actual app features.** The landing page promises "Upload -> Choose Model/Scene -> Get Visual Set" but the Dashboard shows a generic metrics grid and a table of fake jobs. There's no mention of Virtual Try-On, Brand Profiles, Workflows, or Creative Drops -- the core features the user just signed up for.

---

### The New Dashboard: Two Modes

The Dashboard will detect user state from the database and show one of two views:

**Mode A: First-Run** (no generation jobs yet) -- A guided experience that mirrors the landing page's 3-step promise and introduces all five product hubs.

**Mode B: Returning User** (has at least 1 generation job) -- Real metrics, real recent jobs, and quick-access cards for the two generation modes (Product Photos + Virtual Try-On).

---

### Mode A: First-Run Dashboard Layout

```text
+----------------------------------------------------------+
| Welcome to brandframe.ai, [First Name]!                   |
| You have 5 credits to start creating.    [Buy Credits]    |
+----------------------------------------------------------+

+----------------------------------------------------------+
| GET STARTED                                     1/3 done  |
|                                                            |
| [x] 1. Upload Your First Product        [Go to Products]  |
|        Add a product image to generate visuals from.       |
|                                                            |
| [ ] 2. Create Your Brand Profile    [Go to Brand Profiles] |
|        Set your visual style -- tone, lighting, colors.    |
|                                                            |
| [ ] 3. Generate Your First Visual Set   [Go to Workflows]  |
|        Product Photos or Virtual Try-On -- your choice.    |
+----------------------------------------------------------+

+----------------------------------------------------------+
| TWO WAYS TO CREATE                                        |
|                                                            |
| +------------------------+ +---------------------------+  |
| | Product Photos         | | Virtual Try-On            |  |
| | Studio, lifestyle,     | | Put your clothing on      |  |
| | editorial shots for    | | diverse AI models with    |  |
| | any product type.      | | any pose and environment. |  |
| |                        | |                           |  |
| | 1-2 credits/image      | | 3 credits/image           |  |
| | [Start Generating]     | | [Try It]                  |  |
| +------------------------+ +---------------------------+  |
+----------------------------------------------------------+

+----------------------------------------------------------+
| EXPLORE WORKFLOWS                                         |
| 6 cards: Ad Refresh (20), Product Listing (10),           |
|   Website Hero (6), Lifestyle (10), On-Model (10),        |
|   Social Pack (12)                                        |
+----------------------------------------------------------+
```

Each checklist step shows a live checkmark based on real database counts:
- Step 1 checks: `user_products` count > 0
- Step 2 checks: `brand_profiles` count > 0
- Step 3 checks: `generation_jobs` count > 0

The "Two Ways to Create" section directly reflects the app's dual generation capability: standard product photography (using `generate-product` edge function) and Virtual Try-On (using `generate-tryon` edge function for clothing). This matches what the landing page promises in Step 2.

---

### Mode B: Returning User Dashboard Layout

```text
+----------------------------------------------------------+
| [Low Credits Banner - if applicable]                      |
+----------------------------------------------------------+

+----------------------------------------------------------+
| Metrics Row (4 cards, all real data)                      |
|                                                            |
| Images Generated | Credits    | Products   | Active       |
| [count from DB]  | [from DB]  | [from DB]  | Schedules    |
| last 30 days     | available  | in library | [from DB]    |
+----------------------------------------------------------+

+----------------------------------------------------------+
| QUICK CREATE                                              |
|                                                            |
| +------------------------+ +---------------------------+  |
| | Product Photos         | | Virtual Try-On            |  |
| | For any product type.  | | For clothing products.    |  |
| | [Generate]             | | [Try On]                  |  |
| +------------------------+ +---------------------------+  |
+----------------------------------------------------------+

+----------------------------------------------------------+
| RECENT JOBS                               [View all]      |
| [Real jobs from generation_jobs table]                    |
| Product | Workflow | Status | Credits | Date | Actions    |
+----------------------------------------------------------+

+----------------------------------------------------------+
| UPCOMING DROPS                                            |
| [Next scheduled creative drop, if any]                    |
| "Monthly Refresh" -- Next run: Feb 15    [View Schedules] |
+----------------------------------------------------------+
```

Key differences from current Dashboard:
- **Images Generated**: Real count from `generation_jobs` where `status = 'completed'` and `created_at > 30 days ago`
- **Credits Remaining**: Real balance from `profiles.credits_balance` (not mock 847)
- **Products in Library**: Real count from `user_products`
- **Active Schedules**: Real count from `creative_schedules` where `active = true`
- **Recent Jobs**: Real data from `generation_jobs` joined with `user_products` and `workflows`
- **Upcoming Drops**: Real data from `creative_schedules` showing next run date

---

### Files to Create (3 new)

**1. `src/components/app/OnboardingChecklist.tsx`**

A 3-step vertical checklist with:
- Live completion state per step (green checkmark when done)
- Progress indicator ("1 of 3 complete")
- Each step is a clickable card with navigation button
- Steps: Upload Product, Create Brand Profile, Generate Visual Set
- Uses Card, Button, Badge from existing UI components

**2. `src/components/app/GenerationModeCards.tsx`**

Two side-by-side cards introducing the dual generation capability:
- **Product Photos**: Icon, description, credit cost (1-2/image), CTA navigates to `/app/generate`
- **Virtual Try-On**: Icon, description, credit cost (3/image), CTA navigates to `/app/generate` with try-on mode hint
- Shows "Try-On" badge on the second card (matching WorkflowCard pattern)
- Compact layout -- not overwhelming for new users

**3. `src/components/app/UpcomingDropsCard.tsx`**

A compact card that:
- Fetches the next active `creative_schedule` from the database
- Shows schedule name, frequency, and next run date
- Links to `/app/creative-drops`
- Shows "No schedules yet" with a CTA to create one if empty

---

### Files to Modify (2 existing)

**4. `src/pages/Dashboard.tsx` -- Major rewrite**

Current state: Imports `mockMetrics` and `mockJobs`, renders static fake data.

New implementation:
- Fetch real data using `@tanstack/react-query`:
  - `profiles` table: `first_name`, `credits_balance`
  - `user_products`: count
  - `brand_profiles`: count
  - `generation_jobs`: recent 5 (with all fields), plus 30-day completed count
  - `creative_schedules`: count of active schedules
  - `workflows`: list for the workflow preview grid
- Detect first-run: `isNewUser = (jobCount === 0)`
- Render Mode A (first-run) or Mode B (returning) based on detection
- Remove all imports from `@/data/mockData`
- Keep existing `JobDetailModal`, `StatusBadge`, `LowCreditsBanner` usage
- The Recent Jobs table changes: show "Workflow" column instead of "Template" (since workflows are the primary abstraction now), and join with `user_products` for the product thumbnail/title

**5. `src/contexts/CreditContext.tsx` -- Connect to real data**

Current state: Initializes balance from `mockShop.creditsBalance` (hardcoded 847).

New implementation:
- Fetch `credits_balance` from `profiles` table on mount (using the authenticated user's ID)
- Keep the same `CreditContext` interface (balance, isLow, isCritical, isEmpty, deductCredits, etc.)
- After `deductCredits()`, update the database via Supabase
- After `addCredits()`, update the database
- Remove import of `mockShop` from `@/data/mockData`
- This change ensures the credit balance shown everywhere (sidebar `CreditIndicator`, `LowCreditsBanner`, dashboard metrics) reflects the real database value

---

### Database Queries

All queries use existing tables with RLS already enabled. No schema changes needed.

```typescript
// User profile (name + credits)
const { data: profile } = await supabase
  .from('profiles')
  .select('first_name, credits_balance')
  .eq('user_id', user.id)
  .single();

// Product count
const { count: productCount } = await supabase
  .from('user_products')
  .select('*', { count: 'exact', head: true });

// Brand profile count
const { count: brandProfileCount } = await supabase
  .from('brand_profiles')
  .select('*', { count: 'exact', head: true });

// Recent jobs (5 most recent)
const { data: recentJobs } = await supabase
  .from('generation_jobs')
  .select('*, user_products(title, image_url), workflows(name)')
  .order('created_at', { ascending: false })
  .limit(5);

// 30-day generation count
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const { count: generatedCount } = await supabase
  .from('generation_jobs')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'completed')
  .gte('created_at', thirtyDaysAgo.toISOString());

// Active schedule count
const { count: scheduleCount } = await supabase
  .from('creative_schedules')
  .select('*', { count: 'exact', head: true })
  .eq('active', true);

// Workflows (for preview grid)
const { data: workflows } = await supabase
  .from('workflows')
  .select('*')
  .order('name');
```

---

### What Gets Removed

- All `mockMetrics` and `mockJobs` references in Dashboard
- `mockShop.creditsBalance` initialization in CreditContext
- Fake trend percentages (12% up, 15% down)
- Hardcoded "234 / 300 images" usage bar
- "Publish Rate" metric (deprecated feature)
- "Avg. Generation Time" metric (not tracked in DB; replaced by "Products in Library")

---

### What Stays the Same

- `MetricCard` component (reused with real data)
- `StatusBadge` component (reused for job statuses)
- `EmptyStateCard` component (reused when no jobs in returning user mode)
- `LowCreditsBanner` (shown based on real credit balance)
- `JobDetailModal` (opens when clicking View on a job)
- `AppShell` sidebar navigation (unchanged)
- `PageHeader` wrapper (unchanged)
- Existing workflows in the database (6 system workflows already seeded)

---

### Summary of All Changes

| File | Action | Purpose |
|---|---|---|
| `src/pages/Dashboard.tsx` | Rewrite | Real data, two-mode layout, remove mocks |
| `src/contexts/CreditContext.tsx` | Modify | Real credits from DB, remove mockShop |
| `src/components/app/OnboardingChecklist.tsx` | Create | 3-step guided setup card |
| `src/components/app/GenerationModeCards.tsx` | Create | Product Photos vs Try-On introduction |
| `src/components/app/UpcomingDropsCard.tsx` | Create | Next scheduled drop preview |

