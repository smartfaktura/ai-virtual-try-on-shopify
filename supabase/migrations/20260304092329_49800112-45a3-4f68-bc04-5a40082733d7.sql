
-- Clear preview_url for Hair Salon (index 13), Entryway Console (index 17), Hotel Lobby Boutique (index 29)
UPDATE workflows
SET generation_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      generation_config,
      '{variation_strategy,variations,13,preview_url}',
      'null'::jsonb
    ),
    '{variation_strategy,variations,17,preview_url}',
    'null'::jsonb
  ),
  '{variation_strategy,variations,29,preview_url}',
  'null'::jsonb
)
WHERE id = '7a203c7e-0367-4fc3-8eb2-2e4d181fa158';
