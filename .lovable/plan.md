
Fix target

The remaining error is no longer CORS or RLS. The request now reaches `analyze-trend-post`, but the AI provider rejects the current function/tool schema before analysis runs. The network error shows the real blocker: the schema has too much branching for Gemini tool-calling, so no `reference_analyses` row gets created.

Plan

1. Replace schema-based tool calling in `analyze-trend-post`
- Remove the large function schema from the AI request.
- Keep the same image + caption input, but ask the model to return one plain JSON object in the message body.
- Manually parse that JSON, normalize the values, and save the same fields into `reference_analyses`.
- Keep the existing admin/auth checks and current DB insert shape, so no migration is needed.

2. Harden the backend response handling
- Support raw JSON and fenced ```json responses when parsing.
- Normalize missing values to the expected types (`''`, `[]`, `false`) before insert.
- Return clearer backend errors for malformed AI output instead of the current generic non-2xx failure.
- Keep current CORS headers on all success and error responses.

3. Tighten the draft creation flow
- In `AddImageDraftModal`, stop re-querying `reference_analyses` immediately after the function call; use the function’s returned `analysis` directly.
- Await scene creation before closing the modal and switching tabs, so the UI only reports success after the draft actually exists.
- Apply the same await-based pattern to the post-detail “Analyze & Create Draft” flow so both entry points behave consistently.

Files to update
- `supabase/functions/analyze-trend-post/index.ts`
- `src/components/app/trend-watch/AddImageDraftModal.tsx`
- `src/pages/AdminTrendWatch.tsx`
- `src/components/app/trend-watch/PostDetailDrawer.tsx` if needed to make the callback async end-to-end

Technical details
- No database changes are needed.
- No additional CORS work is needed beyond the headers already added.
- The core fix is changing from provider-validated tool schema to prompt-driven JSON output, because the current schema is too large/branchy for Gemini function calling.
- The saved analysis columns stay the same, so existing admin UI can keep reading `reference_analyses` without structural changes.

Verification
- Test “Analyze & Create Draft” from an existing Trend Watch post.
- Test “Add Image → Analyze & Create Draft” with both upload and paste.
- Confirm a `reference_analyses` row is created and a draft scene appears in Draft Scenes.
- Confirm the UI only closes/navigates after the draft insert succeeds.
- Confirm invalid AI output now shows a clearer error message instead of the generic edge-function failure.
