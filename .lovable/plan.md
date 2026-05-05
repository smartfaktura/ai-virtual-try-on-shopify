## Overview

Two changes: (1) redesign the desktop sidebar to show expandable sub-category menus when a family is clicked, and (2) create a dedicated "Hats, Caps & Beanies" family category.

---

### 1. Sidebar with expandable sub-menus (desktop)

**Current**: The left sidebar lists families as flat buttons. Sub-categories only appear as horizontal pills above the grid.

**New**: Each family with multiple collections gets an expand/collapse chevron. Clicking a family expands it inline to show its sub-categories (collections) indented below — similar to how the mobile drawer already works. The horizontal pill bar above the grid is kept as a secondary shortcut.

**File: `src/components/library/LibrarySidebarNav.tsx`**
- Add expand/collapse state tracking (which family is expanded)
- When a family is clicked: select it AND expand its sub-categories
- Show indented collection buttons under the expanded family (with counts)
- Clicking a collection calls a new `onSelectCollection` callback
- Active collection gets highlighted styling
- ChevronRight/ChevronDown icon for families with multiple collections

**File: `src/pages/ProductVisualLibrary.tsx`**
- Pass `activeCollectionSlug` and `onSelectCollection` to `LibrarySidebarNav`
- Wire up collection selection from sidebar to the existing filter state

### 2. Add "Hats, Caps & Beanies" family category

**File: `src/lib/sceneTaxonomy.ts`**
- Change `caps`, `hats`, `beanies` from `'Accessories'` to `'Hats, Caps & Beanies'`
- Add `'Hats, Caps & Beanies'` to `FAMILY_ORDER` (after `Bags & Accessories`)

**File: `src/hooks/usePublicSceneLibrary.ts`**
- Add `'Hats, Caps & Beanies': 'Hats, Caps & Beanies'` to `FAMILY_LABEL_OVERRIDES`

**File: `src/lib/visualLibraryDeepLink.ts`**
- Update `caps-hats` deep link to point to the new family slug `hats-caps-and-beanies`

---

### Technical details

- The sidebar expand state defaults to showing the active family expanded
- Only one family expanded at a time (accordion pattern) for clean UX
- No database changes needed — this is purely a UI taxonomy reorganization
- The "Accessories" family key will no longer exist once caps/hats/beanies move out (they were the only members)
