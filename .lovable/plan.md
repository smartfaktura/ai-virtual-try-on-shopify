

## Fix: Mobile logo in AppShell navigates to homepage instead of dashboard

The bug is on line 332 of `src/components/app/AppShell.tsx`. The mobile header logo has `onClick={() => navigate('/')}` while the desktop sidebar logo correctly uses `onClick={() => navigate('/app')}`.

### Change
**`src/components/app/AppShell.tsx` line 332** — change `navigate('/')` to `navigate('/app')` so the mobile logo behaves the same as desktop, returning users to the dashboard.

