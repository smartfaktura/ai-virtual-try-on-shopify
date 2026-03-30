

# Replace Hero Banner Image: Garden Editorial → Studio Lounge

## Steps

1. **Upload image to Supabase Storage**
   - Copy the uploaded file (`Virtual_Try-On_Set-da62019d.png`) into the `landing-assets` bucket under `hero/hero-croptop-studio-lounge.png`
   - This keeps it consistent with the existing naming convention (`hero-croptop-{slug}.png`)
   - The `landing-assets` bucket is already public, so `getOptimizedUrl` will handle quality optimization automatically

2. **Update HeroSection.tsx (line 32)**
   - Change filename: `hero-croptop-garden-editorial.png` → `hero-croptop-studio-lounge.png`
   - Change label: `'Garden Editorial'` → `'Studio Lounge'`

3. **Update ChannelShowcase.tsx (line 19)**
   - Change the matching entry: id `'garden'` → `'studio-lounge'`, image path to `try-showcase/studio-lounge.png` (or keep existing if this is a different image), title to `'Studio Lounge'`, subtitle to something like `'Minimalist editorial shoot'`
   - *Note*: This references a `try-showcase/` folder image which may be a different crop. Will check if the same image should replace it or if it should stay as-is.

## Technical Details

- Image served via `getLandingAssetUrl()` which resolves to the Supabase `landing-assets` public bucket
- `getOptimizedUrl()` applies `quality=60` compression at render time
- `ShimmerImage` handles lazy loading with shimmer placeholder
- No database migration needed — this is a storage + code-only change

