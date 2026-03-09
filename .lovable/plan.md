

## Fix BuyCreditsModal Plan Cards for Active Subscribers

### Problem
From the screenshot: user is on **Pro** plan but the modal shows:
1. **Growth** highlighted as "MOST POPULAR" even though it's a downgrade — misleading
2. Lower plans show "Get Free", "Get Starter", "Get Growth" instead of "Downgrade to X"
3. Current plan (Pro) doesn't have prominent visual distinction beyond a small "CURRENT" badge

### Changes — `src/components/app/BuyCreditsModal.tsx`

**1. Fix CTA labels** (line 233):
- Plans below current: "Downgrade to {name}"
- Plans above current: "Upgrade to {name}"  
- Current plan: "Current Plan" (unchanged)

**2. Fix highlighting logic** (line 241-247):
- When user has an active plan, suppress `p.highlighted` ("MOST POPULAR" badge) for plans below the current plan
- Instead, highlight the **current plan** card with the primary border/ring treatment
- Only show the "MOST POPULAR" badge when the user is on Free or not logged in

**3. Fix card styling priority**:
- Current plan gets `border-2 border-primary ring-1 ring-primary/10`
- Plans below current get default muted styling
- Plans above current get subtle hover treatment

