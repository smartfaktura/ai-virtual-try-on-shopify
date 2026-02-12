
## Premium Billing UI Redesign

Redesign the entire Credits & Plan experience across the BuyCreditsModal, Settings Plans tab, NoCreditsModal, and PlanCard -- with luxurious spacing, clean column layouts, proper confirmation dialogs, and mobile optimization.

### What Changes

**1. Redesign `BuyCreditsModal.tsx` -- Premium dual-tab modal**

**Top Up tab:**
- Larger credit pack cards with more vertical spacing (p-6 instead of p-4)
- Subtle gradient backgrounds on cards, frosted glass border treatment
- Larger typography for credit amounts, clearer price-per-credit display
- "Best Value" badge with refined styling
- On mobile: stack cards vertically (1 column) instead of cramped 3-column grid

**Upgrade Plan tab:**
- Replace the current single-card + list layout with a **side-by-side column comparison** (2-3 columns on desktop, scrollable cards on mobile)
- Each plan shows: name, price, credits, top 4 features with checkmarks, and a CTA button
- Current plan gets a "Current" badge with disabled button
- Recommended plan gets a highlighted border and "Recommended" badge
- Enterprise shown as a compact banner at the bottom
- On mobile: horizontal scroll or stacked cards with proper spacing

**2. Redesign `PlanCard.tsx` -- Enhanced card design**
- Add `currentPlanId` and `subscriptionStatus` props for dynamic CTA logic
- Dynamic CTA labels: "Upgrade to [Plan]", "Downgrade to [Plan]", "Current Plan", "Reactivate"
- More generous padding (p-6), refined typography hierarchy
- Subtle hover elevation effect
- Feature list with better spacing between items
- Credits section with a refined pill/badge style instead of plain bg-muted box

**3. Redesign Settings Plans & Credits tab (`Settings.tsx`)**
- Current Plan card: add subscription status line ("Active", "Cancels on [date]"), add "Cancel Subscription" text button for paid users
- Plan grid: ensure the 4-column grid has generous gap (gap-6) and cards have equal height
- Credit packs section: match the new luxurious card style from BuyCreditsModal
- Add monthly/annual toggle with refined pill-style switcher
- Enterprise banner: keep the full-width layout but with more breathing room

**4. New `PlanChangeDialog.tsx` -- Confirmation dialogs**
- Four modes: upgrade, downgrade, cancel, reactivate
- **Upgrade**: Shows plan name, price, credit amount. "You'll be upgraded to [Plan] at $X/mo. Your new credits will be available immediately." with Confirm/Cancel buttons
- **Downgrade**: "Your plan will change to [Plan] at the end of your billing period on [date]. You'll keep your current credits and features until then."
- **Cancel**: "Your subscription will end on [date]. You'll keep your remaining [X] credits but won't receive monthly credits anymore."
- **Reactivate**: "Your [Plan] subscription will be restored. You'll continue receiving [X] credits/month."
- Uses the Dialog component with luxurious styling (rounded-2xl, generous padding)
- All confirm handlers are placeholder toasts for now (Stripe swap later)

**5. Redesign `NoCreditsModal.tsx` -- Cleaner zero-state**
- Larger, more spaced credit pack cards matching the new style
- More prominent "Upgrade Your Plan" CTA section with brief plan comparison
- Better mobile layout (single column cards)

**6. Update `CreditContext.tsx` -- Add subscription state**
- Add `subscriptionStatus` ('none' | 'active' | 'past_due' | 'canceling') with default 'none'
- Add `currentPeriodEnd` (Date | null)
- Add placeholder `cancelSubscription()` and `reactivateSubscription()` functions
- Read from profiles table when columns exist, fallback to defaults

### Mobile Optimization Details
- BuyCreditsModal: max-w-lg on mobile, single-column card layouts, larger touch targets (min-h-12 buttons)
- Plan comparison in modal: horizontal swipe carousel or stacked cards instead of side-by-side columns
- Settings Plans tab: 1 column on mobile, 2 on tablet, 4 on desktop for plan grid
- All cards use p-5 sm:p-6 for comfortable mobile spacing

### Files Changed
- **New**: `src/components/app/PlanChangeDialog.tsx`
- **Edit**: `src/components/app/BuyCreditsModal.tsx` -- complete redesign
- **Edit**: `src/components/app/PlanCard.tsx` -- new props, dynamic CTAs, premium styling
- **Edit**: `src/components/app/CreditPackCard.tsx` -- premium card redesign
- **Edit**: `src/components/app/NoCreditsModal.tsx` -- cleaner layout
- **Edit**: `src/pages/Settings.tsx` -- status display, cancel link, dialog integration, spacing
- **Edit**: `src/contexts/CreditContext.tsx` -- subscriptionStatus, currentPeriodEnd, placeholder actions

### No Backend Changes
This is purely visual. All plan changes and purchases use local state and toasts. Stripe integration comes in Phase 2.
