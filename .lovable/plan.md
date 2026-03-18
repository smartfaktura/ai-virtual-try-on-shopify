

## Fix: "Meet Your Team" Button Should Always Link to /team

The `StudioTeamSection` component currently routes unauthenticated users to `/auth` instead of `/team`. Since `/team` is a public route, the button should always navigate to `/team` regardless of auth state.

### Change

In `src/components/landing/StudioTeamSection.tsx`, line 188:

```tsx
// Before
onClick={() => navigate(user ? '/team' : '/auth')}

// After
onClick={() => navigate('/team')}
```

The auth check can be removed entirely — the Team page is public and accessible to everyone.

