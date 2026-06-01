## Phone Cases page — add motion section, expand stills, refresh hero

Three updates to `/ai-product-photography/phone-cases`, all data + asset wiring.

### 1. Add Motion ("Phone cases in movement") section — 6 videos

Upload the 6 attached `slow_push_in_*` electronics clips to Lovable Assets, extract one poster JPG per clip (first frame via ffmpeg), and register them as a new motion family.

- Create 12 asset pointers:
  - `src/assets/seo/phone-cases-motion-{1..6}.mp4.asset.json`
  - `src/assets/seo/phone-cases-motion-{1..6}.jpg.asset.json`
- Edit `src/components/seo/photography/category/CategoryMotionShowcase.tsx`:
  - Import the 12 new asset JSONs
  - Add `'phone-cases'` to `MotionSlug`
  - Add `CLIPS_BY_SLUG['phone-cases']` (6 clips, using `.url`)
  - Add `COPY_BY_SLUG['phone-cases']` with eyebrow "Motion · Cases in movement", heading "Your phone case, brought to life", subline about ads/reels/PDP loops, aria "AI-generated phone case motion clip"

The page wrapper already renders `<CategoryMotionShowcase />` and gates on slug, so it will appear automatically once the slug branch exists.

### 2. Update hero collage — drop Flatlay, refresh Poolside, add Video tile

The hero collage today is `[Editorial, Lifestyle, Flatlay, Poolside]`. Per the request, drop the flatlay tile, replace the poolside tile, and use one of the new clips as the hero motion tile.

New `heroCollage` in `src/data/aiProductPhotographyCategoryPages.ts` (phone-cases entry, line 1793):
1. Editorial — keep `1779952784987-6zcgd4` (Saltwater Case Glow)
2. Lifestyle — keep `1779952779562-ueyyov` (Pilates Case Selfie)
3. Closeup — new `1779952794821-nirn7y` (Shoulder Case Closeup) — replaces Flatlay
4. Video — new tile with `imageId: '1779952807944-dzh93u'` (Sun Kissed Case as poster fallback) and `videoSrc: 'phone-cases-motion-1'` — replaces Poolside

Add the mapping in `src/components/seo/photography/category/CategoryHero.tsx`:
- Import `phoneCasesMotion1` from `@/assets/seo/phone-cases-motion-1.mp4.asset.json`
- Add `'phone-cases-motion-1': phoneCasesMotion1.url` to `HERO_VIDEO_MAP`

### 3. Expand Scene Examples section

Current `sceneExamples` is 8 tiles. Bump to 12 tiles (still grids cleanly at 2/3/4 cols) and rotate out the flatlay/poolside-heavy items to favor closeups, editorial, and creative shots. New ordered list (all real scenes from the DB):

1. Coastal Call — `1779952756981-gnkhvd` · Editorial
2. Saltwater Case Glow — `1779952784987-6zcgd4` · Editorial
3. Glossy Case Selfie — `1779954089918-y30ofu` · Editorial
4. Shoulder Case Closeup — `1779952794821-nirn7y` · Editorial
5. Pilates Case Selfie — `1779952779562-ueyyov` · Lifestyle
6. Sun Kissed Case — `1779952807944-dzh93u` · Editorial
7. Seaside Case Sip — `1779952793141-k7fpmm` · Editorial
8. Stucco Case Pose — `1779952801778-iw9yli` · Editorial
9. Jet Set Case — `1779952770704-bea942` · Travel
10. Beach Club Call — `1779954090967-4ngo0t` · Lifestyle
11. Dynamic Bloom Studio — `1779954083352-msu7cd` · Creative
12. Earthy Minimal Shadows — `1779954084093-2vljbf` · Creative

(Flatlay/poolside scenes are dropped from the hero strip but the poolside scene remains discoverable via the deep-linked "Browse full scene library" CTA.)

### Technical notes

- Asset upload uses `lovable-assets create --file /mnt/user-uploads/<clip>.mp4 --filename phone-cases-motion-N.mp4`.
- Posters extracted with `ffmpeg -ss 0 -i <clip> -frames:v 1 -q:v 3 /tmp/poster.jpg`, then re-uploaded via `lovable-assets`.
- No DB changes, no route changes, no new components — same pattern as wedding-dresses.
- `hidePainAndUseCases` already includes neighbors; phone-cases is not in that list and keeps pain points + use cases visible (unchanged).
