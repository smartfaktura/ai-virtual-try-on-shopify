

## Center "VOVV.AI" Logo in Sidebar

Change the sidebar header layout so the logo text is centered, and update the text from "VOVV" back to "VOVV.AI".

### Changes in `src/components/app/AppShell.tsx`

**1. Sidebar header (line ~133-138)** — Center the logo and add collapse toggle as absolute/right-positioned:
```tsx
<div className={cn('flex items-center border-b border-white/[0.06] relative', isCollapsed ? 'justify-center px-3 pt-6 pb-5' : 'justify-center px-5 pt-6 pb-5')}>
  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/app')}>
    {!isCollapsed && (
      <span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV.AI</span>
    )}
  </div>
  {!isMobile && (
    <button ... className="absolute right-3 ..." />
  )}
</div>
```

**2. Mobile header (line ~317)** — Update text to "VOVV.AI".

Note: The logo click will route to `/app` (dashboard) per existing convention.

### File
| File | Change |
|---|---|
| `src/components/app/AppShell.tsx` | Center logo, rename to VOVV.AI |

