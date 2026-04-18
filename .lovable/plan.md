

## Mobile Add Products drawer — simplify methods + polish URL import

Scope: only the mobile bottom drawer opened from `/app/products` (Add Products button). Desktop stays unchanged.

### 1. Hide irrelevant methods on mobile
File: `src/components/app/AddProductModal.tsx`

- Add a `MOBILE_METHOD_ORDER` = `['manual', 'store']` (only Upload images + Product URL).
- In the mobile method grid (lines 137–168), iterate over `MOBILE_METHOD_ORDER` instead of `METHOD_ORDER`. Result on mobile: a clean 2-column row with just **Upload images** and **Product URL** — no CSV, Mobile upload, or Shopify.
- Desktop list keeps all 5 methods (unchanged).
- Also tighten the mobile section: drop "METHOD" eyebrow label on mobile (only 2 options — label is noise). Keep the 2-card grid but render it directly under the drawer header.

### 2. Lift the drawer slightly + smoother appear
File: `src/components/app/AddProductModal.tsx` (mobile `<DrawerContent>` + header)

- Change `max-h-[92vh]` → `max-h-[88vh]` so the drawer sits a bit higher.
- Reduce header padding (`px-5 pt-4 pb-3` → `px-5 pt-3 pb-2`) to bring content closer to top.
- Subtitle copy: drop terminal period — `Upload images or import products in seconds` (matches Core memory rule).

### 3. StoreImportTab — bigger field, paste button, shorter placeholder
File: `src/components/app/StoreImportTab.tsx` (lines ~258–294)

- Make the URL input bigger on mobile: add `h-12 text-base` to the `<Input>` (desktop `sm:h-10 sm:text-sm` keeps current size).
- **Shorter placeholder**: `"https://myshop.com/products/..."` → `"Paste product link"` (clean, no overflow).
- **Add Paste button** inside the input (right side, before the external Import button). Uses `navigator.clipboard.readText()`:
  ```tsx
  <button
    type="button"
    onClick={async () => {
      try { const t = await navigator.clipboard.readText(); if (t) { setUrl(t.trim()); setImportError(null); } }
      catch { /* permission denied — silently no-op */ }
    }}
    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
  >
    Paste
  </button>
  ```
  Add `pr-16` to the Input so text doesn't run under the Paste button. Hide the Paste button when `url` is non-empty (replace with nothing — keeps UI clean).
- Import button: bump to `h-12 sm:h-10 px-5` so it visually matches the taller field on mobile.

### 4. Improve platform chips ("Shopify · Etsy · Amazon · WooCommerce · + any product page")
File: `src/components/app/StoreImportTab.tsx` (lines 286–294)

Replace the flat row of `<Badge>` chips with a small **"Works with"** caption + softer pill chips with brand-style colors:

```tsx
<div className="space-y-2">
  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Works with</p>
  <div className="flex items-center gap-1.5 flex-wrap">
    {[
      { name: 'Shopify',     dot: 'bg-emerald-500' },
      { name: 'Etsy',        dot: 'bg-orange-500' },
      { name: 'Amazon',      dot: 'bg-amber-500' },
      { name: 'WooCommerce', dot: 'bg-violet-500' },
    ].map(({ name, dot }) => (
      <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
        <span className={cn('w-1.5 h-1.5 rounded-full', dot)} />
        {name}
      </span>
    ))}
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
      + any product page
    </span>
  </div>
</div>
```
Keeps it minimal but adds quiet color, better hierarchy, and a clear caption.

### Acceptance
- Mobile `/app/products` → Add Products drawer shows only **Upload images** and **Product URL** methods.
- Desktop drawer unchanged (all 5 methods still listed).
- Drawer sits a bit higher (88vh) with tighter header.
- Product URL field is taller on mobile, has a "Paste" affordance, shorter placeholder.
- Platform chips redesigned with colored dots + "Works with" caption.
- No regression on desktop layout, no copy with terminal period in headers/single-sentence subtitles.

