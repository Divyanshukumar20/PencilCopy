-- Run in your project's PostgreSQL database (psql -f schema.sql)
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY,
 username TEXT NOT NULL UNIQUE,
 hashedpassword TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS refreshtokens (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token TEXT NOT NULL UNIQUE,
 expiry TIMESTAMPTZ NOT NULL
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 100 CHECK (coins >= 0);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
CREATE TABLE IF NOT EXISTS chapters (
 id BIGSERIAL PRIMARY KEY,
 slug TEXT UNIQUE NOT NULL,
 title TEXT NOT NULL,
 subject TEXT NOT NULL,
 coin_cost INTEGER NOT NULL CHECK (coin_cost >= 0)
);
CREATE TABLE IF NOT EXISTS chapter_unlocks (
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
 unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY (user_id, chapter_id)
);
CREATE TABLE IF NOT EXISTS coin_transactions (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 delta INTEGER NOT NULL,
 reason TEXT NOT NULL,
 chapter_id BIGINT REFERENCES chapters(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO chapters(slug,title,subject,coin_cost) VALUES
 ('cn','Complex Numbers','Mathematics',50),
 ('r','Rotational Motion','Physics',75),
 ('as','Atomic Structure','Chemistry',60)
ON CONFLICT(slug) DO NOTHING;
-- Existing users get 100 demo coins via DEFAULT; new users too.
-- Starter coins are for local MVP testing only; paid coin purchase is NOT enabled.
