

# Enhance Public /pricing Page

## Problem
The public `/pricing` page only shows plan cards and an enterprise banner. The `/app/pricing` page has rich content (team comparison, features grid, cost comparison, FAQ) that should also appear on the public page to engage visitors and explain the platform's value.

## Changes

### 1. Add "One platform replaces your entire creative team" comparison table
Same data as AppPricing — 7-row table comparing Traditional Production costs vs VOVV.AI (all included). Placed after the plan cards grid.

### 2. Add "Everything you get with VOVV.AI" features grid
12 feature cards (1,000+ Scenes, AI Models, Brand Models, Video Generation, 4K Upscaling, Bulk Generation, Multi-Angle Shots, Freestyle Studio, Image Editing, Brand Profiles, Product Library, Export & Download) in a responsive 3-col grid with icons.

### 3. Add cost comparison section
Port the `CompetitorComparison` bar chart (VOVV $0.04 vs Traditional AI $0.10 vs Photo Studios $0.15+ per credit).

### 4. Add "How credits work" section
3-card grid explaining credits (5 per image, video/upscale costs, monthly refresh).

### 5. Add expanded FAQ
8 collapsible questions covering capabilities, credits, billing, and free trial.

### 6. Add "Start free" CTA strip
Clean callout: "Start with 20 free credits. No credit card required." with a Get Started button.

## File
- `src/components/landing/LandingPricing.tsx` — add all new sections after existing plan cards grid, before enterprise banner. Import icons from lucide-react and Collapsible components. All static/presentational, no new state or API calls.

