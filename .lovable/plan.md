

# Fix: Attach Missing Billing Protection Trigger

## Analysis

The `protect_billing_fields()` function already exists in the database and correctly blocks client-side modifications to `credits_balance`, `plan`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `billing_interval`, and `credits_renewed_at`.

However, the database shows **no triggers are attached**. The function exists but is never invoked — meaning the protection is inactive.

## Change (1 item)

### Create the BEFORE UPDATE trigger on `profiles`

Run a migration to attach the existing function as a trigger:

```sql
CREATE TRIGGER trg_protect_billing_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_billing_fields();
```

No code changes needed — all edge functions already use `service_role` for billing updates, which the function explicitly allows through.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Attach `protect_billing_fields()` as a `BEFORE UPDATE` trigger on `profiles` |

