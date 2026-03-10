

## Fix: Make BuyCreditsModal Larger to Fit Content

The modal is currently `max-w-4xl` (896px) which isn't wide enough for 4 plan cards. From the screenshot, cards are getting clipped on the right side.

### Change

**`src/components/app/BuyCreditsModal.tsx`** — line 95:
- Change `max-w-4xl` → `max-w-5xl` (1024px) to give the 4 plan cards enough room
- Also increase `sm:max-h-[85dvh]` → `sm:max-h-[90dvh]` to allow more vertical space for the plan features lists

