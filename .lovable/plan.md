

# Pre-select "API (RapidAPI)" as Default Source Mode

## Change
In `AddAccountModal.tsx`, change the default value of `sourceMode` from `'manual'` to `'official_api'`, and update the reset in the `useEffect` to also default to `'official_api'` when not editing.

## File
- `src/components/app/trend-watch/AddAccountModal.tsx` — two lines: initial `useState` and the `else` branch in `useEffect`

