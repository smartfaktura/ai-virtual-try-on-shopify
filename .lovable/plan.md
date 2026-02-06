

# Replace Shopify Polaris with Native Tailwind/shadcn Dashboard

## Overview

The entire `/app/*` dashboard currently uses Shopify Polaris components (`Frame`, `Navigation`, `TopBar`, `Card`, `Modal`, `DataTable`, `Banner`, `Badge`, `TextField`, `Select`, etc.). This plan replaces **all Polaris usage** across the app with native Tailwind CSS + shadcn/ui components, creating a unified design language that matches the modern landing page aesthetic. The edge functions and AI generation logic remain completely untouched.

## Scope of Change

There are **~30 component files** and **6 page files** that import from `@shopify/polaris`. Every single one needs to be rewritten to use shadcn/ui primitives and Tailwind classes instead.

## Design Direction

The dashboard will adopt the same design system as the landing page:
- Clean white cards with subtle borders and rounded corners
- Inter/system font stack (already set in `index.css`)
- Primary green accent (`hsl(161 100% 25%)`)
- Lucide icons instead of Polaris icons
- shadcn/ui `Dialog` instead of Polaris `Modal`
- shadcn/ui `Input`/`Select` instead of Polaris `TextField`/`Select`
- Custom Tailwind sidebar instead of Polaris `Frame`/`Navigation`
- shadcn/ui `Table` instead of Polaris `DataTable`
- shadcn/ui `Badge` instead of Polaris `Badge`

## Implementation Phases

### Phase 1: AppShell (Sidebar + Header)

Replace the Polaris `Frame`/`Navigation`/`TopBar` with a custom Tailwind layout:
- **Collapsible sidebar** with dark background (using existing `--sidebar-*` CSS variables)
- **Top header bar** with user avatar dropdown, credit indicator, and mobile hamburger
- Lucide icons (`Home`, `Image`, `LayoutGrid`, `Clock`, `Settings`, `LogOut`)
- Mobile: sidebar slides in as overlay with backdrop

**Files:** `AppShell.tsx`, `CreditIndicator.tsx`

### Phase 2: Shared UI Components

Rewrite all reusable app components to use shadcn/ui + Tailwind:

| Component | Polaris Used | Replacement |
|-----------|-------------|-------------|
| `PageHeader.tsx` | `Page` | Simple `div` with heading + breadcrumb |
| `MetricCard.tsx` | `Card`, `Text`, `InlineStack`, `Icon` | shadcn `Card` + Lucide icons |
| `StatusBadge.tsx` | `Badge` | shadcn `Badge` with color variants |
| `EmptyStateCard.tsx` | `Card`, `EmptyState`, `Text` | Custom Tailwind empty state |
| `LowCreditsBanner.tsx` | `Banner`, `Button`, `Text` | shadcn `Alert` + `Button` |
| `PlanCard.tsx` | `Card`, `Text`, `Badge`, `Button`, `Divider`, `Icon` | shadcn `Card` + `Badge` + `Button` |
| `CreditPackCard.tsx` | `Card`, `Text`, `Button`, `Badge` | shadcn `Card` + `Button` |
| `CompetitorComparison.tsx` | `Card`, `Text`, `InlineGrid`, `Icon` | shadcn `Card` + Tailwind grid |

### Phase 3: Modal Components

Replace Polaris `Modal` with shadcn `Dialog`:

| Component | Changes |
|-----------|---------|
| `BuyCreditsModal.tsx` | `Modal` to `Dialog` |
| `NoCreditsModal.tsx` | `Modal` to `Dialog` |
| `GenerateConfirmModal.tsx` | `Modal` to `Dialog` |
| `TryOnConfirmModal.tsx` | `Modal` to `Dialog` |
| `JobDetailModal.tsx` | `Modal` to `Dialog` |
| `PublishModal.tsx` | `Modal` to `Dialog` |

### Phase 4: Generate Flow Components

Rewrite all generation-related components:

| Component | Changes |
|-----------|---------|
| `SourceTypeSelector.tsx` | Remove Polaris `BlockStack`, `InlineGrid`, `Text`, `Icon` |
| `UploadSourceCard.tsx` | Replace Polaris `TextField`, `Select`, `Banner`, `Button` with shadcn equivalents |
| `TemplatePreviewCard.tsx` | Replace Polaris `Text`, `Badge`, `Icon` |
| `ModelSelectorCard.tsx` | Replace Polaris `Text`, `Icon` (already mostly Tailwind) |
| `PoseSelectorCard.tsx` | Replace Polaris imports |
| `GenerationModeToggle.tsx` | Replace Polaris `Text`, `Icon` |
| `ModelFilterBar.tsx` | Replace Polaris imports |
| `PoseCategorySection.tsx` | Replace Polaris imports |
| `NegativesChipSelector.tsx` | Replace Polaris imports |
| `AspectRatioPreview.tsx` | Replace Polaris imports |
| `PopularCombinations.tsx` | Replace Polaris imports |
| `TryOnPreview.tsx` | Replace Polaris imports |
| `RecentProductsList.tsx` | Replace Polaris imports |
| `ProductMultiSelect.tsx` | Replace Polaris imports |
| `ProductAssignmentModal.tsx` | Replace Polaris imports |
| `ImageLightbox.tsx` | Verify no Polaris usage |

### Phase 5: Page Rewrites

Rewrite all pages to remove Polaris imports:

| Page | Key Changes |
|------|-------------|
| `Dashboard.tsx` | Replace `BlockStack`, `InlineGrid`, `Card`, `Text`, `Button`, `DataTable`, `InlineStack`, `Thumbnail` with Tailwind + shadcn `Table` |
| `Generate.tsx` | Largest file (~2000 lines). Replace all Polaris layout, form, and modal components |
| `Templates.tsx` | Replace `DataTable`, `TextField`, `Select`, `Card`, `Badge` with shadcn `Table`, `Input`, `Select` |
| `Jobs.tsx` | Replace `DataTable`, filters, and modals |
| `Settings.tsx` | Replace all form controls (`TextField`, `Select`, `Checkbox`) with shadcn equivalents |
| `BulkGenerate.tsx` | Replace `Banner`, `Card`, `Button` + sub-components (`BulkSettingsCard`, `BulkProgressTracker`, `BulkResultsView`) |

### Phase 6: Cleanup

- Remove `@shopify/polaris` and `@shopify/polaris-icons` from `package.json`
- Remove `import '@shopify/polaris/build/esm/styles.css'` and `AppProvider` from `App.tsx`
- Clean up Polaris CSS overrides in `index.css` (lines 118-149)
- Update `App.tsx` to remove `AppProvider` wrapper

## Technical Notes

- **No logic changes**: All state management, hooks, API calls, and edge functions remain identical
- **No routing changes**: Route structure (`/`, `/auth`, `/app/*`) stays the same
- **Component API preservation**: Props interfaces stay the same where possible so parent/child contracts don't break
- **shadcn/ui components already available**: `Card`, `Badge`, `Button`, `Dialog`, `Input`, `Select`, `Table`, `Tabs`, `Accordion`, `Alert`, `Checkbox`, `Label`, `Separator`, `Progress`, `Tooltip` are all already installed
- **Lucide icons already installed**: `lucide-react` is already a dependency, so no new packages needed

## Estimated File Count

- **~36 files** modified total (6 pages + ~30 components + `App.tsx` + `index.css`)
- This is a large refactor best done in the phases above to avoid breaking the app mid-way

