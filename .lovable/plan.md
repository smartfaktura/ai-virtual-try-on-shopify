

## Goal
Make `/app/help` feel personal, calm, and on-brand. Remove inline FAQ accordion (link out instead), make the contact form feel like messaging the team, drop Status link.

## Changes (single file: `src/pages/AppHelp.tsx`)

### 1. Personal hero
Replace generic "Help & support" header with a warmer block:
- Avatar stack (3 team avatars — reuse `avatarSophia`, `avatarKenji`, `avatarZara` from `ContactFormDialog.tsx`)
- Title: **"Talk to the team"**
- Subtitle: *"Real humans, real fast. We usually reply within a few hours."*

### 2. Contact form → "Message the team"
Keep `ChatContactForm` but reframe its surrounding card:
- Drop the bordered/muted card wrapper — let it breathe on the page background
- Change section label from "Contact us" to nothing (form is the hero action now)
- Above the form add a tiny line: *"What's on your mind?"*
- Form itself stays (already wired to `send-contact`); placeholder copy in `ChatContactForm` already reads "How can we help?" which fits

### 3. Remove inline FAQ accordion
Replace the entire FAQ accordion section with a single soft link card:
- Title: **"Browse FAQs"**
- Sub: *"Quick answers to common questions"*
- Opens `/help` in new tab
- Same visual pattern as the Learn card below it (consistent rhythm)

Drop `QUICK_FAQ_KEYS`, `quickFaqs`, `faqCategories`, `Accordion` imports.

### 4. Self-serve row (FAQ + Learn side by side)
Two cards in a 2-col grid (stacks on mobile):
- **Browse FAQs** → `/help` (external)
- **Tutorials & guides** → `/app/learn`

Same card style: rounded-2xl, soft muted bg, icon left, title + sub, arrow right.

### 5. Other ways to reach us
Remove `Status` entry. Keep: Email, Twitter, Instagram. Same minimal text-link row.

## Layout (single column, max-w-2xl — tighter than before for intimacy)

```
─ Personal hero ───────────────
  [avatars]  Talk to the team
             Real humans, real fast.

─ Message form ────────────────
  What's on your mind?
  [name] [email] [message] [Send]

─ Self-serve (2-col) ──────────
  [Browse FAQs →]   [Tutorials & guides →]

─ Footer links ────────────────
  Email · Twitter · Instagram
```

## Files
- `src/pages/AppHelp.tsx` — restructure as above
- No other files touched. `ChatContactForm`, `faqContent.ts`, routing all stay.

## Acceptance
- No inline FAQ accordion on `/app/help`
- Form feels like messaging real people (avatars + warm copy)
- FAQ + Learn presented as twin cards
- No Status link in footer row
- Tighter `max-w-2xl` for a more personal feel
- Mobile: clean stacking, generous spacing

