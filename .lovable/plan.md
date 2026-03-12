

## Fix Chip Clipping + Add Model Chip to Freestyle Showcase

### 1. Fix chip clipping (product/scene text not fitting)

- Change mobile grid from `grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]` to `grid-cols-[auto_auto_1fr]` so chips take natural width
- Increase chip padding from `px-2 sm:px-2.5` to `px-2.5 sm:px-3`
- Add `whitespace-nowrap` to chip container

### 2. Add Model chip with 3 model thumbnails

Add a third chip to the CHIPS array — a "Model" chip (using `User` icon from lucide) that shows 3 stacked model avatars (Zara, Freya, Olivia) when active. The chip will use the model preview URLs from `getLandingAssetUrl`.

- Add `model` to ChipKey type and CHIPS array with `key: 'model'`, label `'Zara +2'`, mobileLabel `'Zara +2'`
- The active state thumbnail shows a small stack of 3 overlapping circular avatars (Zara's image as primary, with +2 indicator)
- Delay: 1800ms (between product at 1500ms and scene at 2200ms)
- Update `activeChips` initial state to include `model: false`
- Chip order: Product → Model → Scene → Generate

### File changed
- `src/components/landing/FreestyleShowcaseSection.tsx`

