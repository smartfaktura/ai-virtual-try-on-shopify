

## Change "Start Free" CTA Color

The screenshot shows the mobile menu "Start Free" button uses the default primary color (dark navy), which blends with the dark nav drawer. It should use a contrasting, attention-grabbing color.

### Change

**`src/components/landing/LandingNav.tsx`**

- **Mobile menu CTA (line 107-113)**: Add explicit styling with a vibrant contrasting color — use a bright primary accent like `bg-primary text-primary-foreground` with a lighter/warmer tone, or go with a white/light button style: `bg-white text-slate-900 hover:bg-white/90` so it pops against the dark sidebar drawer.

- **Desktop CTA (line 74)**: Keep as-is or optionally match the new style for consistency.

This is a one-line class change on the mobile Button element.

