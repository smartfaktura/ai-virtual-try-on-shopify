

## Update returning-user dashboard cards to match new style

### Context
The screenshot shows the **new-user** dashboard ("Tools" section with 3 cards: Create Product Visuals, Create with Prompt, Explore Examples) — but the CTAs still say "Open" instead of the action-led labels we agreed last turn. That's because my previous edit only updated the "Start here" / returning-user grid in `Dashboard.tsx`, not the new-user "Tools" grid the user is currently viewing.

The user now wants the **returning-user** cards updated to the same new visual style as these "Tools" cards (icon tile on top, title, description, full-width pill CTA), AND have the proper action-led labels everywhere.

### Investigation needed
I need to read `src/pages/Dashboard.tsx` to confirm:
1. Where the new-user "Tools" grid lives (and whether its CTAs are still "Open" — looks like yes from screenshot)
2. The current shape of the returning-user "Start here" grid (where I previously changed labels)
3. Whether they share a card component or are duplicated inline

### Plan

1. **Read `src/pages/Dashboard.tsx`** to map both grids.
2. **Update new-user "Tools" cards CTAs** from "Open" → action-led labels:
   - Create Product Visuals → **Start creating**
   - Create with Prompt → **Open studio**
   - Explore Examples → **Browse looks**
3. **Restyle returning-user "Start here" cards** to match the new "Tools" card aesthetic shown in screenshot:
   - Square rounded icon tile (muted bg) at top-left
   - Title (lg, semibold)
   - Description (muted, 2 lines)
   - Full-width dark pill CTA with arrow at bottom
   - Same border / padding / hover treatment as Tools cards
4. **Keep CTAs identical across both grids** so new and returning users see the same action-led labels.
5. No route changes, no icon changes (reuse existing Lucide icons), no other dashboard sections touched.

### Acceptance
- Both new-user and returning-user dashboards show identical card styling (matching screenshot)
- All three CTAs use action-led labels: "Start creating", "Open studio", "Browse looks"
- No "Open" text remains on either dashboard variant
- Routes unchanged

