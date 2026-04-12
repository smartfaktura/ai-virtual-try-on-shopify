

# Move "Explore Presets" into the Create Group

## Change
In `src/components/app/AppShell.tsx`, move the `Explore Presets` nav item from the **Assets** group to the **Create** group, placing it right after **Video**.

### Before
```
Create: Visual Studio, Create with Prompt, Video
Assets: Products, Brand Models, Explore Presets, Library
```

### After
```
Create: Visual Studio, Create with Prompt, Video, Explore Presets
Assets: Products, Brand Models, Library
```

Single file edit — lines 63-72 of `AppShell.tsx`.

