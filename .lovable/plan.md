

## Fix Doubled Popover on Desktop

### Root Cause

Adding `modal` unconditionally to all 4 chip Popovers fixed the mobile touch issue but broke desktop. On desktop, the `modal` prop creates a full dismiss layer with portal behavior that conflicts with the existing `PopoverContent` portal, resulting in the popover content appearing twice.

### Fix

Pass a `modal` prop from the parent (`FreestyleSettingsChips`) which already knows if we're on mobile via `useIsMobile()`. Each chip component gets an optional `modal?: boolean` prop on its Popover. On mobile it's `true` (fixes touch), on desktop it's `false` (no doubling).

### Files to Change

**1. `src/components/app/freestyle/ModelSelectorChip.tsx`**

- Add `modal?: boolean` to the props interface
- Use it on the Popover: `<Popover open={open} onOpenChange={onOpenChange} modal={modal}>`

**2. `src/components/app/freestyle/SceneSelectorChip.tsx`**

- Same: add `modal?: boolean` prop, pass to Popover

**3. `src/components/app/freestyle/ProductSelectorChip.tsx`**

- Same: add `modal?: boolean` prop, pass to Popover

**4. `src/components/app/FramingSelectorChip.tsx`**

- Same: add `modal?: boolean` prop, pass to Popover (it already had `modal` hardcoded before, so this makes it conditional)

**5. `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

- Pass `modal={isMobile}` to each of the 4 chip components in both the mobile and desktop render sections (mobile gets `true`, desktop gets `false`)

### Technical Detail

```tsx
// In each chip component:
interface Props {
  // ...existing props
  modal?: boolean;
}

export function ModelSelectorChip({ ..., modal }: Props) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
```

```tsx
// In FreestyleSettingsChips.tsx (both mobile and desktop sections):
<ModelSelectorChip ... modal={isMobile} />
<SceneSelectorChip ... modal={isMobile} />
<ProductSelectorChip ... modal={isMobile} />
<FramingSelectorChip ... modal={isMobile} />
```

### Summary

- Desktop: `modal={false}` -- popovers render normally, no doubling
- Mobile: `modal={true}` -- Radix dismiss layer prevents flash-close on touch
- 5 files changed, minimal edits

