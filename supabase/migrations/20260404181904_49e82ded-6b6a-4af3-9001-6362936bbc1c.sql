INSERT INTO workflows (slug, name, description, is_system, sort_order, required_inputs, recommended_ratios, default_image_count, uses_tryon, generation_config)
VALUES (
  'product-images',
  'Product Images',
  'Generate product images across multiple scene types with full control over styling, lighting, and composition.',
  true,
  100,
  ARRAY['product'],
  ARRAY['1:1', '4:5', '3:4', '16:9', '9:16'],
  1,
  false,
  '{
    "prompt_template": "Professional product photography. Render the EXACT product from [PRODUCT IMAGE] into the described scene with photorealistic lighting, shadows, reflections, and perspective. Preserve all packaging text, labels, branding, colors, and materials with 100% accuracy. Ultra high resolution.",
    "system_instructions": "You are a professional product photographer creating premium e-commerce and editorial imagery.",
    "fixed_settings": {
      "quality": "high",
      "composition_rules": "Product must be the clear hero of the composition. Maintain realistic scale and proportions."
    },
    "variation_strategy": {
      "type": "scene",
      "variations": []
    },
    "ui_config": {},
    "negative_prompt_additions": "No watermarks, no text overlays, no chromatic aberration, no warped product edges, no duplicated products."
  }'::jsonb
)
ON CONFLICT DO NOTHING;