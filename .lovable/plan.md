

# Match Returning User Dashboard to New User Style + Replace Buy Credits

## What Changes

### 1. Returning user welcome section → match new user style
Currently the returning user has `DashboardPersonalizationHero` component below the welcome text, plus a separate `PersonalizedForPill + DashboardQuickActions` row. The new user dashboard is cleaner: just the greeting, subtitle, credits badge, and one CTA button.

**Returning user welcome** will become:
```
Welcome back, Tomas 👋
Your AI photography studio. Here's what's happening.

🟣 {balance} credits available    [Start with a Workflow →]
```

- Remove `DashboardPersonalizationHero` from the welcome area
- Remove the `PersonalizedForPill + DashboardQuickActions` row (move quick actions elsewhere or remove)
- Add credits badge + "Start with a Workflow" button (same as new user)
- Keep `DashboardTipCard` and `LowCreditsBanner` below

### 2. New user: "Buy Credits" → "Start with a Workflow"
Replace the "Buy Credits" button with a "Start with a Workflow" button that opens `StartWorkflowModal`.

### `src/pages/Dashboard.tsx`

**New user section (lines 318-327):**
- Import `StartWorkflowModal`
- Add `startModalOpen` state
- Replace "Buy Credits" button with "Start with a Workflow" button that sets `startModalOpen(true)`
- Render `<StartWorkflowModal>` in the return

**Returning user section (lines 420-432):**
- Replace the `DashboardPersonalizationHero` + `PersonalizedForPill/DashboardQuickActions` block with the same clean layout: subtitle text, credits badge line with "Start with a Workflow" button
- Add `<StartWorkflowModal>` 
- Keep metrics, recent jobs, etc. below

### Files
- `src/pages/Dashboard.tsx` — unify welcome style, replace Buy Credits with Start Workflow modal trigger

