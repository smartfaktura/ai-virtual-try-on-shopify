

# Catalog Studio: Props UX Improvements + Chat Position + Stepper Resize

## Changes Overview

### 1. Move Chat Widget to Right Side on /app/catalog
**File: `src/components/app/StudioChat.tsx`**
- The chat panel and FAB are currently fixed to `left-4 lg:left-[var(--sidebar-offset)]`
- Add route detection: when `location.pathname.startsWith('/app/catalog')`, swap positioning to `right-4` for both the panel and the floating button
- This prevents the chat from overlapping the main content area on the catalog page

### 2. Redesign Props Picker as a Full Modal (Dialog) with Search
**File: `src/components/app/catalog/CatalogStepProps.tsx`**
- Replace the small `Popover` prop picker with a proper `Dialog` modal (wider, ~500px)
- Add a search input at the top of the modal to filter products by name/type
- Display products in a grid layout (similar to CatalogStepProducts grid but smaller cards — 3 columns, ~80px images with title + type badge)
- Each card is selectable with a checkbox/check overlay (matching the product step pattern)
- Add a sticky footer with a **"Select Props"** CTA button that confirms and closes the modal
- Show count of selected items in the button: "Select 3 Props"

### 3. Show Shot Preview Thumbnail in Each Combo Row
**File: `src/components/app/catalog/CatalogStepProps.tsx`**
- Next to the product image in each combo row, add a small shot type preview icon/thumbnail (e.g. a mini framing diagram or the shot label as a styled badge)
- Use a `Tooltip` or hover card: on hover over the shot badge, show a larger preview image of what that shot type looks like (pull from existing shot definition preview URLs via `getShotDefinition`)
- Layout: `[product img] [shot badge with hover preview] Product Name × Model Name — Shot Label [+ Add prop]`

### 4. Show Assigned Props as Image Chips (Not Text-Only)
**File: `src/components/app/catalog/CatalogStepProps.tsx`**
- When props are assigned to a combo row, show them as small image+title chips (inline, next to the "+ Add prop" button area, not below)
- Each chip: `[24px thumbnail] Title [x]` — similar to how products appear in the sidebar
- Keep chips on the same row as the combo details when space allows; wrap below only if needed

### 5. Make Stepper Full-Width (Edge-to-Edge)
**File: `src/components/app/catalog/CatalogStepper.tsx`**
- Desktop stepper: use `justify-between` instead of `justify-center` so steps span the full width of the content area
- Increase connector line width to fill available space (`flex-1` instead of fixed `w-3 lg:w-5`)
- Slightly increase pill padding and icon size for better readability
- Progress bar (mobile): increase height from `h-0.5` to `h-1`

### 6. Sidebar: Cap Thumbnails at 2 + Overflow Count
**File: `src/components/app/catalog/CatalogContextSidebar.tsx`**
- **Products row**: Show max 2 product thumbnails + `(+N)` badge if more than 2 selected. Remove the "N items" text — the count is conveyed by the badge
- **Models row**: Show max 2 model avatars + `(+N)` badge
- **Props row**: If props assigned, show max 2 prop thumbnails + `(+N)` badge, replacing the "N/M shots" text

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/app/StudioChat.tsx` | Move to right side when on `/app/catalog` |
| `src/components/app/catalog/CatalogStepProps.tsx` | Replace popover with Dialog modal + search + grid cards + shot preview thumbnails + image chips for assigned props + "Select Props" CTA |
| `src/components/app/catalog/CatalogStepper.tsx` | Full-width stepper with flex-1 connectors |
| `src/components/app/catalog/CatalogContextSidebar.tsx` | Cap thumbnails at 2 + (+N) overflow badge |

