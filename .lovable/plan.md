

# Fix White Line Under Nav on SEO Page

## Problem
The `PageLayout` component adds `pt-16` to the `<main>` element to clear the fixed nav. But the hero section's gray gradient background starts *inside* that padding, creating a visible white strip between the nav bottom edge and the gray background.

## Fix
In `src/pages/seo/AIProductPhotographyEcommerce.tsx`, extend the hero section's background gradient upward by using a negative top margin (`-mt-16`) on the section so it sits flush under the nav, while keeping `pt-28` so content stays properly spaced. This way the gray gradient covers the gap without affecting other pages that use `PageLayout`.

| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Add `-mt-16` to the hero `<section>` so its background fills the nav clearance gap |

