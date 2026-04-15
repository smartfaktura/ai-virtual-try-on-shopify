

# Replace "Get Started" Checklist with Quick-Start Cards

## What changes

Remove the 4-step onboarding checklist and replace it with a **3-card "Start here"** section based on the wireframe.

### New layout

**Welcome header** stays the same but subtitle changes to:
> "Your AI photography studio is ready. Choose how you want to start."

Remove the "Start with a Template" button from the header area.

**"Start here" section** replaces "Get Started" + `OnboardingChecklist`. Three equal cards in a row (stacked on mobile):

| Card | Title | Description | Badge | Route |
|------|-------|-------------|-------|-------|
| 1 | Create Product Visuals | Main guided flow with templates and workflows | Best place to start | `/app/workflows` |
| 2 | Create with Prompt | Describe any shot, scene, or style you want | More creative control | `/app/freestyle` |
| 3 | Explore Examples | Browse real examples and inspiration | Good first look around | `/app/discover` |

Each card has an "Open" button at the bottom.

### Also remove

- The **"Two Ways to Create"** section (lines 442-477) — its content is now merged into the 3 cards above, so it's redundant.
- The `OnboardingChecklist` import and usage.

### Files changed

- **`src/pages/Dashboard.tsx`**
  - Replace lines 402-432 (welcome + onboarding) with new welcome text + 3-card grid
  - Remove lines 442-477 ("Two Ways to Create" section)
  - Remove `OnboardingChecklist` import and related count variables if no longer used elsewhere

- **`src/components/app/OnboardingChecklist.tsx`** — no deletion needed, just unused (can clean up later)

### Design

Cards follow existing card style: `rounded-2xl border border-border bg-card p-6`, with an icon, title, description, a small muted badge/tag line, and an outline button. Grid: `grid-cols-1 sm:grid-cols-3 gap-4`.

