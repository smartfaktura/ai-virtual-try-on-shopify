

# Add Generation Cost Tracking to Admin Status

## Overview
Add a "Generation Costs" section to the admin dashboard that estimates real API costs based on job type and timeframe, using the existing time range selector (today/yesterday/24h/7d/30d).

## Cost Model
Since actual API costs vary by provider, we'll use approximate per-credit-cost estimates baked into the DB function. The function will sum `credits_reserved` for completed jobs within the timeframe, then multiply by a cost-per-credit constant. We can also break down by job type since different types use different APIs with different costs.

Approximate cost mapping (configurable constants in the DB function):
- **Freestyle** (Lovable AI gateway): ~$0.02 per credit
- **Workflow** (Lovable AI gateway): ~$0.02 per credit  
- **Try-On** (Lovable AI gateway): ~$0.02 per credit
- **Upscale** (Lovable AI gateway): ~$0.01 per credit

These are rough estimates — you can adjust the multipliers anytime.

## Changes

### 1. Database: Update `admin_generation_stats` function
Add cost fields to the returned JSON:
- `credits_spent` — total credits reserved for completed jobs in timeframe
- `cost_breakdown` — array of `{ job_type, credits, jobs, est_cost }` per job type
- `total_est_cost` — sum of estimated costs

The function already receives `p_hours` and filters by timeframe, so we just add aggregation queries.

### 2. `src/pages/AdminStatus.tsx`
- Add `credits_spent`, `cost_breakdown`, and `total_est_cost` to the `StatsData` interface
- Add a new "Generation Costs" card section between the time-range metrics and the failures table:
  - **Total Credits Used** (in timeframe) — MetricCard with CreditCard icon
  - **Est. API Cost** — MetricCard showing `$X.XX` with DollarSign icon
  - A small breakdown table: job type | jobs | credits | est. cost

### Files
- Database migration: update `admin_generation_stats` function
- `src/pages/AdminStatus.tsx` — add cost section UI

