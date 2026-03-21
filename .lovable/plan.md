

# Restyle TryShot Page to Match VOVV.AI White Brand

## Problem
The TryShot page uses a dark navy theme with hardcoded HSL colors. The main VOVV.AI site uses a warm white background with dark navy text — premium, clean, editorial.

## Changes

### File: `src/pages/TryShot.tsx`

Replace all hardcoded dark-theme colors with the design system tokens used across VOVV.AI:

**Page container**: `bg-background text-foreground` (warm white `#faf9f7`, dark navy text)

**Nav**: 
- Logo: `text-foreground` with `.AI` in `text-muted-foreground`
- Sign up link: `text-muted-foreground hover:text-foreground`

**Hero badge**: `bg-secondary text-muted-foreground` (light stone chip)

**Headline**: `text-foreground` with rotating word in `text-muted-foreground`

**Subtitle**: `text-muted-foreground`

**Input**: `bg-white border-border text-foreground placeholder:text-muted-foreground` (clean white input with subtle border)

**Generate button**: `bg-primary text-primary-foreground hover:bg-primary/90` (dark navy button matching main site CTA)

**Progress bar**: `bg-secondary` track, `bg-primary` fill, `text-primary` dot and label

**Result cards**: `bg-white border border-border` with `text-foreground` labels, download button with `bg-black/60`

**CTA section**: `border-border`, text in `text-muted-foreground`, "60 free credits" in `text-foreground font-semibold`, CTA button same as primary

**Error text**: `text-destructive`

**Empty state**: `text-muted-foreground`

**Footer**: `text-muted-foreground/60` with link in `text-primary hover:text-foreground`

## Result
- TryShot page matches the warm white, editorial VOVV.AI brand identity
- Uses design system tokens instead of hardcoded HSL values
- Consistent with main landing page look and feel

