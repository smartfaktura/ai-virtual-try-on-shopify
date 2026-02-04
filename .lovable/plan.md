
# Dashboard Design Fixes

## Problem Summary
The metric cards have inconsistent heights and styling because some have trends, some have suffixes, and some have neither. This creates visual imbalance.

## Solution

### 1. Standardize Metric Cards
Give all 4 cards consistent structure:

| Card | Current | Fix |
|------|---------|-----|
| Images Generated | trend ✓, suffix ✓ | Keep as-is |
| Credits Remaining | no trend, no suffix | Add suffix "available" |
| Avg. Generation Time | suffix ✓, no trend | Add trend (e.g., -8% faster) |
| Publish Rate | trend ✓, no suffix | Add suffix "of generated" |

### 2. Remove Duplicate Credit Badge
Remove `<Badge tone="info">847 credits</Badge>` from Quick Generate card since credits are already visible in sidebar indicator.

### 3. Add Usage Chart Section (Optional Enhancement)
Add a simple usage visualization between metrics and Quick Generate:

```text
┌─────────────────────────────────────────────────────┐
│  Usage This Month                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░  78% of quota │
│  234 / 300 images generated                        │
└─────────────────────────────────────────────────────┘
```

### 4. Improve Quick Generate Card
- Remove redundant credits badge
- Add "New to AI Generation?" tip for first-time users (conditional)

## Files to Modify

1. **src/pages/Dashboard.tsx**
   - Update MetricCard props to include suffix/trend for all cards
   - Remove Badge from Quick Generate card
   - Optionally add usage progress section

2. **src/data/mockData.ts** (minor)
   - Add `avgGenerationTimeTrend` metric if needed

## Implementation Details

### Updated Metrics Section
```tsx
<MetricCard
  title="Images Generated"
  value={mockMetrics.imagesGenerated30d}
  suffix="last 30 days"
  icon={ImageIcon}
  trend={{ value: 12, direction: 'up' }}
/>
<MetricCard
  title="Credits Remaining"
  value={balance}
  suffix="available"
  icon={WalletIcon}
  onClick={openBuyModal}
/>
<MetricCard
  title="Avg. Generation Time"
  value={mockMetrics.avgGenerationTime}
  suffix="seconds"
  icon={ClockIcon}
  trend={{ value: 8, direction: 'down' }}  // faster is better
/>
<MetricCard
  title="Publish Rate"
  value={`${mockMetrics.publishRate}%`}
  suffix="of generated"
  icon={CheckCircleIcon}
  trend={{ value: 5, direction: 'up' }}
/>
```

### Simplified Quick Generate Card
```tsx
<Card>
  <BlockStack gap="400">
    <Text as="h2" variant="headingMd">
      Quick Generate
    </Text>
    <Text as="p" variant="bodyMd" tone="subdued">
      Generate professional product images in seconds. 
      Select a product and we'll recommend the best photography styles.
    </Text>
    <InlineStack gap="300" wrap>
      <Button variant="primary" size="large" onClick={() => navigate('/generate')}>
        Select Product to Generate
      </Button>
      <Button size="large" onClick={() => navigate('/templates')} variant="plain">
        Explore Templates
      </Button>
    </InlineStack>
  </BlockStack>
</Card>
```

## Visual Result
All four metric cards will have:
- Same title positioning
- Same value display area
- Consistent suffix line
- Consistent trend line (equal card heights)
