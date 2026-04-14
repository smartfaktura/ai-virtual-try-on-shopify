

# Fix Short Film Generation Failures

## Root Causes Found

### 1. Kling Content Moderation Rejection (Video Failure)
The error `"Failure to pass the risk control system"` is Kling rejecting the prompts. The AI Director generated phrases like **"A real human person with natural skin, visible face, and authentic expression. Character speaking dialogue, natural lip movement, conversational expression."** — this explicit human description pattern triggers Kling's content safety filter. The HUMAN_NEGATIVES system tries to prevent mannequins, but the positive human directives are too explicit and get flagged.

### 2. `with_audio` Still Not Fixed (Line 983)
The main generation payload still has: `with_audio: !(settings.audioLayers?.music || settings.audioLayers?.sfx || settings.audioLayers?.voiceover)`. The failed job shows `with_audio: true`, meaning ElevenLabs layers weren't detected. This should be hardcoded to `false` since ElevenLabs handles all audio.

### 3. Missing UPDATE RLS Policy on `generated-audio` Bucket
The bucket has INSERT, SELECT, DELETE policies but **no UPDATE policy**. The upload code uses `upsert: true`, which requires UPDATE permission. Every audio upload fails with `"new row violates row-level security policy"`.

### 4. Prompts Truncated Mid-Sentence
Shots 2, 3, 4 are cut off at exactly 512 characters mid-word: `"...soft directional shadows, subtle"` — the truncation system doesn't find a clean sentence boundary.

## Changes

### Database Migration
Add UPDATE policy on `generated-audio` storage bucket:
```sql
CREATE POLICY "Users can update their own audio"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'generated-audio' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'generated-audio' AND (auth.uid())::text = (storage.foldername(name))[1]);
```

### File: `src/hooks/useShortFilmProject.ts`
- **Line 983**: Change `with_audio: !(settings.audioLayers?.music || settings.audioLayers?.sfx || settings.audioLayers?.voiceover)` to `with_audio: false`
- **Line 420**: Change `with_audio: !!(getEffectiveLayers(settings).sfx)` to `with_audio: false`

### File: `src/lib/shortFilmPromptBuilder.ts`
- Remove or soften the explicit human directives that trigger Kling's content filter. Replace `"A real human person with natural skin, visible face, and authentic expression. Character speaking dialogue, natural lip movement, conversational expression."` with safer phrasing like `"Natural portrait, authentic expression."` — shorter and less likely to trigger moderation
- Fix truncation to cut at the last complete sentence (`.`) boundary instead of hard-cutting at 512 chars mid-word

## Summary

| Area | Fix |
|------|-----|
| Database | Add UPDATE RLS policy on `generated-audio` storage bucket |
| `useShortFilmProject.ts` | Hardcode `with_audio: false` in both main generation and retry |
| `shortFilmPromptBuilder.ts` | Soften human directives to avoid Kling content filter; fix truncation to respect sentence boundaries |

