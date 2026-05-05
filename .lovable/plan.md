## Overview

Add **type-aware conditional fields** to product spec categories where different sub-types need different dimension inputs. The current system shows identical fields regardless of what sub-type is selected (e.g. a Sofa and a Shelf show the same Width/Depth/Height/Seat Height).

## Changes

### 1. Furniture — type-specific fields

Current: Same 5 fields for all furniture types.
New: The `furnitureType` select drives which fields appear:

| Type | Fields |
|------|--------|
| Sofa | Shape (Straight/L-shaped/U-shaped/Curved/Sectional), Width, Depth, Height, Seat Height |
| Armchair | Width, Depth, Height, Seat Height |
| Chair / Stool / Bench | Width, Depth, Height, Seat Height |
| Coffee Table / Side Table | Width (or Diameter), Depth, Height |
| Dining Table / Desk | Width, Depth, Height |
| Bed | Size (Single/Double/Queen/King/Super King), Length, Width, Headboard Height |
| Shelf / Cabinet | Width, Height, Depth, Shelves (count) |
| Other | Width, Depth, Height |

### 2. Bags — type-specific fields

Add a `bagType` dropdown to `bags-accessories`:
- Tote / Shoulder / Crossbody / Clutch / Duffel / Briefcase / Other
- Clutch: Width, Height (no Depth — it's flat)
- Duffel: Length, Diameter
- Default: Width, Height, Depth + Strap Drop

### 3. Caps / Hats / Beanies — style-specific fields

Add a `style` dropdown:
- **Caps**: Baseball, Snapback, Trucker, Dad hat, 5-panel, Visor
- **Hats**: Fedora, Panama, Bucket, Wide brim, Cowboy, Boater
- **Beanies**: Cuffed, Slouchy, Fisherman, Pom-pom

All keep Circumference; Hats add Brim Width; Caps add Brim Length.

### 4. Watches — more detail

Add: Case Thickness, Band Width, Band Material (Leather/Metal/Silicone/Fabric/Rubber).

### 5. Tech — type-specific

Add `deviceType`: Phone, Laptop, Headphones, Speaker, Tablet, Earbuds, Smartwatch, Other
- Phone/Tablet: Height, Width, Thickness, Screen Size
- Laptop: Screen Size, Width, Depth, Thickness
- Headphones: Over-ear/On-ear/In-ear style
- Speaker: Width, Height, Depth

### Technical approach

**`productSpecFields.ts`**: Introduce a new concept — `conditionalFields` keyed by the value of a parent `select` field. The `getCategoryFields()` function gains an optional second parameter for current field values, and returns the right subset.

**`ProductSpecsCard.tsx`**: When a `select` field with conditional children changes, the rendered field list updates dynamically. Already-filled values for hidden fields are preserved (not cleared) so switching back restores them.

No database changes needed — this is purely a UI/prompt improvement.
