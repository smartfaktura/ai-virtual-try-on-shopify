

Two surfaces to fix — both have hardcoded `rounded-xl`/`h-10` overrides bypassing the unified `h-10 rounded-lg` (default) / `h-10 rounded-full` (pill) system.

### 1. `src/components/app/DiscoverDetailModal.tsx` — Discover modal action row

**Recreate this CTA (line 779)** — already a `<Button>`, just add `size="pill"`:
```tsx
<Button size="pill" className="w-full font-medium shadow-lg ...">
```

**Save / Similar / Share / Feature/Unfeature pill row (lines 786–821)** — currently raw `<button>` with `h-10 rounded-xl text-xs`. Replace each with `<Button variant="outline" size="pill">` and let the typography inherit `text-sm`. Strip hardcoded `h-10 rounded-xl text-xs bg-muted/30 backdrop-blur-sm border border-border/30 ...` chains; keep the active-state color hint via `className` (`text-destructive`, `text-amber-500`).

**Trash icon button (line 825)** — replace raw button with `<Button variant="outline" size="icon" className="rounded-full text-destructive border-destructive/20 bg-destructive/10 hover:bg-destructive/20">` so it matches a pill icon button (square→pill icon look in the screenshot).

### 2. `src/components/app/SharePopover.tsx` — `variant="action"` trigger

Replace the raw `<button className="... h-10 rounded-xl text-xs ...">` (line 61) with `<Button variant="outline" size="pill" className="flex-1 font-medium gap-1.5">` so it lines up with the new Save/Similar/Feature buttons.

### 3. `src/components/app/LibraryDetailModal.tsx` — Library asset modal

All primary action buttons (Download, Edit Image, Enhance to 2K/4K, Generate Perspectives, Generate Video, Submit for Review) currently render at default `h-10 rounded-lg` — that's correct, but per the unified standard the **primary CTAs** (Download Image, Submit for Review) should be `size="pill"` (filled, rounded-full), and the **secondary action stack** (Edit, Enhance, Perspectives, Video) stays default outline `h-10 rounded-lg`.

Changes:
- Line 300–305 **Download Image** → add `size="pill"`
- Line 413–418 **Submit for Review** → add `size="pill"`
- Line 435–448 **Copy Caption** → replace `size="sm" h-9 rounded-lg text-xs` with default size, drop overrides → inherits `h-10 rounded-lg text-sm`
- Line 381–389 **Delete** ghost button — keep ghost but standardize: drop `text-xs`, keep destructive color; let it inherit `h-10`. Change icon size to `w-4 h-4`.
- Lines 307–378 secondary action `<Button variant="outline">` blocks already conform — leave untouched.

### Acceptance
- Discover modal: "Recreate this" is a filled pill (`h-10 rounded-full`); Save/Similar/Share/Feature/Unfeature are matching outline pills with `text-sm`; trash is a circular destructive icon button.
- Library modal: Download Image and Submit for Review are filled pills; secondary actions remain outline `rounded-lg`; Copy Caption matches; no `rounded-xl` / `h-9` / `text-xs` overrides remain on these buttons.

