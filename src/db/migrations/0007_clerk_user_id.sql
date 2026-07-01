-- Link D1 users to Clerk accounts
ALTER TABLE users ADD COLUMN clerk_user_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_user_id_unique ON users(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
