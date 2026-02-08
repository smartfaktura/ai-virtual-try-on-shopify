

# Luxury Redesign: Credits & Plan Modal

## Problem
The current modal feels cramped and dense. Text is tiny (10px), spacing is tight (p-3, gap-2.5), and everything is squeezed together. It lacks the spacious, editorial feel that matches the rest of the app's luxury aesthetic.

## Design Direction
Apply the same "luxury restraint" aesthetic used elsewhere in the app: generous whitespace, larger typography hierarchy, refined card treatments with subtle borders, and breathing room between elements.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx`

**Dialog container**:
- Widen from `max-w-lg` (512px) to `max-w-xl` (576px) for more horizontal breathing room
- Increase base padding from `p-6` (dialog default) to a spacious layout with `gap-5` between sections

**Header**:
- Increase title from `text-base` to `text-lg` with refined tracking
- Add a subtle description line beneath: "Manage your credits and subscription"

**Balance section**:
- Increase padding from `p-3` to `p-5`
- Use `rounded-xl` instead of `rounded-lg` for the luxury card feel
- Increase credit number from `text-xl` to `text-3xl` for visual prominence
- Increase "credits" label from `text-xs` to `text-sm`
- Make progress bar slightly taller: `h-2` instead of `h-1.5`
- Increase footer text from `text-[10px]` to `text-xs`
- Add more vertical spacing between elements inside (`mb-3` instead of `mb-2`)

**Tabs**:
- Increase tab trigger text from `text-xs` to `text-sm`
- Add more spacing between tabs and content (`mt-4` instead of `mt-3`)

**Top Up tab**:
- Increase gap between pack cards from `gap-2.5` to `gap-3`
- Increase card padding from `p-3` to `p-4`
- Increase credit number from `text-xl` to `text-2xl`
- Increase image count text from `text-[10px]` to `text-xs`
- Increase price from `text-base` to `text-lg`
- Increase per-credit rate text from `text-[10px]` to `text-xs`
- Use `rounded-xl` on pack cards
- Add `mt-2` on the Buy button for more separation
- Increase header text "Credits never expire" from `text-xs` to `text-sm`

**Upgrade Plan tab**:
- Increase recommended plan card padding from `p-3.5` to `p-5`
- Use `rounded-xl` on the plan card
- Increase plan name from `text-sm` to `text-base`
- Increase price from `text-2xl` to `text-3xl`
- Increase feature unlock card padding from `p-2` to `p-3`
- Increase feature label from `text-xs` to `text-sm`
- Increase feature description from `text-[10px]` to `text-xs`
- Increase icon sizes from `w-3.5 h-3.5` to `w-4 h-4`
- Add more gap between feature grid items (`gap-2.5` instead of `gap-2`)
- Increase CTA button from `size="sm"` to default size
- Increase alt plan card padding from `p-2.5` to `p-3`
- Increase "Compare all plans" link from `text-[11px]` to `text-xs`

These are purely spacing/sizing CSS changes -- no structural or logic changes. The layout hierarchy stays the same, just with more generous proportions to feel premium and spacious.
