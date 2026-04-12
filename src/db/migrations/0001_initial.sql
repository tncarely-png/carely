-- Carely.tn D1 Schema Migration
-- Generated manually for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text,
  `phone` text NOT NULL,
  `address` text,
  `wilaya` text,
  `password` text,
  `firebase_uid` text,
  `role` text NOT NULL DEFAULT 'customer',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_phone_unique` ON `users` (`phone`);
CREATE UNIQUE INDEX IF NOT EXISTS `users_firebase_uid_unique` ON `users` (`firebase_uid`);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `plan` text NOT NULL DEFAULT 'silver',
  `status` text NOT NULL DEFAULT 'pending',
  `qustodio_email` text,
  `qustodio_password` text,
  `activation_code` text,
  `devices_count` integer DEFAULT 5,
  `starts_at` text,
  `expires_at` text,
  `auto_renew` integer DEFAULT 0,
  `notes` text,
  `license_id` text REFERENCES `licenses`(`id`),
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`),
  `subscription_id` text REFERENCES `subscriptions`(`id`),
  `plan` text NOT NULL DEFAULT 'silver',
  `amount_tnd` real NOT NULL DEFAULT 0,
  `payment_method` text DEFAULT 'flouci',
  `payment_ref` text,
  `receipt_url` text,
  `status` text NOT NULL DEFAULT 'pending',
  `paid_at` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- Licenses table (must be created before subscriptions due to FK)
CREATE TABLE IF NOT EXISTS `licenses` (
  `id` text PRIMARY KEY NOT NULL,
  `qustodio_email` text NOT NULL,
  `qustodio_password` text NOT NULL,
  `plan` text NOT NULL DEFAULT 'silver',
  `is_assigned` integer DEFAULT 0,
  `assigned_to_user` text REFERENCES `users`(`id`),
  `assigned_at` text,
  `expires_at` text,
  `purchased_from` text,
  `notes` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `licenses_qustodio_email_unique` ON `licenses` (`qustodio_email`);

-- WhatsApp agents table
CREATE TABLE IF NOT EXISTS `whatsapp_agents` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `phone` text NOT NULL,
  `gender` text,
  `is_active` integer DEFAULT 0,
  `title` text,
  `emoji` text
);

-- Settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `key` text PRIMARY KEY NOT NULL,
  `value` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- Seed WhatsApp agents
INSERT OR IGNORE INTO `whatsapp_agents` (`id`, `name`, `phone`, `gender`, `is_active`, `title`, `emoji`)
VALUES
  ('agent-1', 'Maram', '+21652013035', 'female', 1, 'الوكيلة الأولى', '👩'),
  ('agent-2', 'Chafik', '+21650496159', 'male', 0, 'الوكيل الثاني', '👨');
