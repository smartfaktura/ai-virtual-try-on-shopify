

## Plan: Widen Message column, shrink Page & Status columns

### Changes in `src/pages/AdminFeedback.tsx`

1. **Message column**: Remove `max-w-[250px]` constraint and show more text (up to 200 chars instead of 100). Remove the fixed width so it takes remaining space naturally.

2. **Page column**: Add `w-28` class to shrink it — only shows short paths like `/freestyle`.

3. **Status column**: Reduce from `w-28` to `w-24`.

4. **Date column**: Reduce from `w-32` to `w-28`.

These are small class/slice changes across lines 219-280 of `AdminFeedback.tsx`.

