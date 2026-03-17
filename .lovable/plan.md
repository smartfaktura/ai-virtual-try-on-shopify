

## Clean up Product Listing Set workflow scene selection on mobile

### Changes in `src/components/app/generate/WorkflowSettingsPanel.tsx`

**1. Remove "No People" badge** (line 247)
Delete the `<Badge variant="secondary">No People</Badge>` — keep only the scene count badge for the product listing workflow.

**2. Shorten text on mobile**
- The subtitle "Choose scenes for your product — select at least 1" → shorten to just "Pick at least 1 scene"
- Remove the long disclaimer paragraph ("Products shown are reference examples only…") on mobile — wrap it in a `hidden sm:block` class so it only shows on desktop

**3. Collapse category pills on mobile**
The category filter tabs (Studio Essentials, Surface & Texture, Lifestyle Context, etc.) take up too many rows on mobile. Change to a horizontally scrollable single row with `overflow-x-auto flex-nowrap` and hide the scrollbar, so categories scroll horizontally instead of wrapping into 3 rows.

### Files
- **Edit: `src/components/app/generate/WorkflowSettingsPanel.tsx`** — 3 small edits in the scene selection card section (lines ~245-320)

