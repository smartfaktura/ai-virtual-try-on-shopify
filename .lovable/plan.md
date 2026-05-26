## Review screen polish

### 1. Drop separator after Outfit Styling
`src/components/app/product-images/ProductImagesStep3Refine.tsx` line 3511 — remove the bare `<Separator />` between the outfit/aesthetic block and the next section.

### 2. Trim Additional note header
Same file, line 3672 — delete the `<p>Anything important to keep in mind?</p>` subtitle. The textarea placeholder already explains what to enter.

### 3. Split Format and Images per scene into two cards
`src/components/app/product-images/ProductImagesStep4Review.tsx` lines 202–264. The two controls currently share one `Card` via an internal 2-col grid. Replace with a `grid grid-cols-1 md:grid-cols-2 gap-4` of two independent `Card`s, matching the rhythm of the lower summary row (1 Product / 1 Scene / Credits):
- Card A: Format header + ratio pills + "Pick at least 1 format" inline error
- Card B: Images per scene header + count pills
- Both: `<Card><CardContent className="p-6 space-y-3">`, drop the `border-primary/20` accent.

### 4. Fully rounded pills
Same file, lines 222 and 248 — change the pill class from `rounded-xl` to `rounded-full` on the format and image-count buttons so they match VOVV's pill language.

No state or logic changes.
