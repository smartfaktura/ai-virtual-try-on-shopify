

## Remove Scenes from Freestyle Scene Selector

### Scenes to remove

| Scene | ID | Current category |
|---|---|---|
| Water Splash | `scene_036` | clean-studio |
| Concrete Slab | `scene_006` | surface |
| Overhead Clean | `scene_007` | flat-lay |
| Rustic Kitchen | `scene_009` | kitchen |
| Bright Countertop | `scene_010` | kitchen |
| Café Table | `scene_011` | kitchen |

**Note:** I couldn't find a scene called "Clean Studio Beauty." I'll skip that one — if you can clarify which scene you meant, I can remove it in a follow-up.

For "Kitchen & Dining" — I'll remove all 3 kitchen-category scenes (Rustic Kitchen, Bright Countertop, Café Table) plus the Modern Brunch Table (scene_023).

### Changes

**`src/data/mockData.ts`**
- Remove the 7 entries from the `mockTryOnPoses` array
- Remove any unused image URL constants that were only referenced by these scenes

### Files modified
| File | Change |
|---|---|
| `src/data/mockData.ts` | Remove 7 scene entries and unused image constants |

