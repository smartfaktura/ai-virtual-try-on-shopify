

# Change "Create with Prompt" Icon to Sparkles

ChatGPT/OpenAI uses a sparkle-style icon. The closest Lucide equivalent is `Sparkles` — a multi-point star burst that conveys AI-powered generation.

## Change
In `src/components/app/AppShell.tsx`:
- Replace `Command` import with `Sparkles`
- Update the icon reference in the navGroups array

Single import swap + one line in the nav config.

