
UPDATE public.workflows
SET generation_config = '{
  "prompt_template": "Create an authentic selfie-style photograph shot FROM the smartphone front-facing camera. The camera IS the phone — the viewer sees exactly what the iPhone front camera captures. The subject is looking DIRECTLY into the camera lens.\n\nThe subject must be naturally holding or showcasing the EXACT product from [PRODUCT IMAGE]. Product held near the face or chest, relaxed grip, casually integrated into the selfie frame — as if showing it to a friend on a video call.\n\n[MODEL IMAGE] is the reference for the person in the photo. The generated person MUST have the EXACT same face, skin tone, hair color, hair texture, hair length, facial structure, eye color, and distinguishing features as [MODEL IMAGE]. This is an identity-preservation requirement — the person in the output must be unmistakably the same individual.\n\nCAMERA: Shot on iPhone front camera in standard photo mode (NOT Portrait Mode). Deep depth of field — background is sharp and in focus. Slight wide-angle distortion typical of a smartphone selfie lens. 26mm equivalent focal length.\n\nCOLOR SCIENCE: Apple iPhone computational photography. True-to-life, neutral color reproduction. No cinematic color grading. Whites are pure neutral white. Smart HDR dynamic range.\n\nTEXTURE: Ultra-sharp across the entire frame. Natural skin texture with pores and subtle imperfections visible. No heavy retouching, no frequency separation, no airbrushed skin. Detail comparable to a 48MP smartphone sensor.\n\nOVERALL FEEL: Looks like someone with a latest-gen iPhone took this and posted it directly — no Lightroom, no Photoshop. Impressive but clearly a phone photo.",
  "system_instructions": "You are an influencer content photographer specializing in authentic smartphone selfie aesthetics. Every image must look like a real person took it with their iPhone front camera. The phone is NEVER visible because it IS the camera. One hand is always occupied holding the phone. Candid, genuine expressions only. Natural ambient lighting — no studio setups. Slight imperfections in framing make it feel real. The person in the generated image MUST match the reference model image exactly — same face, same features, same identity.",
  "fixed_settings": {
    "aspect_ratios": ["4:5", "9:16"],
    "quality": "standard",
    "composition_rules": "Front-camera POV. Subject looking directly into the lens. One arm holding the phone (the camera) — partially visible at frame edge but phone itself NEVER shown. Subject full head and hair visible with natural headroom. Frame from mid-chest upward. Face in upper-third following rule of thirds. Slight wide-angle smartphone distortion. Deep depth of field — everything sharp."
  },
  "variation_strategy": {
    "type": "scene",
    "variations": [
      {
        "label": "Mirror Selfie",
        "instruction": "Person taking a mirror selfie holding the product up near their face. Bathroom or bedroom mirror visible. Casual outfit, relaxed pose. Mirror reflection shows the phone in their hand. Warm indoor ambient lighting. Tiles or bedroom decor visible in background.",
        "aspect_ratio": "4:5"
      },
      {
        "label": "Golden Hour Selfie",
        "instruction": "Outdoor selfie during golden hour. Warm, honey-toned sunlight hitting the face from the side. Product held up casually near the face. Background is a park, rooftop terrace, or quiet street bathed in golden light. Lens flares acceptable. Relaxed, glowing expression.",
        "aspect_ratio": "4:5"
      },
      {
        "label": "Coffee Shop Selfie",
        "instruction": "Sitting at a cafe table, product on the table or held up toward the camera. Cozy background with warm cafe lighting, blurred patrons, coffee cup visible on the table. Relaxed, showing my haul energy. Wooden table surface, exposed brick or plants in background.",
        "aspect_ratio": "4:5"
      },
      {
        "label": "Morning Routine",
        "instruction": "Bathroom or vanity setting. Fresh-faced, just-woke-up aesthetic. Product being actively used or just applied. Natural window light streaming in, minimal makeup. Authentic get ready with me vibe. Bathroom counter with other everyday products partially visible.",
        "aspect_ratio": "9:16"
      },
      {
        "label": "Car Selfie",
        "instruction": "Sitting in the driver seat of a car, natural daylight through the windshield. Product held up near face with one hand. Seatbelt visible, dashboard slightly blurred. Casual, on-the-go energy. Sunlight creating natural highlights on the face.",
        "aspect_ratio": "4:5"
      },
      {
        "label": "Unboxing Excitement",
        "instruction": "Hands opening packaging or holding product up excitedly toward the camera. Desk or bed surface visible with packaging materials, tissue paper, and box. Genuine surprised or happy expression. Fresh unboxing energy. Product packaging and branding clearly visible.",
        "aspect_ratio": "4:5"
      },
      {
        "label": "Shelfie / Collection",
        "instruction": "Product displayed on a bathroom shelf or vanity alongside other beauty or lifestyle products. Person partially visible taking a selfie of their collection. Organized, aesthetic shelf arrangement. Clean white or marble shelf surface. Soft ambient bathroom lighting.",
        "aspect_ratio": "9:16"
      },
      {
        "label": "In-Use Close-up",
        "instruction": "Close-up selfie of the product being actively applied or used. Hands visible, product in action on skin or in use. Face partially in frame with natural expression. Demonstrative, tutorial-style UGC angle. Focus on both the product application and the person.",
        "aspect_ratio": "4:5"
      }
    ]
  },
  "ui_config": {
    "skip_template": true,
    "skip_mode": true,
    "show_model_picker": true,
    "show_pose_picker": false
  },
  "negative_prompt_additions": "professional lighting, studio setup, perfect composition, model-like posing, editorial styling, high-fashion, bokeh, shallow depth of field, blurred background, visible phone or smartphone or device in the image, third-person view of someone holding a phone, phone screen, phone case, studio strobes, softbox lighting, airbrushed skin, heavy retouching, plastic skin texture, fashion magazine quality, collage layout, split screen, watermarks, text overlays, stock photo, generic face, different person than reference"
}'::jsonb,
  default_image_count = 8,
  recommended_ratios = ARRAY['4:5', '9:16']
WHERE id = '3b54d43a-a03a-49a6-a64e-bf2dd999abc8';
