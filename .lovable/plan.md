

# Fix Missing Continue Button on Template Selection

## Problem
After selecting a product and viewing templates, there's no visible "Continue" button at the bottom of the screen. The current Continue button is hidden inside the "Top Picks" card and disappears when users scroll down to browse more templates.

## Solution
Add a sticky footer bar that appears when a template is selected, ensuring users always have a clear path forward regardless of scroll position.

## Implementation

### Step 1: Create Sticky Footer Component
Add a fixed-position footer bar at the bottom of the template step that:
- Appears only when a template has been selected
- Shows the selected template name
- Has a prominent Continue button
- Stays visible while scrolling

### Step 2: Update Template Step Layout
Modify the template selection step to include:
- A sticky footer bar when `selectedTemplate` is set
- Add bottom padding to prevent content from being hidden behind the footer

### Changes to `src/pages/Generate.tsx`

**Location**: After the "Browse All Templates" card closes (around line 1280), add a sticky footer:

```jsx
{/* Sticky Continue Footer - Shows when template selected */}
{selectedTemplate && (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg p-4">
    <div className="max-w-5xl mx-auto">
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="300" blockAlign="center">
          {/* Template thumbnail */}
          <div className="w-10 h-10 rounded-md overflow-hidden border border-border">
            <img src={getTemplateImage(selectedTemplate.templateId)} alt="" className="w-full h-full object-cover" />
          </div>
          <BlockStack gap="050">
            <Text as="p" variant="bodySm" fontWeight="semibold">
              {selectedTemplate.name}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {creditCost} credits
            </Text>
          </BlockStack>
        </InlineStack>
        <InlineStack gap="200">
          <Button onClick={() => setSelectedTemplate(null)}>
            Clear
          </Button>
          <Button variant="primary" onClick={() => setCurrentStep('settings')}>
            Continue to Settings
          </Button>
        </InlineStack>
      </InlineStack>
    </div>
  </div>
)}
```

**Also add bottom padding** to the template step container to prevent content being hidden:
```jsx
{/* Add padding when footer is visible */}
<div className={selectedTemplate ? 'pb-24' : ''}>
  {/* Existing template content */}
</div>
```

### Visual Result
```text
+------------------------------------------+
|  Top Picks for Clothing                  |
|  [Template 1] [Template 2] [Template 3]  |
+------------------------------------------+
|  Browse All Templates                    |
|  [All] [Clothing] [Cosmetics] ...        |
|  [Template] [Template] [Template] ...    |
+------------------------------------------+
                    |
                    | User scrolls down
                    v
+==========================================+
| [img] Minimal Packaging     [Clear] [Continue to Settings]  | <-- STICKY FOOTER
|       3 credits                                              |
+==========================================+
```

## Files Changed
- `src/pages/Generate.tsx` - Add sticky footer bar and bottom padding

## Result
Users will always see a clear "Continue to Settings" button at the bottom of the screen when they've selected a template, regardless of how far they've scrolled.

