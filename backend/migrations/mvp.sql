ALTER TABLE users ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 1200;
CREATE TABLE IF NOT EXISTS problems (
 id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL UNIQUE, subject TEXT NOT NULL,
 topic TEXT NOT NULL, difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy','Medium','Hard')),
 prompt TEXT NOT NULL, options JSONB NOT NULL, answer INTEGER NOT NULL CHECK(answer BETWEEN 0 AND 3),
 explanation TEXT NOT NULL, published BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS submissions (
 id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 problem_id BIGINT NOT NULL REFERENCES problems(id),answer INTEGER NOT NULL CHECK(answer BETWEEN 0 AND 3),
 correct BOOLEAN NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS assessments (
 id BIGSERIAL PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('mock','contest')),
 duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 1 AND 180),
 starts_at TIMESTAMPTZ,ends_at TIMESTAMPTZ,questions JSONB NOT NULL,published BOOLEAN NOT NULL DEFAULT true,
 finalized BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(kind='mock' OR (starts_at IS NOT NULL AND ends_at > starts_at))
);
CREATE TABLE IF NOT EXISTS attempts (
 id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 assessment_id BIGINT NOT NULL REFERENCES assessments(id),questions JSONB NOT NULL,
 answers JSONB NOT NULL DEFAULT '{}',started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),deadline TIMESTAMPTZ NOT NULL,
 submitted_at TIMESTAMPTZ,score INTEGER,UNIQUE(user_id,assessment_id)
);
CREATE TABLE IF NOT EXISTS rating_history (
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,assessment_id BIGINT NOT NULL REFERENCES assessments(id),
 old_rating INTEGER NOT NULL,new_rating INTEGER NOT NULL,delta INTEGER NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(user_id,assessment_id)
);
CREATE TABLE IF NOT EXISTS payment_orders (
 id TEXT PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id),amount INTEGER NOT NULL CHECK(amount>0),
 coins INTEGER NOT NULL CHECK(coins>0),currency TEXT NOT NULL DEFAULT 'INR',
 payment_id TEXT UNIQUE,status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','paid')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS submissions_user_idx ON submissions(user_id,problem_id);
CREATE INDEX IF NOT EXISTS attempts_assessment_idx ON attempts(assessment_id);
