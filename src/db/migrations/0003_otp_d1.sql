-- Email OTP + rate limit on D1 (works when Workers/Pages omit KV binding)

CREATE TABLE IF NOT EXISTS otp_send_rate_limit (
  rate_key TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_challenge (
  id TEXT PRIMARY KEY NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS otp_register_pending (
  email_norm TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL
);
