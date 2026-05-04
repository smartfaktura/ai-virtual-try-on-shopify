
## Fix styling consistency and add missing step titles/subtitles

### 1. Match collapsible trigger styles in outfit section (`ProductImagesStep3Refine.tsx`)

The "Edit all shots in bulk" and "Appearance" triggers use `text-xs font-semibold` with `w-3.5 h-3.5` icons and `py-2`. The "Add styling direction" triggers (lines ~2849 and ~3127) and hint blocks need to match:

- **"Add styling direction"** (both AI and manual instances): Change icon from `w-3 h-3` to `w-3.5 h-3.5`, text from `text-[11px]` to `text-xs font-semibold`, trigger padding from `py-1.5` to `py-2`
- **"Tap any shot below..."** hint (line 2878): Change text from `text-[11px]` to `text-xs`
- **"AI will style N shots..."** box (line 2834): Change text from `text-[11px]` to `text-xs`

### 2. Step header consistency across wizard steps

The pattern is: `<h2>` title + `<p>` subtitle. Step 1 (Products) and Step 5 (Generate) follow this. Missing/inconsistent ones:

**Step 3 (Setup) — `ProductImagesStep3Refine.tsx` line 2514:**
- Current: `<span className="text-sm font-semibold">Complete setup</span>` — too small, no `<h2>`
- Fix: Use `<h2 className="text-lg font-semibold tracking-tight">Complete setup</h2>` to match other steps

**Step 2 (Select shots) — `ProductImagesStep2Scenes.tsx` line 458:**
- Has title but no subtitle
- Add: `<p className="text-sm text-muted-foreground mt-1">Pick the shots you want to generate for your products</p>`

**Step 1 (Products) — `ProductImagesStep1Products.tsx` line 54:**
- Already correct with title + subtitle, but subtitle could be improved for multi-product: change to "Choose one or more products to generate visuals for" (already says this — good)

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
