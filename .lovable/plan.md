

# Move "Create with Promt" After "Visual Studio" in Sidebar

## Change — `src/components/app/AppShell.tsx`

Reorder the `navItems` array so "Create with Promt" moves from position 6 (after Video) to position 2 (after Visual Studio):

```
Dashboard
Visual Studio
Create with Promt   ← moved here
Products
Explore
Video
Library
...
```

Single line move: cut line 57, insert it after line 53.

