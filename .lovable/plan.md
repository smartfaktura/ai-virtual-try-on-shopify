

## Create All Footer Link Pages

### Overview

Create 11 new public pages for every link in the footer that currently points to `#`. These pages will share a common layout wrapper (LandingNav + LandingFooter) and follow the existing visual style.

### Pages to Create

**Company (4 pages)**
- `/about` -- Full content page with VOVV.AI story, mission, vision, and team section using existing avatar assets
- `/blog` -- "Coming Soon" page with headline, description, and email signup input
- `/careers` -- Full content page with company culture section and open positions (placeholder roles)
- `/press` -- Press kit page with brand assets section, press contact info, and media mentions

**Support (4 pages)**
- `/help` -- FAQ-style help center with categorized questions (Getting Started, Billing, Workflows, etc.) using the existing Accordion component
- `/contact` -- Working contact form with name, email, subject dropdown, and message textarea
- `/status` -- System status page with health indicators for Platform, API, CDN, and Generation Engine
- `/changelog` -- Version history timeline with release notes (v1.3, v1.2, v1.1, v1.0)

**Legal (3 pages)**
- `/privacy` -- Template privacy policy with VOVV.AI branding and standard sections
- `/terms` -- Template terms of service with VOVV.AI branding
- `/cookies` -- Template cookie policy with VOVV.AI branding

### Shared Layout

All pages will use a consistent wrapper:

```text
LandingNav (sticky, same as landing page)
  Page Content (max-w-4xl, centered, padded)
LandingFooter (same as landing page)
```

### Technical Details

**1. Page Layout Component: `src/components/landing/PageLayout.tsx`**

A reusable wrapper that renders LandingNav + main content + LandingFooter. All 11 pages will use this to avoid duplicating the nav/footer in every file.

**2. New Page Files (11 files in `src/pages/`)**

| File | Route | Description |
|---|---|---|
| `About.tsx` | `/about` | Company story, mission statement, values grid (3 cards: Innovation, Diversity, Simplicity), and team grid using existing avatar images |
| `Blog.tsx` | `/blog` | "Coming Soon" page with brief copy, email input + "Notify Me" button, and topic preview chips (AI Photography, E-commerce Tips, etc.) |
| `Careers.tsx` | `/careers` | Culture section with 3 value cards, open positions list with role, team, location, and type badges |
| `Press.tsx` | `/press` | Brand guidelines summary, download brand kit CTA, press contact email, and media mention cards |
| `HelpCenter.tsx` | `/help` | Categorized FAQ using Accordion component, organized into 4-5 categories (Getting Started, Billing, Workflows, Account, Image Quality) |
| `Contact.tsx` | `/contact` | Contact form (name, email, subject select, message textarea), plus sidebar with email, response time, and social links |
| `Status.tsx` | `/status` | Status dashboard showing service health cards (Platform, API, CDN, Generation Engine) with green/yellow/red indicators and uptime percentage |
| `Changelog.tsx` | `/changelog` | Timeline-style version history with dates, version numbers, and categorized changes (New, Improved, Fixed) |
| `PrivacyPolicy.tsx` | `/privacy` | Template privacy policy with "Last updated" date, standard sections (Data Collection, Usage, Sharing, Rights, Contact) |
| `TermsOfService.tsx` | `/terms` | Template terms of service with standard sections (Acceptance, Account, Usage, IP, Limitation, Termination) |
| `CookiePolicy.tsx` | `/cookies` | Template cookie policy with cookie types table, opt-out instructions, and contact info |

**3. Route Registration: Update `src/App.tsx`**

Add 11 new public routes before the `/app/*` block:

```text
/about        -> About
/blog         -> Blog
/careers      -> Careers
/press        -> Press
/help         -> HelpCenter
/contact      -> Contact
/status       -> Status
/changelog    -> Changelog
/privacy      -> PrivacyPolicy
/terms        -> TermsOfService
/cookies      -> CookiePolicy
```

**4. Update Footer Links: `src/components/landing/LandingFooter.tsx`**

Replace `<a href="#">` with react-router `<Link to="/about">` etc. Map each footer link text to its route. Also update the Product column links to scroll anchors on the landing page (e.g., `/#pricing`, `/#features`).

### Content Approach

**Company pages** -- Written as realistic VOVV.AI content:
- About: "Founded to eliminate the bottleneck of product photography for e-commerce brands"
- Careers: 4-5 placeholder roles (ML Engineer, Product Designer, Growth Lead, etc.)
- Press: Brand facts (founded year, team size, images generated stat)

**Support pages** -- Functional and detailed:
- Help Center: 15-20 real questions pulled from existing FAQ + new ones about workflows, credits, brand profiles
- Contact: Form with toast feedback on submit (no backend -- just UI)
- Status: All systems showing "Operational" with 99.9% uptime
- Changelog: 4 version entries with realistic feature lists matching existing features

**Legal pages** -- Template text clearly branded as VOVV.AI:
- Each starts with "Last updated: February 2026"
- Each ends with "Questions? Contact us at legal@vovv.ai"
- Marked as templates (not legal advice)

### Files Changed Summary

| File | Action |
|---|---|
| `src/components/landing/PageLayout.tsx` | **New** -- Shared nav + footer wrapper |
| `src/pages/About.tsx` | **New** |
| `src/pages/Blog.tsx` | **New** |
| `src/pages/Careers.tsx` | **New** |
| `src/pages/Press.tsx` | **New** |
| `src/pages/HelpCenter.tsx` | **New** |
| `src/pages/Contact.tsx` | **New** |
| `src/pages/Status.tsx` | **New** |
| `src/pages/Changelog.tsx` | **New** |
| `src/pages/PrivacyPolicy.tsx` | **New** |
| `src/pages/TermsOfService.tsx` | **New** |
| `src/pages/CookiePolicy.tsx` | **New** |
| `src/App.tsx` | **Edit** -- Add 11 public routes |
| `src/components/landing/LandingFooter.tsx` | **Edit** -- Replace `#` hrefs with router Links |
