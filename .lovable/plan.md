

## Add Loading States to "Manage Billing & Invoices" and "Switch to Annual" Buttons

Both buttons call `openCustomerPortal` which is async (invokes a backend function, then redirects). Currently there's no visual feedback while loading.

### Changes (`src/pages/Settings.tsx`)

1. **Add a `portalLoading` state** — `const [portalLoading, setPortalLoading] = useState(false);`

2. **Wrap `openCustomerPortal` calls** — Create a handler:
   ```ts
   const handlePortal = async () => {
     setPortalLoading(true);
     await openCustomerPortal();
     setPortalLoading(false);
   };
   ```

3. **"Manage Billing & Invoices" button (line 279)** — Replace `onClick={openCustomerPortal}` with `onClick={handlePortal}`, add `disabled={portalLoading}`, and swap icon to a spinner when loading:
   ```tsx
   <Button variant="secondary" size="sm" className="w-full" onClick={handlePortal} disabled={portalLoading}>
     {portalLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5 mr-1.5" />}
     {portalLoading ? 'Redirecting…' : 'Manage Billing & Invoices'}
   </Button>
   ```

4. **"Switch to annual" button (line 260)** — Same treatment, reuse `portalLoading` since both go to Stripe portal:
   ```tsx
   <button ... onClick={handlePortal} disabled={portalLoading}>
     {portalLoading ? 'Redirecting…' : 'Switch to annual & save 20% →'}
   </button>
   ```

5. **Import `Loader2`** from `lucide-react` (add to existing import if not present).

