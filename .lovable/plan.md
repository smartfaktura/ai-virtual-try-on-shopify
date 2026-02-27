

## Improve Interior/Exterior Staging with Room-Specific Furniture Presets

### The Problem
The AI doesn't know what specific furniture belongs in each room. It guesses based on the room type name, which leads to mistakes like placing a double bed in a small guest room that should have a sofa bed, or missing a kitchen island in a living room that has one.

### Solution: Optional "Key Pieces" Selector Per Room Type

Add a new optional UI section called **"Key Furniture & Features"** that appears after Room Type selection. Each room type gets its own curated list of furniture items the user can toggle on/off. These selections are passed to the AI prompt as explicit instructions.

### How It Works

1. User selects "Kids Room (Boy)" as room type
2. A chip/tag selector appears with room-appropriate items: `Single Bed`, `Bunk Bed`, `Study Desk`, `Bookshelf`, `Toy Storage`, `Bean Bag`, `Wall Shelves`
3. User picks: `Single Bed`, `Study Desk`, `Bookshelf`
4. The AI prompt receives: "This room MUST contain: a single bed, a study desk, a bookshelf. Do NOT add furniture types not listed here."

This prevents the AI from guessing and adding wrong furniture.

### Room-Specific Preset Lists

| Room Type | Available Pieces |
|-----------|-----------------|
| Living Room | Sofa, Sectional, Coffee Table, TV Console, Bookshelf, Side Table, Kitchen Island, Bar Cart, Floor Lamp, Area Rug |
| Bedroom (Master) | King Bed, Queen Bed, Nightstands, Dresser, Vanity, Armchair, Floor Mirror |
| Bedroom (Guest) | Double Bed, Single Bed, Sofa Bed, Nightstand, Small Desk, Armchair |
| Kids Room (Boy/Girl) | Single Bed, Bunk Bed, Loft Bed, Study Desk, Bookshelf, Toy Storage, Bean Bag, Wall Shelves |
| Kids Room (Twins) | Twin Beds, Bunk Bed, Shared Desk, Individual Nightstands, Toy Storage |
| Baby Nursery | Crib, Changing Table, Rocking Chair, Dresser, Wall Shelves, Storage Baskets |
| Kitchen | Kitchen Island, Bar Stools, Dining Nook, Open Shelving, Pendant Lights |
| Dining Room | Dining Table (4-seat), Dining Table (6-seat), Sideboard, Display Cabinet, Chandelier |
| Home Office | Desk, Ergonomic Chair, Bookshelf, Filing Cabinet, Monitor Stand, Floor Lamp |
| Bathroom | Vanity, Freestanding Tub, Shower, Storage Cabinet, Mirror, Towel Rack |
| Exterior types | Lounge Chairs, Dining Set, Planters, Fire Pit, Pergola, Outdoor Rug |

### UI Design

- Appears as a collapsible section titled **"Key Furniture & Features"** with subtitle "(optional - helps the AI pick the right pieces)"
- Uses toggle chips/badges (similar to existing `NegativesChipSelector` pattern)
- Multi-select: user picks any combination
- Empty selection = AI decides (current behavior, no regression)
- Only shows for the selected room type

### Files to Change

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Add `interiorKeyPieces` state (string array), add `ROOM_FURNITURE_PRESETS` map, render chip selector UI after Room Type, pass `key_pieces` in payload |
| `supabase/functions/generate-workflow/index.ts` | Read `key_pieces` from product payload, inject explicit furniture list into prompt when provided |

### Prompt Injection (Backend)

When `key_pieces` is provided and non-empty:
```
REQUIRED FURNITURE (CRITICAL): This room MUST contain EXACTLY these pieces: [list].
Do NOT add major furniture items beyond this list. Minor decor accessories (pillows, plants, small lamps) are allowed, but no additional large furniture.
```

When empty (no selection): current behavior, no change.

### Technical Details

- New state: `const [interiorKeyPieces, setInteriorKeyPieces] = useState<string[]>([])`
- Reset key pieces when room type changes via `useEffect`
- Pass as `key_pieces: isInteriorDesign ? interiorKeyPieces : undefined` in the generation payload
- Backend reads `key_pieces` array from product object and builds a constraint block
- The constraint block is injected AFTER the room context block and BEFORE the furniture realism block for correct priority

