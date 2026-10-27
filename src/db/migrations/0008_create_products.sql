-- Create the products table used by the storefront and product API.
CREATE TABLE IF NOT EXISTS `products` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `name_ar` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `description_ar` text,
  `emoji` text DEFAULT '📦',
  `image_url` text,
  `price` real NOT NULL DEFAULT 0,
  `currency` text DEFAULT 'TND',
  `price_label` text,
  `features` text,
  `landing_sections` text,
  `is_active` integer DEFAULT 1,
  `sort_order` integer DEFAULT 0,
  `route` text,
  `external_url` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `products_slug_unique` ON `products` (`slug`);
