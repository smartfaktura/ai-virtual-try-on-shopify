

# Fix Mobile Drawer: Handle Bar + Close Button

## Problem
1. The drag handle bar at top of the mobile drawer looks odd/too prominent — it's the default `w-[100px] h-2` muted bar from DrawerContent
2. No visible close (X) button on mobile — user can only drag to dismiss, which is not discoverable

## Changes

### `src/components/app/EarnCreditsModal.tsx`

1. **Add X close button** to the mobile drawer content — position it `absolute top-3 right-3` inside the content area, above the hero section. Import `X` from lucide.

2. **Reduce drag handle visibility** — the DrawerContent already renders a handle; no changes needed there. The "strange line" is just the built-in handle. We can keep it but the X button gives a clear dismissal affordance.

3. **Add top padding** to hero section in mobile to account for the close button: change `pt-8` to `pt-6` since the drag handle already adds some top space, and position X button at top-right.

**Mobile content wrapper:**
```tsx
if (isMobile) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
```

### Files
- `src/components/app/EarnCreditsModal.tsx` — add X button to mobile drawer, import X icon

