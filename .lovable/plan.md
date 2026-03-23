

# Fix Dashboard Hero: Button Style, CTA Text, Shadow, and Dynamic Headlines

## Changes

### 1. `src/components/app/DashboardPersonalizationHero.tsx`

**Button style** - Match quick action buttons style (outline with border, not filled primary):
```tsx
// From: bg-primary text-primary-foreground shadow-lg...
// To: same style as DashboardQuickActions
className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200 shadow-sm"
```

**CTA text**: Change "Start a Campaign" to "Start with a Workflow"

**Accept `hasGenerations` prop** to toggle between first-time and returning headlines.

### 2. `src/lib/categoryConstants.ts`

Add a second set of headlines for returning users (post-first-generation):

```ts
export const CATEGORY_HEADLINES_RETURNING: Record<string, string> = {
  fashion: 'Create campaign-ready fashion visuals - no photoshoot needed.',
  beauty: 'Create campaign-ready beauty visuals - no photoshoot needed.',
  // ... same pattern for all categories
  any: 'Create campaign-ready visuals in seconds - no photoshoot needed.',
};
```

Update `getCategoryHeadline` to accept an optional `isReturning` flag and pick the right map.

### 3. `src/pages/Dashboard.tsx`

Pass `hasGenerations={generatedCount > 0}` (already available from the existing query) to `DashboardPersonalizationHero`.

### Files
- `src/lib/categoryConstants.ts` - add returning headlines, update `getCategoryHeadline`
- `src/components/app/DashboardPersonalizationHero.tsx` - button style, text, accept `hasGenerations`
- `src/pages/Dashboard.tsx` - pass `hasGenerations` prop

