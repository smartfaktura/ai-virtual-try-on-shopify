

## Add "V" Icon Back to Logo

Re-introduce the small square "V" icon next to the "VOVV.AI" text in three places:

### Icon element
```tsx
<div className="w-7 h-7 bg-gradient-to-br from-sidebar-foreground/20 to-sidebar-foreground/5 rounded-lg flex items-center justify-center border border-white/[0.08]">
  <span className="text-sidebar-foreground font-bold text-sm">V</span>
</div>
```

### Changes in `src/components/landing/LandingNav.tsx`
- **Line 53**: Add the icon `div` before the "VOVV.AI" text span, wrap both in a flex container with `gap-2`

### Changes in `src/components/app/AppShell.tsx`
- **Line 134-137 (Sidebar)**: Add the icon before the text. When `isCollapsed`, show only the icon (no text).
- **Line 316-317 (Mobile header)**: Add the icon before the text.

One file each, three insertion points. Keeps the subtle, minimal style without the old heavy gradient.

