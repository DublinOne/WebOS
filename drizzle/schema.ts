import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';

export const integrations = pgTable('integrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type', { enum: ['alza_gemini', 'github', 'soundcloud', 'user_secret'] }).notNull(),
  secretValue: text('secret_value').notNull(),
  metadata: jsonb('metadata').$type<{
    soundcloudUserId?: string;
    description?: string;
    [key: string]: any;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
