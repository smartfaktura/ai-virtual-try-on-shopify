## Goal
Add at least 2 more working female voices to the Talking Video picker by probing remaining Kling lip-sync IDs and keeping only those that both (a) succeed at submit, (b) produce audible output, and (c) sound natural enough for VOVV.AI.

## Candidates to probe
Pulled from Kling's current lip-sync voice catalog (mirrored by WaveSpeed). All female or female-leaning, excluding kids/grandma/anime:

| ID                       | Notes                          | Try languages |
|--------------------------|--------------------------------|---------------|
| `girlfriend_4_speech02`  | Conversational female          | en, zh        |
| `chat1_female_new-3`     | Casual female                  | en, zh        |
| `chat_0407_5-1`          | Female chat voice              | en, zh        |
| `chengshu_jiejie`        | Mature female (likely zh-only) | zh, en        |
| `you_pingjing`           | Calm female narrator           | zh, en        |
| `calm_story1`            | Storyteller (gender unknown)   | en, zh        |
| `ai_shatang`             | Sweet female                   | zh, en        |
| `genshin_kirara`         | Anime female — only as last resort if all naturals fail | en, zh |

## Step 1 — Re-probe
Update the temporary `probe-kling-voices` edge function with the candidate list, re-deploy, call it. For each ID, try `en` first; if it returns `Voice id not found`, retry with `zh`. Record `code`, `message`, `task_id`.

## Step 2 — Confirm audio
For every candidate that returns `code: 0`, poll Kling's `/videos/lip-sync/{task_id}` after ~90 seconds until `task_status` is `succeed` or `failed`. Reject any that fail at this stage. Keep the resulting video URLs for sample review.

## Step 3 — Quality review
Download the succeeded result videos to `/mnt/documents/voice-probe/` so you can listen to each one and confirm:
- Voice sounds natural in English (or acceptable accent)
- Not a child / cartoon / grandma timbre
- On-brand for VOVV.AI editorial tone

Present the surviving voices with sample MP4s. You pick the ≥2 female voices to keep.

## Step 4 — Wire into picker
For each chosen voice:
- Add a `KlingVoice` entry to `src/components/app/video/KlingVoicePicker.tsx` with a curated English label (e.g. Mia, Lila, Eva), `language` matching the language flag that worked, and `gender: 'female'`.
- Add a `VOICE_MAP` entry in `supabase/functions/seed-voice-samples/index.ts` mapping each new Kling ID to a tonally-matching ElevenLabs voice for the preview button.

## Step 5 — Make `voice_language` follow the voice
Right now `poll-stuck-videos` and `generate-talking-video` default `voice_language` to `en` and pass through `meta.voice_language`. The frontend currently doesn't send a per-voice language. To safely support zh-only voices that we keep:
- Update the talking-video page to send `voice_language` from the selected `KlingVoice.language` field.
- Update `generate-talking-video/index.ts` to default `voice_language` based on the selected `voice_id` if not provided (lookup table mirroring the picker).
- No change needed in `poll-stuck-videos` (it already reads `meta.voice_language`).

## Step 6 — Seed previews
Re-deploy `seed-voice-samples` and POST to it (admin) so the new MP3 previews appear in the picker.

## Step 7 — Validate end-to-end
- Open `/app/video/talking`, confirm at least 3 female voices visible (Kaiya + ≥2 new).
- Click ▶ on each new voice → preview plays.
- Run one short talking-video generation per new voice to confirm the real Kling pipeline succeeds.

## Step 8 — Cleanup
Delete the temporary `probe-kling-voices` edge function once we're done.

## Deliverable to you
- A table of all probed IDs with their outcome (`Voice id not found` / submitted / `succeed` / `failed`).
- For voices that produced audio, the sample MP4 URLs so you can listen before we ship.
- Final picker showing ≥3 female voices.

## Out of scope
- No changes to credit pricing, base video generation, or silent-fallback behavior.
- No new male voices.
- No Chinese-language UI copy (we keep the picker English-only even if a voice's language flag is `zh`).
