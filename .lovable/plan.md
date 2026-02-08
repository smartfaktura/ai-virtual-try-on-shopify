

# Make Credits and Plan Dynamic and Upgrade-Focused

## The Problem

The current user (info@tsimkus.lt / Tomas Simkus) is on the **free plan** with **180 credits**, but the app hardcodes "Growth Plan" everywhere with a 2,500 credit quota. This is misleading and breaks the upgrade funnel.

The sidebar shows "GROWTH PLAN" and "/ 2,500" when the user actually has no paid plan at all.

## What Changes

### 1. CreditContext reads the plan from the database

The `CreditContext` currently only fetches `credits_balance`. It will also fetch the `plan` field from the profiles table and expose it, along with a computed plan config (name, monthly quota, next upgrade tier).

A plan configuration map will translate the database `plan` value into display info:

```text
free    -> "Free"     / 20 credits (signup bonus)  / upgrade to Starter
starter -> "Starter"  / 1,000 credits/month        / upgrade to Growth
growth  -> "Growth"   / 2,500 credits/month        / upgrade to Pro
pro     -> "Pro"      / 6,000 credits/month        / upgrade to Enterprise
```

### 2. CreditIndicator shows real plan and smart upgrade CTA

The sidebar credit widget will:
- Display the actual plan name (e.g., "Free Plan" not "Growth Plan")
- Show the correct credit quota for the plan
- For free users: show a more prominent upgrade nudge
- Progress bar scales to actual plan quota

### 3. BuyCreditsModal becomes plan-aware

The "Credits and Plan" modal will:
- Show the actual current plan in the balance header
- **Top Up tab**: Same credit packs but with correct "after" totals
- **Upgrade Plan tab**: Show the recommended next plan based on current plan (not always Pro). For free users, highlight Growth (most popular). Show a side-by-side current vs. next plan comparison with clear benefits and savings

### 4. Settings page uses dynamic plan

The Settings page also hardcodes `currentPlanId = 'growth'` and `creditsTotal = 2500`. These will read from the CreditContext instead.

---

## Technical Details

### File: `src/contexts/CreditContext.tsx`
- Add `plan` state (string, default `'free'`)
- Fetch `plan` alongside `credits_balance` from profiles table: `.select('credits_balance, plan')`
- Add a `PLAN_CONFIG` map with quota, display name, and next plan ID for each tier
- Export `plan`, `planConfig` (name, monthlyCredits, nextPlanId) in the context value

### File: `src/components/app/CreditIndicator.tsx`
- Remove hardcoded `PLAN_NAME = 'Growth'` and `PLAN_CREDITS = 2500`
- Read `plan` and `planConfig` from `useCredits()`
- Display dynamic plan name and credits quota
- For free plan users, make the "Upgrade" CTA more prominent (slightly larger, with a subtle highlight)

### File: `src/components/app/BuyCreditsModal.tsx`
- Remove hardcoded `CURRENT_PLAN_ID = 'growth'` and `PLAN_CREDITS = 2500`
- Read plan info from `useCredits()`
- Dynamically determine `currentPlan` and `nextPlan` from `pricingPlans` based on the user's actual plan
- For free users on the Upgrade tab: show Growth as "Recommended" (it's the most popular) with Starter as a smaller alternative
- For Starter users: recommend Growth
- For Growth users: recommend Pro
- Update the balance header to show the real plan name and quota
- Add a "Your current plan" vs "Recommended" comparison layout in the Upgrade tab

### File: `src/pages/Settings.tsx`
- Remove hardcoded `currentPlanId = 'growth'` and `creditsTotal = 2500`
- Read plan info from `useCredits()` context
- The "Current Plan" card will show the actual plan badge and credit quota

### File: `src/data/mockData.ts`
- Add a `free` plan entry to `pricingPlans` array so it can be referenced (with 0 monthlyPrice and 20 credits)

