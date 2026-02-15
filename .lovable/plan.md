

## Creative Drops Schedule Cards and Drop List -- UI Polish

Based on the screenshot and your feedback, here are the specific improvements:

---

### 1. Remove Theme Badge from Schedule Cards

The "summer" badge next to the schedule name adds visual noise without value. The theme is an internal setting, not something users need to see at-a-glance on every card.

**Fix:** Remove the theme badge entirely from the schedule card. Theme info stays visible only inside the wizard/edit view.

---

### 2. Clearer "Active" Status Label

The Active badge is there but blends in. Make it more prominent with a green dot indicator (like a live status dot) so users instantly see which schedules are running.

**Fix:** Replace the plain Active/Paused badge with a dot-prefixed label: a green pulsing dot for Active, a grey dot for Paused. Styled as a subtle chip, not a heavy badge.

---

### 3. Prominent Credit Cost Display

The current format buries credits in a dense info line: "one-time . 1 workflow . 25 imgs . ~100 cr/drop". The credit cost needs its own visual weight.

**Fix:** Pull the credit cost out of the info line and display it as a standalone styled chip on the right side of the card (next to the Active indicator), e.g., "~100 cr" in a subtle bordered chip with a credit icon.

---

### 4. Generation Progress on In-Progress Drops

When a drop is generating, there is no indication of progress (e.g., "8 of 25 images generated"). The card just shows "generating" with a spinner.

**Fix:** For drops with status "generating":
- Show a progress line: "X of Y images" with a small inline progress bar
- The `total_images` field has the target count, and `images.length` has the current count
- This gives users confidence the system is working

---

### 5. Ready Drop Cards -- Thumbnail Preview Row with "View Drop" CTA

Currently ready drops show small thumbnails but the interaction isn't obvious. Users should see a clear "View Drop" button to open the detail modal.

**Fix:** For ready drops:
- Keep the thumbnail preview row (already exists)
- Add a subtle "View Drop" text link or button below the thumbnails so the click target is explicit
- The entire card is already clickable but adding a visible CTA makes it discoverable

---

### 6. Schedule Card -- Clean Info Layout

The info line is too dense. Restructure it into two clear lines with better hierarchy.

**Fix:** Restructure the schedule card subtitle into:
- Line 1: Frequency and image count -- "One-time . 25 images per drop"
- Line 2: Product and workflow count -- "1 product . 1 workflow"
- Remove redundant data from the info line

---

### Technical Details

**Files modified:**

| File | Changes |
|------|---------|
| `src/components/app/DropCard.tsx` | Remove theme badge; restructure info lines; move credit cost to standalone chip; add green dot for Active; add progress bar for generating drops; add "View Drop" CTA for ready drops |

**Schedule card layout (after):**
```text
+------------------------------------------------------------------+
| [icon]  Summer                              ~100 cr  * Active  : |
|         One-time . 25 images per drop                            |
|         1 product . 1 workflow                                   |
+------------------------------------------------------------------+
```

**Generating drop card layout (after):**
```text
+------------------------------------------------------------------+
| [icon]  Drop -- Feb 15, 2026                     [generating]    |
|         8 of 25 images . 100 credits                             |
|         [====------] 32%                                         |
+------------------------------------------------------------------+
```

**Ready drop card layout (after):**
```text
+------------------------------------------------------------------+
| [icon]  Drop -- Feb 15, 2026                        [ready]      |
|         25 images . 100 credits                                  |
|         [thumb][thumb][thumb][thumb] +21    View Drop ->         |
+------------------------------------------------------------------+
```

**Active/Paused indicator:**
```tsx
// Green pulsing dot for active
<span className="flex items-center gap-1.5 text-xs">
  <span className={cn(
    "w-2 h-2 rounded-full",
    schedule.active ? "bg-green-500 animate-pulse" : "bg-muted-foreground/40"
  )} />
  {schedule.active ? 'Active' : 'Paused'}
</span>
```

**Generation progress (for "generating" status drops):**
```tsx
const completedImages = (drop.images || []).length;
const targetImages = drop.total_images || 0;
const progressPct = targetImages > 0 ? Math.round((completedImages / targetImages) * 100) : 0;

// Show inline:
<div className="mt-2">
  <p className="text-xs text-muted-foreground mb-1">
    {completedImages} of {targetImages} images
  </p>
  <Progress value={progressPct} className="h-1.5" />
</div>
```

