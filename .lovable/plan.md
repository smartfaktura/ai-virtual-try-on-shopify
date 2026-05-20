## Convert "What VOVV creates" cards to a swipeable carousel on mobile

Applies to every category page (already shared component).

### File
`src/components/seo/photography/category/CategoryVisualOutputs.tsx`

### Change
Replace the cards grid with a responsive layout:

- **Mobile (`< sm`)**: horizontal scroll-snap carousel. One flex row, each card `min-w-[78%]`, `snap-start`, parent `overflow-x-auto snap-x snap-mandatory` with `scrollbar-hide` and `-mx-6 px-6` so cards bleed into the page edge for a "peek" of the next card. Reveals there's more without taking 4× the vertical space.
- **`sm` and up**: keep the existing `sm:grid-cols-2 lg:grid-cols-4` grid exactly as-is.

Implementation: single wrapper with `flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0`. Each card gets `min-w-[78%] sm:min-w-0 snap-start sm:snap-align-none shrink-0 sm:shrink`. Card styling unchanged.

### Untouched
Headline, eyebrow, subhead, card content, desktop grid, all other sections.