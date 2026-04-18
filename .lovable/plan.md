
## UI Audit page — comprehensive coverage + "where used" annotations

### Current gaps
The current `/app/admin/ui-audit` shows core primitives (typography, buttons, inputs, basic cards/badges) but is missing many real-world surfaces. The user wants **everything** + **where each style is used**.

### What I'll add

**1. "Where used" pattern (applied to every audit block)**
A small `<UsedIn paths={["..."]} />` line under each example showing the actual files/routes (e.g. `Workflows · /app/workflows · WorkflowCardCompact.tsx`). Rendered as a tiny muted caption with a code-style monospace chip.

**2. New sections to add**

- **Modals & Dialogs** — `Dialog`, `AlertDialog`, `Sheet` (right/left/top/bottom), `Drawer` (mobile), `Popover`, `HoverCard`, `Tooltip`, `ContextMenu`, `DropdownMenu`. Live mini-triggers for each.
- **Toasts & Notifications** — sonner toast (success/error/info/loading), shadcn `Toast`, banner-style alerts (`Alert` default + destructive), inline status banners (e.g. credits low banner from AppShell).
- **Navigation** — `Tabs` (underline + pills), `NavigationMenu`, `Breadcrumb`, `Pagination`, sidebar group label (`section-label`), sidebar item active/inactive, top bar pattern.
- **Data display** — `Table`, `Accordion`, `Collapsible`, `Separator`, `ScrollArea`, `Avatar` (sizes), `AspectRatio`, `Progress`, `Skeleton` (line/circle/card), `Calendar`, `Carousel`.
- **Workflow surfaces** — live preview of `WorkflowCardCompact`, `FreestylePromptCard`, `WorkflowAnimatedThumbnail`, activity card, generation phase card (`/app/generate/...` step 5), empty state on Library.
- **Step / wizard patterns** — Product Images 6-step header, Short Film stepper, Catalog Studio anchor/derivative cards.
- **Generation & Library cards** — generation preview tile, library asset card (Draft / Brand Ready / Publish chips), lightbox header, metric/stat card from dashboard.
- **Pricing & billing surfaces** — plan card (Starter/Growth/Pro), credits balance pill, "no credits" modal, value drawer (post-gen conversion layer 2), Stripe checkout return banner.
- **Auth surfaces** — sign-in card, OAuth button, magic link confirmation panel.
- **Marketing/landing snippets** — premium hero heading (`landing-pages-full-system`), public marquee chip, CTA button gradient — clearly labelled "Marketing only — not /app".
- **Forms in the wild** — admin scene editor row, model overrides toggle row, search + filter bar (Library/Discover), bulk-action toolbar.
- **Status & state chips** — generation states (queued / running / completed / failed), library status (Draft / Brand Ready / Publish), trend watch status, video processing chip.
- **Loading & empty states** — full-page loader, inline spinner, branded animated phase icons (Step 5), empty Library, empty Discover, empty Activity, error retry card.
- **Lightbox & overlays** — image lightbox header, download/share toolbar, keyboard hints.
- **Mobile-specific patterns** — bottom sheet, mobile sticky CTA, mobile sidebar trigger, compact pill row (just normalized in `FreestylePromptCard`).

**3. Enhanced "Inconsistencies" section**
Expand the existing list with newly-discovered drifts surfaced while building each section above (e.g. tooltip vs hovercard overlap, two pagination styles, three skeleton patterns, dialog vs alertdialog vs sheet for confirmations).

**4. UX improvements to the audit page itself**
- Sticky **search bar** at top → filters visible blocks by name / file path / class.
- Section anchor TOC on left rail (desktop) — grows to cover all new sections.
- Each block gets a small **"Copy classes"** button (copies the tailwind string for that example).
- Density toggle (Compact / Comfortable) so it stays scannable when it grows long.

### Implementation
- All work in **`src/pages/AdminUIAudit.tsx`** (extend, no new routes).
- Add small inline helpers: `<UsedIn>`, `<CopyClasses>`, search filter state, density context.
- Keep render of real components — no mocks. For things requiring open-state (Dialog/Sheet/Popover/Toast), render a button that opens a tiny labelled instance.
- No backend changes, no schema changes, no edits outside this file.

### Acceptance
- Every section listed above renders live examples with variant name + tailwind classes + computed values + "Used in" file/route caption.
- Search filters across all blocks instantly.
- Inconsistencies section grows to reflect new findings.
- Page remains admin-only and desktop-first responsive.

### File touched
- `src/pages/AdminUIAudit.tsx` (extended significantly, ~1500–2000 lines total).
