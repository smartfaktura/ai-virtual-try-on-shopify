

## Plan: Admin System Status Dashboard

### What we're building
A new `/app/admin/status` page showing generation system health metrics across 24h / 7d / 30d time ranges — success rates, failure counts, average generation times, stuck jobs, and recent failures. Admin-only access using the existing `useIsAdmin` hook pattern.

### Changes

**1. New page: `src/pages/AdminStatus.tsx`**
- Admin guard using `useIsAdmin` (redirects non-admins)
- Time range toggle: 24h / 7d / 30d
- Stat cards at the top: Total jobs, Completed, Failed, Cancelled, Success rate, Avg generation time, Max generation time, Currently stuck
- Table of recent failed jobs (last 20) showing job type, error message, timestamp, user plan
- All data fetched from `generation_queue` table via Supabase client queries (no new DB functions needed — the table is readable by authenticated users but we'll use the admin role check in the UI)

**2. `src/App.tsx`** — Add lazy import + route at `/app/admin/status`

### Data queries (all client-side from `generation_queue`)
- Stats: count by status, filtered by `created_at` for the selected range
- Avg/max generation time: `completed_at - started_at` for completed jobs
- Stuck jobs: status = 'processing' AND `started_at` < now - 5 min
- Recent failures: status = 'failed', ordered by `created_at` desc, limit 20

### Security
- RLS on `generation_queue` only allows users to see their own jobs
- We need a DB function `admin_generation_stats` (security definer) that returns aggregated stats for admins, since the admin can't query all users' jobs via RLS
- Alternative: Create a simple edge function or DB function that checks admin role and returns stats

### Revised approach — DB function
Create a `admin_generation_stats` security definer function that:
1. Checks `has_role(auth.uid(), 'admin')`
2. Returns aggregated stats (counts by status, avg/max times) for a given time range
3. Returns recent failed jobs

This keeps it clean and avoids RLS issues.

### Database migration
One new function: `admin_generation_stats(p_hours integer)` returning JSONB with:
- `total`, `completed`, `failed`, `cancelled`, `stuck`
- `avg_seconds`, `max_seconds`
- `recent_failures` (array of {id, job_type, error_message, created_at, user_plan})

### File summary
| File | Change |
|------|--------|
| Migration | New `admin_generation_stats` function |
| `src/pages/AdminStatus.tsx` | New admin dashboard page |
| `src/App.tsx` | Add route + lazy import |

### No impact on existing functionality
- Read-only queries on `generation_queue`
- New page behind admin guard
- No changes to generation logic

