
UPDATE product_image_scenes
SET prompt_template = regexp_replace(
  prompt_template,
  'Shot with',
  E'CRITICAL — NO LOGOS OR SCREENS: Any monitors, laptops, or screens in the scene must be turned OFF showing a solid black screen. No brand logos, text, or icons may appear on any device, furniture label, or surface anywhere in the image. All technology must be generic and unbranded.\n\nShot with'
)
WHERE scene_id IN (
  'furniture-lifestyle-concrete-architect-office',
  'furniture-lifestyle-natural-oak-study',
  'furniture-lifestyle-travertine-executive-office',
  'furniture-lifestyle-clean-white-home-office',
  'furniture-lifestyle-dark-walnut-library-office',
  'furniture-lifestyle-greige-wellness-office'
);
