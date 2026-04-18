

## Restructure returning-user dashboard

### Changes to `src/pages/Dashboard.tsx` (returning-user branch only, lines ~518–680)

**1. Remove (delete entirely):**
- Quick action button row "Visual Studio / Create with Prompt / Explore / Library / Earn Credits" (lines 530–555)
- The 5-card metrics grid (Cost Saved / Time Saved / Credits / Continue Last / Top Style) (lines 574–627)
- The existing "Tools" section at the bottom (lines 638–679) — it'll be moved up

**2. New layout order (after welcome heading):**

```
Welcome back, Ieva 👋
Your next visuals are just a click away

[Tools — 3 cards]                          ← moved up, right under welcome
  Create Product Visuals | Create with Prompt | Explore Examples

[Quick actions]                            ← NEW section
  Compact pill buttons for most-needed actions:
  - Brand Profiles
  - My Library
  - Video Studio
  - Visual Studio (workflows)
  - Earn Credits

[Plan & Credits card]                      ← NEW section
  Left:  "Current plan: Free / Starter / Growth / Pro / Enterprise"
         "{balance} / {monthlyCredits} credits this period"
         thin progress bar
  Right: Button — "Upgrade plan" (free/starter/growth) OR
                  "Top up credits" (pro/enterprise — no upgrade path)
  Reuses CreditContext: plan, planConfig, balance, openBuyModal.
  For non-Pro users, opens UpgradePlanModal; for Pro/Enterprise, openBuyModal (top-up).

[Steal This Look]   (DashboardDiscoverSection — keep)
[Tip Card]          (keep)
[Recent Creations]  (keep)
[Recent Jobs]       (keep)
[Feedback Banner]   (keep)
```

**3. Implementation specifics:**

- **Tools section**: lift the existing 3-card JSX (lines 638–679) up to right after the welcome `<div>` block — no styling changes.
- **Quick Actions**: new `<div className="space-y-4">` with `h2` "Quick actions" and a `flex flex-wrap gap-2` of small outline pill buttons (matches the removed row's style but in a proper section). Icons: Palette, Image, Clapperboard, Layers, Gift.
- **Plan & Credits card**: new `rounded-2xl border bg-card p-5 sm:p-6` card. Pull `plan`, `planConfig`, `balance`, `openBuyModal` from `useCredits()`. Determine CTA:
  - `canUpgrade = planConfig.nextPlanId && planConfig.nextPlanId !== 'enterprise'` → "Upgrade plan" → opens `UpgradePlanModal`
  - else → "Top up credits" → calls `openBuyModal()`
- Show plan name as badge, balance in large numerals, `{balance} / {monthlyCredits}` (or `∞` for enterprise), thin progress bar.
- Keep `EarnCreditsModal` mounted (still used by Quick Actions "Earn Credits").
- Add `UpgradePlanModal` import + local `upgradeOpen` state.

**4. Cleanup imports:**
Remove unused after deletions: `Wallet`, `Euro`, `Clock`, `Play`, `Palette` (re-add if used in Quick Actions), `MetricCard`, `getOptimizedUrl` (only if no longer used elsewhere — check), `getLandingAssetUrl`. Remove `lastJob` and `topWorkflow` queries (no longer rendered). Keep `generatedCount` only if still used elsewhere — it's not after these changes, so remove that query too.

### Acceptance
- Returning user sees Welcome → Tools cards → Quick actions → Plan & Credits → Discover → Recent
- Old quick-button row, 5 metric cards, and bottom Tools duplicate are gone
- Plan card shows correct plan + balance + working Upgrade/Top-up CTA based on tier
- New-user dashboard branch untouched
- No console errors from removed queries

