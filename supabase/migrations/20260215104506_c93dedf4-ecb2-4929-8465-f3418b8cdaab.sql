
-- Update Flat Lay Set workflow: change strategy type to 'scene' and expand to 12 surface variations with categories
UPDATE public.workflows 
SET generation_config = jsonb_set(
  generation_config,
  '{variation_strategy}',
  '{
    "type": "scene",
    "variations": [
      {
        "label": "Marble Luxe",
        "instruction": "White or gray marble surface. Product arranged with gold accents, fresh flowers, and premium accessories. Luxury, aspirational mood.",
        "aspect_ratio": "1:1",
        "category": "Classic"
      },
      {
        "label": "Natural Wood",
        "instruction": "Warm wooden surface (oak or walnut). Product with natural elements — dried botanicals, linen textile, ceramic dish. Organic, earthy mood.",
        "aspect_ratio": "1:1",
        "category": "Natural"
      },
      {
        "label": "Linen Minimal",
        "instruction": "Crumpled white or cream linen fabric as surface. Product with minimal props — just 1-2 items. Ultra-clean, minimalist editorial.",
        "aspect_ratio": "1:1",
        "category": "Classic"
      },
      {
        "label": "Color Pop",
        "instruction": "Bold colored surface (terracotta, sage green, or dusty blue). Product with contrasting accent props. Vibrant, editorial flat lay.",
        "aspect_ratio": "1:1",
        "category": "Bold"
      },
      {
        "label": "Concrete Industrial",
        "instruction": "Raw concrete or cement surface with subtle texture. Product arranged with metallic accents, geometric objects. Urban, industrial mood.",
        "aspect_ratio": "1:1",
        "category": "Textured"
      },
      {
        "label": "Terrazzo",
        "instruction": "Speckled terrazzo stone surface in white with colorful chips. Product with modern minimal props. Playful yet sophisticated.",
        "aspect_ratio": "1:1",
        "category": "Classic"
      },
      {
        "label": "Pastel Paper",
        "instruction": "Layered pastel colored paper sheets (blush, lavender, mint) as surface. Product with delicate props — dried flowers, ribbon. Soft, feminine editorial.",
        "aspect_ratio": "1:1",
        "category": "Bold"
      },
      {
        "label": "Dark Moody",
        "instruction": "Deep black or charcoal matte surface. Product with dramatic directional lighting, dark shadow play. Moody, luxurious noir aesthetic.",
        "aspect_ratio": "1:1",
        "category": "Bold"
      },
      {
        "label": "Rattan & Wicker",
        "instruction": "Woven rattan or wicker tray/surface. Product with tropical leaves, dried palms. Bohemian, resort aesthetic.",
        "aspect_ratio": "1:1",
        "category": "Natural"
      },
      {
        "label": "Moroccan Tile",
        "instruction": "Decorative Moroccan or Mediterranean patterned tile surface. Product with brass accents, small ceramics. Artisan, globally-inspired mood.",
        "aspect_ratio": "1:1",
        "category": "Textured"
      },
      {
        "label": "Leather",
        "instruction": "Rich brown or tan leather surface with visible grain texture. Product with brass hardware, vintage-inspired props. Heritage, premium craft mood.",
        "aspect_ratio": "1:1",
        "category": "Textured"
      },
      {
        "label": "Brushed Metal",
        "instruction": "Brushed stainless steel or copper metallic surface. Product with reflective highlights, modern tech-inspired props. Sleek, futuristic editorial.",
        "aspect_ratio": "1:1",
        "category": "Bold"
      }
    ]
  }'::jsonb
)
WHERE id = '24effc2d-32f2-4f04-86d4-96dafab30c73';
