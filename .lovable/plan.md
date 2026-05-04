
## Fix outfit styling mobile layout

### Changes in `ProductImagesStep3Refine.tsx`

**1. Mode selector pills** (~lines 2765-2827)
- Change `flex gap-3` to `grid grid-cols-2 gap-2 sm:gap-3`
- Reduce pill padding: `px-3 py-3 sm:px-4 sm:py-3.5`
- Stack icon above text on mobile: `flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5`
- Shrink icon box: `w-7 h-7 sm:w-8 sm:h-8`, icon: `w-3.5 h-3.5 sm:w-4 sm:h-4`
- Shorter description text: "Complements your product" / "Customize per shot"
- Font size: `text-[11px] sm:text-xs` for title, `text-[9px] sm:text-[10px]` for description
- Check circle position: `top-2 right-2 sm:top-2.5 sm:right-2.5`

**2. Scene row touch targets** (~lines 2960-2965)
- Scene row button: add `min-h-[48px]` for proper mobile touch target
- Scene thumbnail: reduce from `w-10 h-[50px]` to `w-9 h-[45px] sm:w-10 sm:h-[50px]`

**3. Card padding** (~line 2710)
- Card content: `p-4 sm:p-5 space-y-4 sm:space-y-5`

**4. Styling note collapsible** (~line 2855)
- Truncate preview: reduce `max-w-[200px]` to `max-w-[120px] sm:max-w-[200px]`

### Files
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
