

## Fix Share Icon Color

Remove `text-primary` from the Trophy icon so it inherits `text-white/80` from the parent button, matching all other icons.

### Change in `src/components/app/ImageLightbox.tsx` (line 180)

Change `<Trophy className="w-4 h-4 text-primary" />` to `<Trophy className="w-4 h-4" />`.

