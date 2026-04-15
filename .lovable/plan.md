

# Freestyle Card — Workflow Step Pills with Responsive Fit

## What changes

**File: `src/components/app/FreestylePromptCard.tsx`**

### 1. Replace result pills with workflow step pills
Replace `RESULT_PILLS = ['Studio', 'Court', 'Café']` with 4 workflow steps, each with a Lucide icon:

```
Scene (Camera) → Model (User) → Product (Package) → Generate (Zap)
```

- First 3 pills: `bg-muted/30 border-border/30 text-foreground/70`
- "Generate" pill: `bg-primary/10 border-primary/20 text-primary` — visually distinct as the action
- Each pill shows icon + label side by side

### 2. Animation timing
- After typewriter completes and send icon appears, pills fade in sequentially (300ms stagger)
- Update `pillsVisible` state to track 4 items instead of 3
- "Generate" pill gets a brief scale bump (`scale-105` → `scale-100`) on appear
- Hold duration stays 2.2s, total loop ~8–9s

### 3. Responsive layout — guaranteed fit on all screens
The key issue: 4 pills with icons must not overflow on narrow cards.

- **Desktop** (`!mobileCompact`): `flex-wrap justify-center gap-2`, pills use `text-xs px-2.5 py-1`, icons `w-3 h-3`
- **Mobile compact** (`mobileCompact`): `flex-wrap justify-center gap-1.5`, pills use `text-[10px] px-1.5 py-0.5`, icons `w-2.5 h-2.5`. Layout wraps into 2×2 grid naturally via flex-wrap
- Pills container: `max-w-full` with `overflow-hidden` as safety net
- Icon labels hide on extremely narrow cards: use `hidden xs:inline` on label text if needed — but with `flex-wrap` the 2×2 layout should handle it

### 4. No structural changes
Card wrapper, aspect ratios, prompt bar, content area, and CTA button all remain identical. Only the pills section markup changes.

## Technical details
- Import `Camera, User, Package, Zap` from lucide-react (remove unused imports)
- `WORKFLOW_STEPS` array replaces `RESULT_PILLS`
- `pillsVisible` initial state becomes `[false, false, false, false]`
- `PILL_STAGGER` stays at 250ms (4 × 250 = 1s total reveal)
- Adjust the hold timeout calc: `WORKFLOW_STEPS.length * PILL_STAGGER + 200`

