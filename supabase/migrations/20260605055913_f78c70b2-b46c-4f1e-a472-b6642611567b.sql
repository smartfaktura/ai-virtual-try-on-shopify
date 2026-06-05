INSERT INTO public.workflows (slug, name, description, default_image_count, required_inputs, recommended_ratios, uses_tryon, template_ids, is_system, sort_order)
VALUES (
  'material-swap',
  'Material Swap',
  'Keep the same product and scene, swap in any upholstery, fabric, or colour.',
  1,
  '{}',
  '{1:1,4:5,3:4,9:16}',
  false,
  '{}',
  true,
  16
)
ON CONFLICT (slug) DO NOTHING;