import {
    pgTable,
    uuid,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    refreshToken: text('refresh_token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
})
