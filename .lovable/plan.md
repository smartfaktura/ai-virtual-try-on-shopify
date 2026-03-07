

## Implement Global ScrollToTop

### Changes

**1. Create `src/components/ScrollToTop.tsx`**
- Uses `useLocation` and `useNavigationType` from react-router-dom
- On PUSH navigation: `window.scrollTo(0, 0)` 
- On POP (back/forward): let browser handle naturally
- Returns `null`

**2. Add to `src/App.tsx`**
- Import and place `<ScrollToTop />` inside `<BrowserRouter>`, before `<Routes>`

**3. Clean up `src/components/landing/PageLayout.tsx`**
- Remove `useLocation`, `useEffect`, and the scroll-to-top logic (now handled globally)

| File | Change |
|------|--------|
| `src/components/ScrollToTop.tsx` | New — global scroll reset on forward navigation |
| `src/App.tsx` | Add `<ScrollToTop />` inside router |
| `src/components/landing/PageLayout.tsx` | Remove redundant scroll logic |

