
Fix plan (focused on “images generated but only 1 shown”):

1) Confirmed from backend data
- Last “Selfie / UGC Set” run created 8 completed workflow jobs (each with 1 image in result), so generation is successful.
- This is a frontend aggregation/display issue.

2) Root causes in `src/pages/Generate.tsx`
- Multi-job polling request is malformed at line ~1556: uses `\&select` instead of `&select`.
- Terminal detection is unsafe: `allTerminal` is based only on returned rows, so if API returns a partial subset, UI can finalize early with only 1 image.
- Single-job watcher can still overwrite aggregated results after multi-job flow (stale `activeJob` path).

3) Implementation changes (same file only)
- Fix polling URL:
  - Change `...)\&select=...` → `...)&select=...`.
- Harden multi-job completion logic:
  - Build a `rowByJobId` map from response.
  - For every expected job ID, derive status with fallback (`queued` if missing).
  - Compute:
    - `completedCount`, `failedCount` from expected jobs only,
    - `allTerminal` only when **every expected job** is terminal.
  - Aggregate images strictly by expected job order/keys so all generated images are included.
- Prevent stale overwrite from single-job effect:
  - Add guard in activeJob watcher to skip when we are already in results/finalizing or when multi-job context exists.
  - Include `currentStep` (and finalizing flag) in dependencies.
  - Optionally call `resetQueue()` before clearing `multiProductJobIds` in multi-job finalize block.

4) Expected result after fix
- Selfie / UGC runs that produce 8 jobs will consistently show all 8 images in Generated Images grid.
- No regression for true single-job workflows.
- Progress banner and result count align with backend completion.

5) Verification checklist
- Re-run Selfie / UGC Set with 8 outputs (same settings as failed case).
- Confirm:
  - progress reaches 8/8,
  - results grid shows 8 images,
  - no late switch back to 1 image,
  - Download All ZIP contains all displayed images.
