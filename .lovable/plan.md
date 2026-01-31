

# Fix Model Backgrounds + Add Redhead Models

## Problems Identified
1. **Inconsistent backgrounds** - Models have varying background colors (some gray, some darker, some with different lighting)
2. **Missing redhead representation** - No ginger/red hair models in the library

## Solution

### Part 1: Regenerate All 32 Models with Consistent Bright Background
Regenerate all existing model portraits with the same prompt structure ensuring:
- **Consistent light gray/white gradient background**
- Same studio lighting setup across all images
- Uniform framing (shoulders and face visible)

### Part 2: Add 2 Redhead Models
| Name | Gender | Body Type | Ethnicity | Age | Description |
|------|--------|-----------|-----------|-----|-------------|
| **Sienna** | Female | Average | European (Irish) | Young Adult | Natural ginger hair, fair skin with freckles |
| **Rowan** | Male | Athletic | European (Scottish) | Adult | Auburn/copper hair, warm complexion |

## Technical Implementation

### Step 1: Regenerate existing 32 model images
Using consistent prompt template:
```
Professional fashion model portrait. [Name], [gender], [ethnicity], [age], [body type].
BRIGHT LIGHT GRAY GRADIENT BACKGROUND. Soft diffused studio lighting.
Shoulders and face visible. Natural confident expression. Ultra realistic skin 
texture with natural pores. Shot on Canon EOS R5, 85mm f/1.4.
```

### Step 2: Generate 2 new redhead model images
```
src/assets/models/
├── model-female-average-irish.jpg    (Sienna - redhead)
└── model-male-athletic-scottish.jpg  (Rowan - redhead)
```

### Step 3: Update mockData.ts
- Add 2 new model profile entries
- Add imports for new redhead images

## Files to Modify
- `src/assets/models/*.jpg` - Regenerate all 32 existing images
- `src/assets/models/model-female-average-irish.jpg` - New file
- `src/assets/models/model-male-athletic-scottish.jpg` - New file
- `src/data/mockData.ts` - Add 2 new model entries + imports

## Result
- **34 total models** (20 female + 14 male)
- All with consistent bright light gray backgrounds
- Redhead representation added
- Professional, uniform visual style

