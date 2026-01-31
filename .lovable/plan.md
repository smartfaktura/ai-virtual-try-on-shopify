
# Add More Poses & Scenes - Expand Library to 24 Poses

## Current State
10 existing poses preserved across 4 categories.

## New Poses to Add (14 new)

### Studio Category (+3 = 6 total)
| Pose Name | Description |
|-----------|-------------|
| **Studio Back View** | Elegant back pose showing garment rear details, shoulders angled |
| **Studio Close-Up** | Torso-focused crop highlighting fabric texture and fit |
| **Studio Crossed Arms** | Confident pose with crossed arms, direct eye contact |

### Lifestyle Category (+4 = 7 total)
| Pose Name | Description |
|-----------|-------------|
| **Coffee Shop Casual** | Relaxed pose at cafe table with natural morning light |
| **Beach Sunset** | Coastal lifestyle scene with golden sunset backdrop |
| **Park Bench** | Casual outdoor pose on wooden park bench with greenery |
| **Rooftop City** | Urban rooftop with city skyline in background at dusk |

### Editorial Category (+4 = 6 total)
| Pose Name | Description |
|-----------|-------------|
| **Editorial Window** | Silhouette against floor-to-ceiling window with natural light |
| **Editorial Moody** | Low-key studio lighting with single dramatic side light |
| **Editorial Artistic** | High-fashion pose with abstract geometric backdrop |
| **Editorial Movement** | Dynamic motion blur effect with flowing hair/fabric |

### Streetwear Category (+3 = 5 total)
| Pose Name | Description |
|-----------|-------------|
| **Street Basketball Court** | Urban playground with chain-link fence backdrop |
| **Street Underpass** | Industrial tunnel with dramatic overhead lighting |
| **Street Night Neon** | Night scene with neon signs and urban glow |

## Implementation Steps

### Step 1: Generate 14 New Pose Images
Create high-quality scene/pose reference images using AI image generation:
- Bright, clear compositions
- Professional fashion photography style
- Consistent quality with existing poses

### Step 2: Save Image Assets
```text
src/assets/poses/
├── [KEEP] pose-studio-front.jpg
├── [KEEP] pose-studio-profile.jpg
├── [KEEP] pose-studio-movement.jpg
├── [KEEP] pose-lifestyle-walking.jpg
├── [KEEP] pose-lifestyle-seated.jpg
├── [KEEP] pose-lifestyle-garden.jpg
├── [KEEP] pose-editorial-dramatic.jpg
├── [KEEP] pose-editorial-minimal.jpg
├── [KEEP] pose-streetwear-urban.jpg
├── [KEEP] pose-streetwear-stairs.jpg
├── [NEW] pose-studio-back.jpg
├── [NEW] pose-studio-closeup.jpg
├── [NEW] pose-studio-arms.jpg
├── [NEW] pose-lifestyle-coffee.jpg
├── [NEW] pose-lifestyle-beach.jpg
├── [NEW] pose-lifestyle-park.jpg
├── [NEW] pose-lifestyle-rooftop.jpg
├── [NEW] pose-editorial-window.jpg
├── [NEW] pose-editorial-moody.jpg
├── [NEW] pose-editorial-artistic.jpg
├── [NEW] pose-editorial-motion.jpg
├── [NEW] pose-streetwear-basketball.jpg
├── [NEW] pose-streetwear-underpass.jpg
├── [NEW] pose-streetwear-neon.jpg
```

### Step 3: Update mockData.ts
- Add 14 new image imports
- Add 14 new TryOnPose entries to mockTryOnPoses array
- Preserve all 10 existing poses

## AI Image Generation Approach
Each pose preview will show:
- Female model in neutral clothing (simple tank top/jeans)
- The specific scene/setting/lighting
- Full body or 3/4 shot depending on pose type
- Professional fashion photography quality

## Technical Details

**Files to modify:**
- `src/data/mockData.ts` - Add 14 new pose entries with imports

**Files to create:**
- 14 new pose image files in `src/assets/poses/`

## Result
- **24 total poses** (up from 10)
- **6 Studio** | **7 Lifestyle** | **6 Editorial** | **5 Streetwear**
- Much richer variety for users
- All existing poses preserved
