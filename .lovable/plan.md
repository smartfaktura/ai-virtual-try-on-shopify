
## Add seating capacity field for sofas

Single change in `src/lib/productSpecFields.ts` — add `seatingCapacity` to the `furniture::furnitureType::Sofa` conditional fields (~line 250-254):

```typescript
'furniture::furnitureType::Sofa': [
  { key: 'sofaShape', label: 'Shape', type: 'select', options: ['Straight', 'L-shaped', 'U-shaped', 'Curved', 'Sectional'] },
  { key: 'seatingCapacity', label: 'Seating', type: 'select', options: ['2-seater', '3-seater', '4-seater', '5+ seater / Sectional'] },
  { key: 'seatHeight', label: 'Seat Height', type: 'input', placeholder: '45', placeholderImperial: '18', unit: 'cm' },
  { key: 'seatDepth', label: 'Seat Depth', type: 'input', placeholder: '55', placeholderImperial: '22', unit: 'cm' },
],
```

No prompt builder changes — the existing `{{specification}}` token will automatically serialize "Seating: 3-seater" into the dimensions string, which the AI can interpret directly.
