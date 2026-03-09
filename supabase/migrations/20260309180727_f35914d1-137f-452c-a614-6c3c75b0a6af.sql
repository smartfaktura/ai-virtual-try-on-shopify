-- Remove duplicate discover_presets, keeping the one with the lowest sort_order for each title
DELETE FROM discover_presets
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY sort_order ASC) as rn
    FROM discover_presets
    WHERE title IN ('Midnight Leather Jacket Editorial','Summer Linen Dress Collection','Precision Timepiece Campaign','Athleisure in Motion')
  ) sub WHERE rn > 1
);