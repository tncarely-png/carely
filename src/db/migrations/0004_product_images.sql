-- Set QStudio card image on existing production rows
UPDATE products
SET image_url = '/products/qstudio-gold.png',
    updated_at = datetime('now')
WHERE slug IN ('qstudio', 'qustodio')
  AND (image_url IS NULL OR image_url = '');
