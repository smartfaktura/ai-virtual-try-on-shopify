

# Add CTA Button Below Product Category Showcase

## What changes

Add a "Try It Free →" button centered below the category cards grid, matching the style used in FinalCTA (rounded-full, primary, with ArrowRight icon).

## File: `src/components/landing/ProductCategoryShowcase.tsx`

- Import `Button` from `@/components/ui/button`, `ArrowRight` from `lucide-react`, `useNavigate` from `react-router-dom`, and `useAuth` from `@/contexts/AuthContext`
- Add a centered `div` after the grid containing a `Button` with text "Try It Free" and an `ArrowRight` icon
- On click: navigate to `/app` if logged in, `/auth` otherwise
- Style: `rounded-full px-8 py-5 text-base font-semibold gap-2 shadow-lg shadow-primary/20`, `mt-10 text-center`

