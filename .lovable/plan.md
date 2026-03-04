

## Clean Up Settings Page

Remove the clutter cards and add a clear "Manage Subscription" button. Keep only Plan/Credits, Plan Selection, Credit Packs, and Notifications.

### Changes — `src/pages/Settings.tsx`

1. **Add "Manage Subscription" button** to the Current Plan card (next to the plan badge) — visible when user has an active/canceling subscription. Calls `openCustomerPortal()`.

2. **Remove these cards entirely** (lines 349-457):
   - Download & Export Defaults
   - AI Model Settings
   - Team & Permissions
   - Help & Support
   - About

3. **Remove unused settings fields** from `UserSettings` and `DEFAULT_SETTINGS`:
   - `defaultQuality`, `publishMode`, `autoPublish`, `restrictPromptEditing`
   - Keep only notification-related settings

4. **Remove unused imports**: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, `HelpCircle`, `MessageSquare`

5. **Clean layout order**:
   - Current Plan card (with "Manage Subscription" button)
   - Choose Your Plan + billing toggle + plan cards
   - Enterprise banner
   - Credit packs
   - Cancel/reactivate link
   - Separator
   - Notifications card
   - Save Settings button

