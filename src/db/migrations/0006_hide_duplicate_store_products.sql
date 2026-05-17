-- Hide SuperAdmin duplicate Qustodio rows; keep only QStudio on the home store
UPDATE products SET is_active = 0
WHERE route = 'product-detail'
   OR (LOWER(slug) LIKE '%qustodio%' AND LOWER(slug) != 'qstudio')
   OR (LOWER(slug) != 'qstudio' AND LOWER(slug) != 'coming-soon' AND COALESCE(route, '') NOT IN ('qstudio-app', 'coming-soon'));
