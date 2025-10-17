import { sqliteTable, index } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', (t) => ({
  id: t.text('id').primaryKey(),
  name: t.text('name').notNull(),
  email: t.text('email').notNull().unique(),
  emailVerified: t
    .integer('email_verified', { mode: 'boolean' })
    .default(false)
    .notNull(),
  image: t.text('image'),
  createdAt: t
    .integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: t
    .integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: t.text('username').unique(),
  displayUsername: t.text('display_username'),
}),(t) => [
    index('idx_user_email').on(t.email),
    index('idx_user_name').on(t.name),
    index('idx_user_username').on(t.username),
    index('idx_user_created_at').on(t.createdAt),
    index('idx_user_updated_at').on(t.updatedAt),
  ])

export const session = sqliteTable('session', (t) => ({
  id: t.text('id').primaryKey(),
  expiresAt: t.integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: t.text('token').notNull().unique(),
  createdAt: t
    .integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: t
    .integer('updated_at', { mode: 'timestamp' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: t.text('ip_address'),
  userAgent: t.text('user_agent'),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
}), (t) => [
    index('idx_session_token').on(t.token),
    index('idx_session_user_id').on(t.userId)
  ])

export const account = sqliteTable('account', (t) => ({
  id: t.text('id').primaryKey(),
  accountId: t.text('account_id').notNull(),
  providerId: t.text('provider_id').notNull(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: t.text('access_token'),
  refreshToken: t.text('refresh_token'),
  idToken: t.text('id_token'),
  accessTokenExpiresAt: t.integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: t.integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: t.text('scope'),
  password: t.text('password'),
  createdAt: t
    .integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: t
    .integer('updated_at', { mode: 'timestamp' })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}), (t) => [
    index('idx_account_account_id').on(t.accountId),
    index('idx_account_provider_id').on(t.providerId),
    index('idx_account_user_id').on(t.userId),
  ])

export const verification = sqliteTable('verification', (t) => ({
  id: t.text('id').primaryKey(),
  identifier: t.text('identifier').notNull(),
  value: t.text('value').notNull(),
  expiresAt: t.integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: t
    .integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: t
    .integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}), (t) => [
    index('idx_verification_identifier').on(t.identifier),
    index('idx_verification_value').on(t.value),
  ])
