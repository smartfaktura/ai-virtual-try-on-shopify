

# Replace Flat Items with Animated Workflow Cards in Modal

## What Changes

Replace the plain button rows in Step 1 of `StartWorkflowModal` with `WorkflowCardCompact` components - the same animated cards used on the Workflows hub page (with product chips, model avatars, and scene overlays animating in).

## Plan

### `src/components/app/StartWorkflowModal.tsx`

**1. Import `WorkflowCardCompact` and `workflowScenes`**

**2. Create mock `Workflow` objects** matching the three options so `WorkflowCardCompact` can render them. The card only needs `name`, `slug`, `description`, `uses_tryon`, and `preview_image_url`. The animation data is keyed by `workflow.name` inside `workflowScenes` (keys: `'Virtual Try-On Set'`, `'Product Listing Set'`, `'Selfie / UGC Set'`).

```ts
const WORKFLOW_CARDS: Workflow[] = [
  { name: 'Virtual Try-On Set', slug: 'virtual-try-on-set', description: 'Show your product on real models', uses_tryon: true, ... },
  { name: 'Product Listing Set', slug: 'product-listing-set', description: 'High-end lifestyle & studio shots', uses_tryon: false, ... },
  { name: 'Selfie / UGC Set', slug: 'selfie-ugc-set', description: 'High-quality content like UGC creators', uses_tryon: false, ... },
];
```

**3. Replace the `workflowStep` flat buttons** with a 3-column grid of `WorkflowCardCompact`:

```tsx
const workflowStep = (
  <div className="grid grid-cols-3 gap-3">
    {WORKFLOW_CARDS.map((wf, i) => (
      <WorkflowCardCompact
        key={wf.slug}
        workflow={wf}
        onSelect={() => handleSelectWorkflow(WORKFLOW_OPTIONS[i])}
        mobileCompact={isMobile}
      />
    ))}
  </div>
);
```

**4. Widen the desktop dialog** from `sm:max-w-[480px]` to `sm:max-w-[640px]` so the 3 cards have breathing room with their animated thumbnails.

**5. Remove `Package` icon import** (no longer used in step 1).

### Files
- `src/components/app/StartWorkflowModal.tsx` - swap step 1 content, widen dialog

