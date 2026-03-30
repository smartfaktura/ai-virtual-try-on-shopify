

# Quick Perf Fixes: Lazy-load, Scope Provider, Lazy Images

Three isolated, low-risk changes across ~8 files.

---

## 1. Lazy-load StudioChat & GlobalGenerationBar

**File**: `src/components/app/AppShell.tsx`

- **Line 1**: Add `lazy, Suspense` to the React import
- **Lines 11, 13**: Replace eager imports with:
  ```tsx
  const StudioChat = lazy(() => import('@/components/app/StudioChat').then(m => ({ default: m.StudioChat })));
  const GlobalGenerationBar = lazy(() => import('@/components/app/GlobalGenerationBar').then(m => ({ default: m.GlobalGenerationBar })));
  ```
- **Lines 421, 424**: Wrap each in `<Suspense fallback={null}>`:
  ```tsx
  <Suspense fallback={null}><StudioChat /></Suspense>
  <Suspense fallback={null}><GlobalGenerationBar /></Suspense>
  ```

---

## 2. Move AdminViewProvider inside /app/* routes

**File**: `src/App.tsx`

- **Line 95**: Remove `<AdminViewProvider>` from global wrapper
- **Line 202**: Remove closing `</AdminViewProvider>`
- **Lines 151-152**: Wrap inside the protected route block:
  ```tsx
  <ProtectedRoute>
    <AdminViewProvider>
      <CreditProvider>
        ...
      </CreditProvider>
    </AdminViewProvider>
  </ProtectedRoute>
  ```

---

## 3. Add `loading="lazy"` to below-fold ShimmerImages

Add the `loading="lazy"` prop to every `<ShimmerImage>` in these 5 files:

| File | Location |
|------|----------|
| `src/components/landing/BeforeAfterGallery.tsx` | Lines ~67, ~74 |
| `src/components/landing/ModelShowcaseSection.tsx` | Line ~67 in `ModelCardItem` |
| `src/components/landing/EnvironmentShowcaseSection.tsx` | Line ~52 in `MarqueeRow` |
| `src/components/landing/FreestyleShowcaseSection.tsx` | Line ~280 |
| `src/components/landing/CreativeDropsSection.tsx` | Lines ~101, ~143 |

