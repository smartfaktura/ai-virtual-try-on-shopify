

## Unify All Landing Page CTA Buttons

Two CTA buttons don't match the established pill-style branding used across Hero, HowItWorks, CreativeDrops, and FinalCTA sections.

### Current inconsistencies

| Section | Issue |
|---|---|
| **FreestyleShowcaseSection** | Raw `<a>` tag, `rounded-lg`, small (`h-11`), no shadow |
| **StudioTeamSection** | `<Button size="lg">` with default classes, no `rounded-full`, no shadow, no padding |

### Target style (matches Hero/HowItWorks/FinalCTA)

```
rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25
```

### Changes

**`src/components/landing/FreestyleShowcaseSection.tsx`** (lines 119-125)
- Replace raw `<a>` with `<Button size="lg">` using `onClick={() => navigate('/auth')}`
- Apply standard pill CTA classes: `rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25`
- Add `useNavigate` import and hook

**`src/components/landing/StudioTeamSection.tsx`** (lines 173-178)
- Update the Button to use standard pill CTA classes: `rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25`
- Switch from `asChild` + `<a>` to `onClick={() => navigate('/auth')}` for consistency
- Add `useNavigate` import and hook

Two files changed, consistent branding across all landing page CTAs.

