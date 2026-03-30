

## Fix: Avatar Crash / Flicker in Workflow Activity Cards

### Root Cause

The `WorkflowActivityCard` parent runs `useVisibilityTick(1000)` to update elapsed time labels every second. This re-renders **every** `ActiveGroupCard` child 1x/second. Each child also has its own `useVisibilityTick(3000)` for avatar cycling. The combination causes:

1. **CSS transition interruption** — the 500ms opacity crossfade between avatars gets reset on every 1s parent re-render, causing both avatars to flash simultaneously (the overlapping circles in the screenshot)
2. **DOM remount spam** — `key={currentAgent.name}` on the agent status message (line 146) forces a full remount animation on every team change, but parent re-renders at 1s can cause intermediate states

When multiple batch groups are active (e.g., 5 separate workflow cards), this creates 5 cards × 1 re-render/sec = constant layout thrashing on the avatar stack.

### Plan

#### 1. Memoize `ActiveGroupCard` to block parent tick propagation

Wrap `ActiveGroupCard` with `React.memo` and a custom comparator that only re-renders when the group data actually changes (job counts, statuses). The parent's 1s elapsed-time tick will no longer force all children to re-render.

**File**: `src/components/app/WorkflowActivityCard.tsx`

#### 2. Move elapsed time into its own ticking component

Extract the elapsed label (`3m 12s`) into a tiny `<ElapsedTimer startedAt={...} />` component that runs its own `useVisibilityTick(1000)`. This isolates the 1s re-render to just the text node, not the entire card with avatars.

**File**: `src/components/app/WorkflowActivityCard.tsx`

#### 3. Remove the parent-level 1s tick

The parent `useVisibilityTick(1000, hasActiveGroups)` at line 204 is now unnecessary since each card handles its own elapsed time. Remove it to eliminate the cascade re-render entirely.

**File**: `src/components/app/WorkflowActivityCard.tsx`

#### 4. Stabilize avatar transition with will-change

Add `will-change: opacity` to the avatar stack elements so the browser composites the opacity transition on the GPU layer, preventing flicker during React re-renders.

**File**: `src/components/app/WorkflowActivityCard.tsx` (avatar div, line 110)

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/WorkflowActivityCard.tsx` | Memoize `ActiveGroupCard`; extract `ElapsedTimer`; remove parent 1s tick; add `will-change: opacity` to avatar stack |

### Result
- Parent no longer re-renders all children every second
- Avatar crossfade runs smoothly without interruption
- Elapsed time still updates every second but isolated to its own component
- Works correctly with 1 or 20 simultaneous active groups

