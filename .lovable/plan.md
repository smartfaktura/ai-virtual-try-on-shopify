

# Fix: Kling Camera Control Values Exceed API Limits

## Problem
The error `cameraControl.config.horizontal: must be less than or equal to 10` confirms that Kling's `camera_control` simple mode accepts values in range **[-10, 10]** for all axes. We set `horizontal: 30` for orbit and `pan: 20` for gentle_pan, both exceeding the limit.

## Fix

**File: `src/lib/videoStrategyResolver.ts`** — clamp all camera control values to [-10, 10]:

```typescript
case 'orbit':
  return { type: 'simple', config: { horizontal: 10, vertical: 3, zoom: 0, tilt: 0, pan: 0, roll: 0 } };
case 'slow_push_in':
  return { type: 'simple', config: { horizontal: 0, vertical: 0, zoom: 5, tilt: 0, pan: 0, roll: 0 } };
case 'gentle_pan':
  return { type: 'simple', config: { horizontal: 0, vertical: 0, zoom: 0, tilt: 0, pan: 10, roll: 0 } };
```

Single file, single function — orbit uses max horizontal (10), gentle_pan uses max pan (10), slow_push_in stays at 5.

