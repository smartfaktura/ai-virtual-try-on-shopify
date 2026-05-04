
## Change: 3-column mobile grid for scene selection

Update the `GRID_CLASSES` mapping in `ProductImagesStep2Scenes.tsx` so that the default `4col` and `3col` grid sizes show 3 columns on mobile instead of 2.

### Technical details

In `ProductImagesStep2Scenes.tsx` (~line 101-106), update:

```
'4col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4',
'3col': 'grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3',
```

This changes `grid-cols-2` to `grid-cols-3` at the smallest breakpoint for these two sizes, giving a tighter 3-column layout on mobile screens (like the 440px viewport shown in the screenshot). The `6col` and `5col` sizes already use `grid-cols-3` on mobile and stay unchanged.
