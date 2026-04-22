
## Fix `/app/workflows` spacing + reorder Missing-Visual-Type banner

### Two fixes

**1. Move "Missing a Visual Type" banner to the footer position**
Currently `<WorkflowRequestBanner />` lives **inside** the workflow catalog `<section>` (line 584), so it renders **between the workflow grid and Recent Creations**. Move it out of that section and place it **after** the Recent Creations section so it becomes the page footer.

**2. Equalize vertical spacing**
The PageHeader wraps children in `space-y-4 sm:space-y-6`, which is the standard rhythm between sections (Activity → Catalog → Recent Creations). Today the banner adds its own `mt-8 sm:mt-12` wrapper, which breaks that rhythm and creates the uneven gap you see between the Freestyle card and Recent Creations. Drop that custom margin so the banner inherits the same `space-y-6` gap as every other section.

### Edits

**`src/pages/Workflows.tsx`**
- Remove `<WorkflowRequestBanner />` from inside the catalog section (line 584).
- Add `<WorkflowRequestBanner />` as the **last** child of `<PageHeader>`, after the `Recent Creations` section block (after line 602).

**`src/components/app/WorkflowRequestBanner.tsx`**
- Remove the `<div className="mt-8 sm:mt-12">` wrapper. Render `<UnifiedFeedbackBanner …/>` directly so the parent `space-y-6` controls spacing uniformly.

### Result

- Order on `/app/workflows`: Activity → Workflow catalog (Freestyle card last) → Recent Creations → **Missing a Visual Type banner** (footer).
- Identical vertical gap between every section, including between the Freestyle Studio card row and Recent Creations, and between Recent Creations and the request banner.
- No other call sites of `WorkflowRequestBanner` exist, so this change is isolated to `/app/workflows`.
