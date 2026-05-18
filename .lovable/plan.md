Root cause found: the Talking Video button is responding, but it is blocked before enqueue because the current balance is 8 credits and the selected 5s Talking Video costs 22 credits. That is why no `enqueue-generation` network request appears. The app fires the low-credits modal instead, but the page does not make that obvious enough.

Plan:

1. Make the CTA state explicit
   - When balance is below the selected duration cost, change the button copy from `Generate talking video` to a clear top-up/credits message
   - Keep the button clickable so it opens the existing low-credits/top-up modal
   - Add an inline message near the cost line: `Need 14 more credits to generate this video`

2. Add a toast for the low-credit path
   - On click with insufficient credits, show a branded toast explaining the exact issue
   - Example: `You need 22 credits for a 5s Talking Video. Your balance is 8.`

3. Prevent accidental queue changes
   - Do not change `process-queue`
   - Do not change `generate-talking-video`
   - Do not change `enqueue-generation`
   - Do not change database schema or credit deduction logic

4. Optional small safety check
   - If the balance is still loading, show `Checking credits…` instead of treating it as zero
   - This avoids a false low-credit block while the balance context is loading

Expected result:
- If all required fields are selected but credits are too low, the user gets a clear reason immediately
- If credits are sufficient, the existing `talking_video` enqueue flow continues unchanged
- No existing video queue workflow is touched