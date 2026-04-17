UPDATE public.workflows SET description = CASE name
  WHEN 'Product Visuals' THEN 'Brand-ready product shots across 1000+ studio and editorial scenes — fully art-directed.'
  WHEN 'Virtual Try-On Set' THEN 'Put your clothing on diverse AI models in any pose or setting.'
  WHEN 'Product Listing Set' THEN 'Clean, consistent product shots ready for any storefront or marketplace.'
  WHEN 'Selfie / UGC Set' THEN 'Authentic creator-style content pairing your product with a real-feeling model.'
  WHEN 'Flat Lay Set' THEN 'Styled overhead arrangements with curated props — built for Instagram and editorial.'
  WHEN 'Mirror Selfie Set' THEN 'Authentic mirror selfies of your product, worn or held in real-feeling rooms.'
  WHEN 'Interior / Exterior Staging' THEN 'Stage empty rooms or boost curb appeal — original architecture stays intact.'
  WHEN 'Picture Perspectives' THEN 'Turn one product photo into close-ups, back, side, and wide-angle shots.'
  WHEN 'Image Upscaling' THEN 'Sharpen any image to 2K or 4K — recovers textures, faces, and fine detail.'
  WHEN 'Catalog Studio' THEN 'Bulk-generate catalog-ready visuals for any product, in one run.'
  ELSE description
END
WHERE name IN ('Product Visuals','Virtual Try-On Set','Product Listing Set','Selfie / UGC Set','Flat Lay Set','Mirror Selfie Set','Interior / Exterior Staging','Picture Perspectives','Image Upscaling','Catalog Studio');