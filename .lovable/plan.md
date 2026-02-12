

## Fix: Mobile UX for Virtual Try-On Flow and Workflows

### Problems Identified (from screenshot)

1. **Page header cramped** -- The back button ("Workflows") and title ("Create: Virtual Try-On Set") sit on the same line, causing the title to wrap awkwardly on mobile
2. **Progress stepper overflows** -- The step indicators (1-5) with connecting lines overflow horizontally on small screens, getting cut off
3. **Workflow info banner is redundant** -- Shows the same name/description as the page header, wasting vertical space on mobile
4. **Source cards too padded** -- "From My Products" and "Upload New Photo" cards use `p-6` padding which is excessive on mobile
5. **Avatar distortion in Generate page** -- Same `getOptimizedUrl` width issue as ActivityFeed (line 10 uses `width: 80`)

### Changes

**File: `src/components/app/PageHeader.tsx`**
- Stack back button above title on mobile instead of inline flex
- Make title slightly smaller on mobile (`text-xl` instead of `text-2xl`)

**File: `src/pages/Generate.tsx`**

1. **Fix avatar optimization** (line 10): Remove `width: 80` from `getOptimizedUrl` call (same fix as ActivityFeed)

2. **Hide workflow info banner on mobile** (lines 644-656): Add `hidden sm:block` to the redundant workflow Alert since the page title already shows the workflow name

3. **Improve progress stepper** (lines 659-681): 
   - Make step circles smaller on mobile (`w-6 h-6` instead of `w-7 h-7`)
   - Shorten connecting lines on mobile (`w-4 md:w-12`)
   - Show step labels on mobile as abbreviated text

4. **Reduce source card padding** (lines 698-751): Change `p-6` to `p-4 sm:p-6` on the "From My Products" and "Upload New Photo" cards, and reduce icon container from `w-12 h-12` to `w-10 h-10 sm:w-12 sm:h-12`

### Technical Details

**PageHeader.tsx** -- Change flex layout:
```
Before: <div className="flex items-center gap-3">
After:  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
```
Title size: `text-xl sm:text-2xl`

**Generate.tsx line 10** -- Avatar fix:
```
Before: getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { width: 80, quality: 50 })
After:  getOptimizedUrl(getLandingAssetUrl(`team/${file}`), { quality: 50 })
```

**Generate.tsx stepper** (lines 661-676):
- Step circle: `w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-xs`
- Connector line: `w-4 sm:w-8 md:w-12`

**Generate.tsx source cards** (lines 698-751):
- Card padding: `p-4 sm:p-6`
- Icon container: `w-10 h-10 sm:w-12 sm:h-12`
- Title: `text-base sm:text-lg`

**Generate.tsx workflow banner** (line 644):
- Add `hidden sm:block` class to hide on mobile

