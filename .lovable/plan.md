Add 200 credits to the account `founder@tennisclubfinejewelry.com` via the `add_purchased_credits` RPC (which safely bumps `profiles.credits_balance` and fires the Resend `credits.purchased` event).

Steps:
1. Look up `user_id` from `profiles` where `email = 'founder@tennisclubfinejewelry.com'`.
2. Call `SELECT add_purchased_credits('<user_id>', 200);`
3. Verify new balance and report back.

No code or schema changes.