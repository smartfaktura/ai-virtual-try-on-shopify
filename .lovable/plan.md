

# Rename "Workflows" to "Templates" — Frontend Only

No backend changes. All route paths (`/app/workflows`, `/features/workflows`) stay the same. Only user-facing labels, headings, and copy change.

---

## Files and Changes

### 1. Sidebar & Navigation

**`src/components/app/AppShell.tsx`**
- Sidebar item: `'Workflows'` → `'Templates'`

**`src/components/app/DashboardQuickActions.tsx`**
- `'Browse Workflows'` → `'Browse Templates'`

### 2. Workflows Page

**`src/pages/Workflows.tsx`**
- Page title: `"Workflows"` → `"Templates"`
- Subtitle: `"Choose a workflow and generate…"` → `"Choose a template and generate…"`
- Section label: `"Create a New Set"` → `"Choose a Template"`
- Comment labels (optional, for code clarity)

### 3. Dashboard

**`src/pages/Dashboard.tsx`**
- `"Start with a Workflow"` button → `"Start with a Template"`
- `"Browse Workflows"` buttons (2 occurrences) → `"Browse Templates"`
- Component name `DashboardWorkflowCard` is internal — leave as-is

### 4. Start Modal

**`src/components/app/StartWorkflowModal.tsx`**
- `displayName` values: `"Product Editorial Workflow"` → `"Product Editorial"`, `"Virtual Try-On Workflow"` → `"Virtual Try-On"`, `"UGC / Selfie Workflow"` → `"UGC / Selfie"`
- `"Browse all workflows"` → `"Browse all templates"`
- Step title: `"Let's create your first visuals"` — keep as-is (no "workflow" word)

### 5. Onboarding Checklist

**`src/components/app/OnboardingChecklist.tsx`**
- CTA: `'Go to Workflows'` → `'Go to Templates'`

### 6. Workflow Card & Request Banner

**`src/components/app/WorkflowCard.tsx`**
- `"Create Set"` button — keep as-is (already good)

**`src/components/app/WorkflowRequestBanner.tsx`**
- `"Missing a workflow for your brand?"` → `"Missing a template for your brand?"`
- `"What workflow would you like us to create?"` → `"What template would you like us to create?"`
- Placeholder: `"Describe the workflow, niche…"` → `"Describe the template, niche…"`

### 7. Landing Page Components

**`src/components/landing/LandingFAQ.tsx`**
- `"What are Workflows?"` → `"What are Templates?"`
- All answer text: `"Workflows"` → `"Templates"`, `"workflow"` → `"template"`

**`src/components/landing/LandingFooter.tsx`**
- Footer link label: `'Workflows'` → `'Templates'`

**`src/components/landing/CreativeDropsSection.tsx`**
- `'Pick your visual workflows'` → `'Pick your visual templates'`

**`src/components/landing/FinalCTA.tsx`**
- `'choose your workflows'` → `'choose your templates'`

**`src/components/landing/HeroSection.tsx`**
- Navigate path stays `/app/workflows`, button label `"Create My First Visual Set"` — already fine

**`src/components/landing/FeatureGrid.tsx`**
- `'Assign workflows and brand profiles'` → `'Assign templates and brand profiles'`

### 8. Feature Page

**`src/pages/features/WorkflowsFeature.tsx`**
- SEO title: `"AI Photography Workflows"` → `"AI Photography Templates"`
- Hero badge: `"Workflows"` → `"Templates"`
- All body copy: `"workflow"` → `"template"`, `"Workflows"` → `"Templates"`
- Section heading: `"Why Workflows?"` → `"Why Templates?"`
- Benefits descriptions: update all `"workflow"` references

### 9. Press Page

**`src/pages/Press.tsx`**
- `"multiple workflows"` → `"multiple templates"`

### 10. Live Chat Knowledge

**`supabase/functions/studio-chat/index.ts`**
- System prompt: rename all `"Workflows"` → `"Templates"`, `"workflow"` → `"template"` in the platform knowledge section
- CTA buttons: `"Browse Workflows"` → `"Browse Templates"`
- Page context map: `"Workflows page — they are browsing available workflow templates"` → `"Templates page — they are browsing available templates"`
- Pricing section: `"Workflow pricing"` → `"Template pricing"`, `"Workflows cost more"` → `"Templates cost more"`
- Subscription plans: `"all workflows"` → `"all templates"`

### 11. Video Hub

**`src/pages/VideoHub.tsx`** — no "workflow" user-facing text, skip.

**`src/components/app/video/VideoWorkflowCard.tsx`** — component name is internal, no user-facing "workflow" text, skip.

---

## What stays unchanged
- All URL routes (`/app/workflows`, `/features/workflows`, etc.)
- All database column names (`workflow_id`, `workflow_name`, `workflow_slug`)
- All TypeScript type names and internal variable names
- All query keys and localStorage keys
- Component file names (renaming files is cosmetic, risky, and not user-visible)

---

## Summary
~15 files updated, purely string/label changes. No logic, no routes, no backend.

