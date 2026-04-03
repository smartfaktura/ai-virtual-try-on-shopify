

# Hero Banner Fixes — Category Pills + Better "Your Photo" + Mobile

## What's Wrong Now
- "Your photo" card is tiny (64x80px) and awkwardly overlaps the marquee — hard to notice
- Mobile has massive blank space between nav and the marquee cards (copy section takes full height before images appear)
- No way for users to see different product types — all images are mixed

## Plan

### 1. Add Product Category Pills
Add clickable pills above the marquee: **Beauty & Skincare**, **Fashion & Accessories**, **Jewelry**, **Home & Lifestyle**

- Each category maps to a different set of images for the 9 output-type cards (Product page, Social Media, Editorial, etc.)
- Default: show current mixed set (or start with "Fashion & Accessories")
- On click: swap the image URLs in the marquee cards — images load on demand (no preload for inactive categories)
- Active pill gets a filled/highlighted style, others are outlined
- Pills sit in a row between the "Your photo" area and the marquee rows

The existing hero image filenames already map naturally:
- **Fashion & Accessories**: `hero-croptop-*` images
- **Jewelry**: `hero-ring-*` images  
- **Home & Lifestyle**: `hero-hp-*` images (headphones/home products)
- **Beauty & Skincare**: mix or reuse lifestyle shots

### 2. Reposition "Your Photo"
- Move from awkward absolute-positioned overlay to a **dedicated row above the marquee**
- Make it bigger: ~80x100px on desktop
- Place it inline with the category pills: `[YOUR PHOTO thumbnail] [pill] [pill] [pill] [pill]`
- Clear "YOUR PHOTO" label below it
- On mobile: show centered above the marquee rows

### 3. Fix Mobile Layout
- Reduce top padding so content appears sooner
- Show "Your photo" card centered between copy and marquee
- Category pills wrap into 2x2 grid on small screens
- Marquee cards use current mobile sizing (160x213px)

## Files Modified
- `src/components/home/HomeHero.tsx` — add category state, pills row, reposition original card, fix mobile spacing

