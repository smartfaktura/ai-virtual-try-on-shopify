
-- Delete 6 unused workflows
DELETE FROM workflows WHERE name IN (
  'Social Media Pack',
  'Lifestyle Set',
  'Website Hero Set',
  'Ad Refresh Set',
  'Seasonal Campaign Set',
  'Before & After Set'
);

-- Re-order remaining 4
UPDATE workflows SET sort_order = 1 WHERE name = 'Virtual Try-On Set';
UPDATE workflows SET sort_order = 2 WHERE name = 'Product Listing Set';
UPDATE workflows SET sort_order = 3 WHERE name = 'Selfie / UGC Set';
UPDATE workflows SET sort_order = 4 WHERE name = 'Flat Lay Set';
