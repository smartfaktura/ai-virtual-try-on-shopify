

# Two Small Sidebar Tweaks

## 1. Replace "MAIN" header with a thin separator line
**File: `src/components/app/AppShell.tsx`** (line ~202-204)

Replace the `<p>Main</p>` label with a simple `<div>` separator line (thin `h-px bg-white/[0.06]` with small vertical margin), or remove it entirely since the "Create Visuals" button already visually separates the logo from the nav list.

## 2. Show "YOUR PLAN: X" next to the plan name in CreditIndicator
**File: `src/components/app/CreditIndicator.tsx`** (line ~22-23)

Change the plan label from `{planConfig.name} Plan` to `Your plan: {planConfig.name}` (keeping the same uppercase styling).

## Files Changed
1. `src/components/app/AppShell.tsx` — remove "MAIN" text, replace with separator or nothing
2. `src/components/app/CreditIndicator.tsx` — change plan label to "Your plan: X"

