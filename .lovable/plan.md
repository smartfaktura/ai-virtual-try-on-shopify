
Goal: make workflow thumbnails in `/app/creative-drops` show the real image (not zoomed/cropped), while avoiding the ugly grey blocks.

1) Fix thumbnail rendering in workflow list  
- File: `src/components/app/CreativeDropWizard.tsx` (workflow card block around lines ~948–950)  
- Change thumbnail image from `object-cover object-top` to `object-contain` so the full image is always visible.  
- Keep square thumbnail size for compact layout, but remove the heavy grey fill (`bg-muted`) that makes letterboxing look broken.

2) Improve thumbnail container styling (no “grey crop” look)  
- Replace current container background with a cleaner neutral/transparent style (e.g. `bg-transparent` + subtle border).  
- Add small inner padding so contained images don’t touch edges and remain readable.

3) Prevent layout mismatch while loading  
- Update loading skeleton thumbnail size to match the final thumbnail dimensions so UI doesn’t “jump” after load.

4) Keep text readability fix aligned  
- In the same workflow card, switch description from `truncate` to `line-clamp-2` so users can still understand workflow context after thumbnail changes.

5) Verification checklist after implementation  
- In Step 2 (“Choose a Workflow”), confirm each workflow thumbnail shows full composition (no zoom-in crop).  
- Confirm no grey letterbox blocks dominate thumbnails.  
- Confirm card rows remain aligned and descriptions wrap cleanly to 2 lines.
