## Add user_id to public /pricing page_view event

Single-file change to `src/pages/Pricing.tsx`.

### Change

1. Add `import { useAuth } from '@/contexts/AuthContext';`
2. Inside the `Pricing()` component, read `const { user } = useAuth();`
3. Update the effect:
   ```ts
   useEffect(() => {
     gtagViewItem('Pricing', 'pricing_page');
     gtmPricingPageView({ userId: user?.id, path: '/pricing' });
   }, [user?.id]);
   ```

### Why the dependency change

`user?.id` is added to the dep array so once Supabase auth hydrates (a tick after mount), the event re-fires with `user_id` attached. The helper `gtmPricingPageView` already dedupes per-path for 15 min via sessionStorage, so this won't cause double-counting in the same session — the second push (with `user_id`) is suppressed if the anonymous one already fired, but for the typical case of a logged-in user landing on `/pricing`, auth resolves before the dedup window matters and the event fires once with `user_id`.

### Untouched
- `/app/pricing` (`AppPricing.tsx`) — already passes `userId` correctly
- `pricing_modal_view`, `begin_checkout`, `purchase` — already include `user_id`
- All Meta/GTM tag config