

## Show All Selected Styles in Interior/Exterior Staging Progress

### Problem
When multiple interior/exterior styles are selected (e.g. 3 styles), the generation progress subtitle only shows the first selected style name: *"Staging your Kids Room (Boy) in Modern Minimalist style"*. It should reflect all selected styles.

### Change — `src/pages/Generate.tsx` (line 3039)

Update the `isInteriorDesign` subtitle to list all selected style names and pluralize "style(s)":

**Before:**
```
Staging your Kids Room (Boy) in Modern Minimalist style
```

**After (3 styles selected):**
```
Staging your Kids Room (Boy) in 3 styles: Modern Minimalist, Japandi, Mediterranean Villa
```

**After (1 style selected):**
```
Staging your Kids Room (Boy) in Modern Minimalist style
```

Build the label by filtering `variationStrategy.variations` using `selectedVariationIndices`, joining their labels, and conditionally showing the count when more than one is selected.

### Files changed — 1
- `src/pages/Generate.tsx` — Update interior design subtitle to list all selected styles

