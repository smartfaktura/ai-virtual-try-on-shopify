

# Phase 2: Catalog Generate Page — Product + Model Selection UI

## What gets built
A new standalone page at `/app/catalog` with a step-based UI for selecting products and models. This is the foundation UI that Phase 3 (poses/backgrounds) and Phase 4 (batch enqueue) will build on.

## Files to create

### 1. `src/pages/CatalogGenerate.tsx` (~400 lines)
New page component with stepper layout:
- **Step 1 — Products**: Reuses `ProductMultiSelect` component (already supports multi-select with search, category filtering). Remove the `enforceSameCategory` constraint since catalog shots span categories. Raise `MAX_PRODUCTS_PER_BATCH` or use a local override (catalog allows 50+).
- **Step 2 — Models**: Grid of `ModelSelectorCard` components with `ModelFilterBar` for gender/body/age filtering. Supports multi-select (1-5 models). Combines system models (`useCustomModels`) + user models (`useUserModels`) like the existing Generate page does.
- Running counter: "X products × Y models = Z combinations"
- Next/Back navigation between steps
- Products fetched from `user_products` table via existing query pattern

### 2. `src/components/app/CatalogMatrixSummary.tsx` (~60 lines)
Compact summary bar showing:
- Selected counts per dimension (products, models, and placeholders for poses/backgrounds coming in Phase 3)
- Total images calculation: `products × models × poses × backgrounds`
- Credit estimate: `total × 4`
- Rendered as a sticky bottom bar or inline card

## Files to modify

### 3. `src/App.tsx`
- Add lazy import: `const CatalogGenerate = lazy(() => import('@/pages/CatalogGenerate'));`
- Add route inside `/app/*` Routes: `<Route path="/catalog" element={<CatalogGenerate />} />`

### 4. `src/components/app/AppShell.tsx`
- Add nav item to `navItems` array: `{ label: 'Catalog', icon: LayoutTemplate, path: '/app/catalog' }`
- Add to `prefetchMap`: `'/app/catalog': () => { import('@/pages/CatalogGenerate'); }`

## Key design decisions
- **No category enforcement**: Unlike existing batch generation, catalog workflow allows mixed product categories (fashion + accessories + electronics in one batch)
- **Model multi-select**: Up to 5 models, both system (custom_models) and user-created (user_models)
- **Stepper pattern**: Simple numbered steps with Next/Back, not tabs — matches the linear flow of the catalog setup
- **Products query**: Direct Supabase query on `user_products` table, same as existing pages

## Test checkpoint
Navigate to `/app/catalog`, verify:
1. Sidebar shows "Catalog" link
2. Product multi-select loads user's products with search
3. Model selection with filters works
4. Running counter updates as selections change
5. Can navigate between Step 1 and Step 2

