INSERT INTO public.workflows (
  name,
  description,
  default_image_count,
  required_inputs,
  recommended_ratios,
  uses_tryon,
  is_system,
  sort_order,
  template_ids,
  generation_config
) VALUES (
  'Product Perspectives',
  'Generate angle and detail variations of an existing product image — close-up, back, sides, and wide shots for a complete visual set.',
  5,
  ARRAY['product_image'],
  ARRAY['1:1', '3:4', '4:5', '9:16'],
  false,
  true,
  15,
  ARRAY[]::text[],
  '{
    "prompt_template": "Professional product photography variation: {variation_instruction}",
    "system_instructions": "Generate a photorealistic product image from the specified angle/perspective. Maintain the exact product identity, materials, colors, and brand details from the source image. The environment, lighting, and mood should remain consistent across all variations.",
    "fixed_settings": {
      "quality": "standard"
    },
    "variation_strategy": {
      "type": "angle",
      "variations": [
        {
          "label": "Close-up / Macro",
          "instruction": "Extreme close-up macro detail shot of the product. Focus on textures, materials, stitching, hardware, or surface details. Shallow depth of field highlighting the most interesting design element. The product should fill most of the frame.",
          "category": "detail",
          "referenceUpload": null
        },
        {
          "label": "Back Angle",
          "instruction": "Rear view of the product showing the back design, construction, and details not visible from the front. Same environment and lighting as the front view. Show the complete back of the product.",
          "category": "angle",
          "referenceUpload": {
            "prompt": "Upload a back view of your product for best results (optional)",
            "recommended": true
          }
        },
        {
          "label": "Left Side",
          "instruction": "Left side profile view of the product at a 90-degree angle. Show the product from the left side, revealing its depth, side construction, and profile shape. Same environment and lighting.",
          "category": "angle",
          "referenceUpload": {
            "prompt": "Upload a left side view for better accuracy (optional)",
            "recommended": false
          }
        },
        {
          "label": "Right Side",
          "instruction": "Right side profile view of the product at a 90-degree angle. Show the product from the right side, revealing its depth, side construction, and profile shape. Same environment and lighting.",
          "category": "angle",
          "referenceUpload": {
            "prompt": "Upload a right side view for better accuracy (optional)",
            "recommended": false
          }
        },
        {
          "label": "Wide / Environment",
          "instruction": "Pulled-back contextual shot showing the product in its full environment with generous negative space. The product is smaller in frame but clearly the hero subject. Show the surrounding context, atmosphere, and setting. Lifestyle or editorial feel.",
          "category": "context",
          "referenceUpload": null
        }
      ]
    },
    "ui_config": {
      "skip_template": true,
      "skip_mode": true,
      "show_model_picker": false,
      "show_pose_picker": false,
      "show_scene_picker": false
    }
  }'::jsonb
);