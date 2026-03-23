

# Fix Dashboard Hero: Sync Headline with Pill + Premium CTA

## Problems
1. **Headline doesn't update** when the "Personalized for" pill changes - the two components independently fetch `product_categories` from the database and don't share state.
2. **"Start a Campaign" button** looks like a standard form button - not premium.
3. **Helper text** (`Virtual Try-On · Product Editorial · Catalog Generation`) is plain unstyled text.

## Solution

### 1. Shared state between Hero and Pill (`src/pages/Dashboard.tsx`)
Lift the `selected` category state into Dashboard. Pass it down as props to both `DashboardPersonalizationHero` and `PersonalizedForPill`. When the pill changes, the headline updates instantly.

### 2. Premium CTA styling (`src/components/app/DashboardPersonalizationHero.tsx`)
Replace the standard `<Button>` with a more refined styled button:
- Slightly larger padding, subtle gradient or refined shadow
- Arrow icon instead of sparkles for a cleaner editorial feel
- Smooth hover transition

### 3. Helper text as styled badges
Replace the plain `<p>` with three small inline badges/chips with subtle borders and muted styling, giving them visual weight and structure:
```
[ Virtual Try-On ]  [ Product Editorial ]  [ Catalog Generation ]
```

### Files Changed

**`src/pages/Dashboard.tsx`** (~15 lines):
- Add `useState<string>('any')` + `useEffect` to fetch category once
- Pass `selected` to `DashboardPersonalizationHero` and `onSelect`/`selected` to `PersonalizedForPill`
- Remove duplicate fetching from both child components

**`src/components/app/DashboardPersonalizationHero.tsx`** (~20 lines):
- Accept `selected` as prop instead of fetching internally
- Restyle the CTA button: refined look with `rounded-full`, subtle shadow, arrow icon
- Replace helper text with three small styled chips/badges
- `PersonalizedForPill` accepts `selected` + `onSelect` props instead of managing its own state

