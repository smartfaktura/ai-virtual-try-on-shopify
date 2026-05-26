
INSERT INTO public.workflows (slug, name, description, sort_order, is_system)
VALUES (
  'product-swap',
  'Product Swap',
  'Keep the exact scene and swap in any product from your library.',
  14,
  true
)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order;
