

# Add Platform-Wide Analytics to Admin Status Page

## What We Have
All the data is already in existing tables — no new tables or migrations needed. We can query:
- **Total images**: 1,750+ (1,172 freestyle + 578 workflow results)
- **Job breakdown by type**: freestyle (1,209), try-on (250), workflow (212), upscale (13)
- **Credits consumed**: 12,418 total
- **Users**: 10 registered, 5 have generated
- **Products**: 22 uploaded
- **Videos**: 14 created

## Plan

### 1. Create a database function `admin_platform_stats` (migration)

A `SECURITY DEFINER` function that returns all-time platform metrics in one call:

```sql
CREATE FUNCTION admin_platform_stats() RETURNS jsonb
```

Returns:
- `total_users`, `active_generators` (distinct users who completed a job)
- `total_images` (freestyle_generations count + sum of generation_jobs results array lengths)
- `total_videos`
- `total_products`
- `total_credits_spent`
- `jobs_by_type` (freestyle, workflow, tryon, upscale counts)
- `total_brand_profiles`, `total_drops`

Guarded by `has_role(auth.uid(), 'admin')`.

### 2. Update `src/pages/AdminStatus.tsx`

Add a new **"Platform Overview"** section above the existing time-range metrics:

- A section header: "All-Time Platform Stats"
- A grid of MetricCards showing:
  - Total Images Generated (with Image icon)
  - Total Users / Active Generators
  - Credits Consumed
  - Freestyle / Workflow / Try-On / Upscale job counts
  - Products Uploaded
  - Videos Created

This section loads independently from the time-range stats (separate `useQuery`), doesn't change with the time toggle, and sits at the top of the page as a permanent overview.

### Files Changed
- **New migration**: `admin_platform_stats` function
- **`src/pages/AdminStatus.tsx`**: Add platform overview section (~40 lines)

