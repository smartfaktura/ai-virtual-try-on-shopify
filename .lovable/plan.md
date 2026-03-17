

## Validated Plan — Add Headphones Images + Fix Product Switcher

### 1. Copy 9 headphones images to `public/images/hero/`

| Uploaded file | Target name | Label |
|---|---|---|
| yourupload-2.png | hero-product-headphones.png | Product source |
| freestyle-1_42_copy.png | hero-hp-desert.png | Desert Portrait |
| freestyle-1_42-3.png | hero-hp-studio-seated.png | Studio Seated |
| freestyle-1_43-2.png | hero-hp-elevator.png | Elevator Selfie |
| freestyle-2_3.png | hero-hp-linen.png | Linen Editorial |
| freestyle-5_1.png | hero-hp-cozy.png | Cozy Knit |
| freestyle-6_3.png | hero-hp-pilates.png | Pilates Studio |
| freestyle-7_2.png | hero-hp-white.png | White Studio |
| home-lamp-evening.png | hero-hp-home.png | Home Lifestyle |

### 2. Update Headphones showcase data (lines 54-67)
Replace placeholder ring images with new headphones paths. Use `hero-product-headphones.png` as product image.

### 3. Fix product switcher — restore short product labels
Replace the numbered `1, 2, 3` circles with compact text pills showing "Crop Top", "Ring", "Headphones". These names are short enough to fit. Active = primary fill, inactive = outline with hover.

**Mobile** (lines 364-378): `text-[10px] px-2 py-0.5 rounded-full`
**Desktop** (lines 413-429): `text-xs px-3 py-1 rounded-full`

### File: `src/components/landing/HeroSection.tsx`
- Lines 54-67: swap headphones image paths + labels
- Lines 364-378: mobile switcher — numbered circles → text pills with `showcase.product.label`
- Lines 413-429: desktop switcher — same change

