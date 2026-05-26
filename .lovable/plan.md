Match the feedback card's button/chip hovers to the outline CTA aesthetic (visible darkening like Edit Image / Enhance to 4K).

**Edits in `src/components/app/ContextualFeedbackCard.tsx`:**

1. **Answer buttons (Nailed it / Almost / Not quite) — line 178**  
   Replace `hover:bg-accent hover:text-accent-foreground` → `hover:bg-foreground/[0.06] hover:border-foreground/30`.

2. **Submit button — line 239**  
   Same replacement: `hover:bg-accent hover:text-accent-foreground` → `hover:bg-foreground/[0.06] hover:border-foreground/30`.

3. **Reason chips — line 214**  
   `hover:bg-accent` → `hover:bg-foreground/[0.06] hover:border-foreground/30`.

No copy or layout changes.