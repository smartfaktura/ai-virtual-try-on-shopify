

## Add custom scenes to Virtual Try-On workflow

### Problem
Custom scenes (added via Admin Scene Manager) appear in Freestyle's scene selector but **not** in the Virtual Try-On workflow. `Generate.tsx` only uses hardcoded `mockTryOnPoses` and never imports `useCustomScenes`.

### Root cause
`Generate.tsx` does not call `useCustomScenes()`. The Freestyle page and Discover page both do — Virtual Try-On was missed.

### What already works
- All scenes the user listed exist in the database with on-model categories (`studio`, `lifestyle`, `editorial`, `streetwear`) so they will pass the existing `onModelCategories` filter.
- Scenes like "Urban Stairs", "Basketball Court", "Industrial Underpass", "Night Neon" are already hardcoded in `mockTryOnPoses` — they already appear.
- The `useHiddenScenes` and `useSceneSortOrder` hooks are already used in Generate.tsx.

### Changes

**1. `src/pages/Generate.tsx`** — Import and merge custom scenes

- Import `useCustomScenes` hook
- Call `const { asPoses: customPoses } = useCustomScenes();`
- Merge custom poses into the scene list alongside `mockTryOnPoses`:
  ```tsx
  const allScenePoses = [...filterVisible(mockTryOnPoses), ...customPoses];
  ```
- Use `allScenePoses` instead of `filterVisible(mockTryOnPoses)` in the `posesByCategory` reducer (~line 541) and anywhere else scenes are referenced

**2. Update scene descriptions in the database** — Shorten to 6-9 words

Run a migration to update the `description` field for each of the user's listed scenes to concise 6-9 word descriptions matching the existing format. Examples:

| Scene | New Description |
|-------|----------------|
| Floating Studio | Ethereal white studio with flowing fabric drapes |
| Rooftop Cityscape Glow | Twilight rooftop with ambient city lights |
| Urban NYC Street | Gritty New York street with raw energy |
| Amber Spotlight | Warm amber side-light on deep blue backdrop |
| Dramatic Light Veil | Hard slicing light with high contrast mood |
| Gym Workout (editorial) | Motivational gym setting with natural window light |
| Gym Workout (lifestyle ×2) | Energetic modern gym with bright natural light |
| Natural Light Loft | Minimalist industrial loft with soft daylight |
| Desert Horizon | Golden hour desert landscape with dramatic warmth |
| Brutalist Urban Steps | Angular concrete architecture with bold shadows |
| Salt Flat Serenity | Expansive bright salt flats under clear sky |
| Urban Chic | Urban street style with casual cool confidence |
| Urban Dusk Portrait | City streets at dusk with warm ambient glow |
| 1990s Disposable Camera | Warm retro café with string light ambiance |
| Airport Transit | Modern airport terminal with strong directional light |
| Canon G7X @Dining | Evening dining scene with warm string lights |
| Canon G7X @Night | Night beach bonfire with festive party lights |
| Bright Lifestyle Interior | Spacious bright interior with soft natural light |
| Pilates Studio Zen | Airy bright pilates studio with clean focus |
| Poolside Chic | Sunny poolside with strong contrasts and luxury |
| Natural Field Serenity | Expansive outdoor field with warm soft light |
| Coastal Horizon | Breezy coastal ledge overlooking a serene sea |
| Brutalist Concrete | Sunny concrete with strong shadows and modern lines |
| Industrial Light Play | Concrete loft with dramatic window light patterns |
| Velvet Draped Elegance | Rich velvet draping with moody intimate lighting |
| Rooftop City Nights | Urban rooftop at dusk with flattering soft light |
| Night City Balcony | Intimate moody balcony with cityscape at night |
| Night Drive Glam | Dark car interior with soft ambient glow |
| Sunny Morning Kitchen | Bright warm morning kitchen with inviting light |
| Rooftop City Dusk | Urban rooftop with twilight city lights glowing |
| Urban Taxi Ride | Inside a taxi with urban nightlife passing by |
| Urban Crossroads | Busy city crossroads with dynamic street energy |
| Gym Loft Light | Industrial gym with vast natural window light |
| Cozy Cafe | Charming warm café with natural inviting light |
| Pilates Studio Glow | Bright airy pilates studio with natural light |
| Elevator Chic | Sleek reflective elevator with bright even lighting |
| Cozy Kitchen Morning | Warm morning kitchen with bright comfortable light |
| Terracotta Sunset | Warm terracotta tones with golden sunset light |
| Restaurant Evening | Dimly lit elegant restaurant with intimate warmth |
| Night Storefront | Moody urban night with neon fluorescent lighting |
| Skatepark Golden Hour | Skatepark bathed in warm golden hour light |
| Subway Platform | Underground subway platform with gritty urban mood |
| Urban Concrete | Raw urban concrete with strong industrial character |
| Urban Concrete Canyon | Deep urban canyon with towering concrete walls |
| Urban Rooftop View | Elevated rooftop with expansive city skyline views |

### What this achieves
- All ~45 custom scenes with on-model categories will appear in Virtual Try-On's scene selector alongside the existing 30 hardcoded scenes
- Descriptions will be concise and consistent with the existing format
- No changes to the scene selector UI — it already renders by category with the same card layout

