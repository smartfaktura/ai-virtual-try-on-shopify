## Fix

When I swapped the hero video tile, I reused the same scene ID as the existing "Campaign" card — so Golden Hour and Campaign now show the same image.

## Change

One line in `src/components/home/HomeHero.tsx`:

- Replace the new "Golden Hour" card's `src` with a different dress preview that isn't already used in the hero array.
- Candidate: a fresh scene ID from the dress product's preview folder (e.g. a new editorial / sunset / coastal preview) — I'll pick one that visually fits the "Golden Hour" label and isn't a duplicate of Campaign, Outdoor Portrait, or Lookbook.

If no fresh ID is suitable, alternative: rename the tile to a label that matches a different unused scene already in the file (no new image needed).

## Safety

- One-line change, presentation only
- No new assets, no backend, no routing
- Reversible instantly

Approve and I'll fix it.