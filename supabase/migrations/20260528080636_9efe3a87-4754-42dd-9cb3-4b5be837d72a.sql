-- Strip the outdated "Critical device lock:" paragraph from phone-case scene
-- templates. The new PHONE CASE FIDELITY block (built in generate-workflow
-- and productImagePromptBuilder) replaces it with reference-first wording
-- that does not assume a specific phone model.
UPDATE public.product_image_scenes
SET prompt_template = regexp_replace(
      prompt_template,
      E'\\n*Critical device lock:[\\s\\S]*?(?=\\n\\nCreate |\\n\\nThe |\\n\\nShow |\\n\\nFrame |\\n\\nCompose |$)',
      E'\\n\\n',
      'g'
    ),
    updated_at = now()
WHERE category_collection = 'phone-cases'
  AND prompt_template ILIKE '%Critical device lock%';