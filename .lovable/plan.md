

# Simplify StartWorkflowModal: New Copy & Remove Recipe Animations

## Changes

### 1. `src/components/app/StartWorkflowModal.tsx`

**Update WORKFLOW_OPTIONS array** — reorder and update copy:
- Card 1: `name: 'Product Editorial'`, `subtitle: 'Turn your product into a campaign'`, `slug: 'product-listing-set'`
- Card 2: `name: 'Virtual Try-On'`, `subtitle: 'See your product on real people'`, `slug: 'virtual-try-on-set'`
- Card 3: `name: 'UGC / Selfie'`, `subtitle: 'Create content that feels real & social'`, `slug: 'selfie-ugc-set'`

**Update step titles/descriptions**:
- Workflow step headline: `"Let's create your first visuals"`
- Workflow step subtitle: `"Pick a style — we'll handle the rest"`

**Update footer text**: Replace "Browse all workflows" link text with a plain text line: `"No setup. No photoshoot. Just results."` (styled as `text-xs text-muted-foreground/60 text-center`). Keep the "Browse all workflows" link below it.

**Update CTA text**: Change button text from `"Create Set"` to `"Start Creating"`.

### 2. `src/components/app/WorkflowCardCompact.tsx`

**Remove recipe animation strip**: Delete the entire `{modalCompact && scene?.recipe && isVisible && (...)}` block (lines 60-98). Also remove the `recipeKey` state and its `useEffect` interval (lines 28-33) since they're only used for the recipe strip.

**Update button text**: Change `"Create Set"` to `"Start Creating"`.

### Files
- `src/components/app/StartWorkflowModal.tsx`
- `src/components/app/WorkflowCardCompact.tsx`

