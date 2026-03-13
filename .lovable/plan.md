

## Fix Multi-Product Virtual Try-On Loading State

The screenshot shows the multi-product generating overlay lacks time estimates and feels "glitched" — it only shows "0 of 3 products complete" with a flat progress bar and product chips, but no elapsed timer, estimated time, or per-product active indicator.

### Changes in `src/pages/Generate.tsx`

**Add elapsed timer and time estimate to the multi-product progress section (lines 3873-3910):**

1. **Add elapsed timer state** — track a `multiProductStartTime` ref that gets set when entering multi-product generating mode. Display elapsed seconds alongside the progress.

2. **Add estimated time** — calculate based on product count × ~90s per product (Pro model for try-on). Show "Est. ~X-Y min" below the progress bar.

3. **Show the active QueuePositionIndicator inside multi-product mode** — currently it's explicitly hidden (`!isMultiProductMode`). Add the `activeJob` indicator below the product chips so users can see per-product processing status (with the spinning timer, team messages, etc.).

4. **Add overtime messaging** — if elapsed exceeds estimate, show reassuring text like "Taking a bit longer — still working..."

**Specific edits:**

- **Lines 3873-3910**: Enhance the multi-product progress block:
  - Add an elapsed timer (seconds counter) using a `useEffect` interval
  - Add estimated time text: `Est. ~${Math.ceil(productQueue.length * 1.5)}-${productQueue.length * 3} min`
  - After the product chips (line 3908), add the `QueuePositionIndicator` for the currently active job so users see real-time per-product progress with the team avatar rotation
  - Add a subtle "currently processing" label next to the active product chip

- **Around line 227**: Add a ref for tracking multi-product start time:
  ```tsx
  const multiProductStartRef = useRef<number>(0);
  ```

- **Around lines 737-738**: Set the start time when entering multi-product generation:
  ```tsx
  multiProductStartRef.current = Date.now();
  ```

### Result
The loading state will show:
- "1 of 3 products complete — 45s elapsed"  
- "Est. ~3-6 min for 3 products"
- Progress bar with percentage
- Product chips with active/done states
- QueuePositionIndicator for the currently processing product (with team avatars, per-product timer)
- Cancel button

