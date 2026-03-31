
The issue is not your publish step.

What I found:
- Your codebase is updated to use the direct Gemini endpoint:
  `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- The updated files also use `GEMINI_API_KEY`
- The code no longer contains `google/gemini-...` model strings in the edited generation functions

But the runtime logs still show the old behavior:
- `generate-freestyle` last run logged:
  `provider=nanobanana/google/gemini-3-pro-image-preview`
- `generate-workflow` latest runs logged:
  `using google/gemini-3-pro-image-preview`

That means the backend function version currently running is older than the code shown in the repo, or the backend deploy for those functions did not complete successfully.

Why this happens:
- Frontend publish and backend function deployment are separate
- Publishing updates the site UI
- Backend function changes deploy automatically
- If backend deploy fails or gets stuck, the published site can still call the previous backend version

Most likely cause:
1. The function code change exists in the repo
2. The backend runtime is still serving a previous deployed bundle
3. So your recent generations still hit the old Lovable AI path

What I would implement next to fix it:
1. Re-deploy the affected backend functions explicitly:
   - `generate-freestyle`
   - `generate-workflow`
   - `generate-workflow-preview`
   - any other migrated image-generation functions
2. Check deployment logs/errors for those functions right after redeploy
3. Trigger one fresh generation
4. Verify runtime logs show:
   - `gemini-3-pro-image-preview`
   - not `google/gemini-3-pro-image-preview`
   - and no old `provider=nanobanana/google/...` strings
5. If deploy still fails, inspect edge-runtime compatibility issues:
   - lockfile problems
   - import resolution issues
   - syntax/runtime errors during function bundle build

Technical details:
```text
Expected after successful backend deploy:
  generate-workflow log:
    using gemini-3-pro-image-preview

  generate-freestyle log:
    provider=nanobanana/gemini-3-pro-image-preview
    or equivalent direct-model log without "google/"

Actual now:
  generate-workflow:
    using google/gemini-3-pro-image-preview

  generate-freestyle:
    provider=nanobanana/google/gemini-3-pro-image-preview
```

Conclusion:
- Your app is published
- The new backend code is not what is currently executing
- So this is a backend deployment mismatch, not a user publishing mistake

Concrete next implementation plan:
1. Inspect deployment state/errors for the migrated backend functions
2. Re-deploy only the image-generation functions
3. Run a fresh generation test
4. Confirm logs switched from `google/gemini-...` to plain `gemini-...`
5. If still stale, isolate the exact function failing deployment and fix its bundle/runtime issue
