Reorganize the app sidebar navigation groups so all creation tools sit under a single **Workspace** section.

Current structure:
```text
Workspace
  Dashboard
Create
  Visual Studio
  Create with Prompt
  Video
  Explore
Assets
  Library
  Products
  Brand Models
  Brand Scenes
```

New structure:
```text
Workspace
  Dashboard
  Visual Studio
  Create with Prompt
  Video
  Explore
Assets
  Library
  Products
  Brand Models
  Brand Scenes
```

**Changes:**
1. In `src/components/app/AppShell.tsx`, merge the `Create` group items into the `Workspace` group and remove the standalone `Create` group entry.
2. Remove the empty extra blank line inside the old `Create` items array.

The `Assets` group stays unchanged. No other UI or logic changes.