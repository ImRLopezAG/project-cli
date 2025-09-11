import { index } from 'drizzle-orm/pg-core'
import { authSchema } from './schemas.entity'
export const user = authSchema.table(
	'user',
	(t) => ({
		id: t.text('id').primaryKey(),
		name: t.text('name').notNull(),
		email: t.text('email').notNull().unique('idx_user_email_unique'),
		emailVerified: t
			.boolean('email_verified')
			.$defaultFn(() => false)
			.notNull(),
		image: t.text('image'),
		createdAt: t
			.timestamp('created_at')
			.$defaultFn(() => /* @__PURE__ */ new Date())
			.notNull(),
		updatedAt: t
			.timestamp('updated_at')
			.$defaultFn(() => /* @__PURE__ */ new Date())
			.notNull(),
		username: t.text('username').unique(),
		displayUsername: t.text('display_username'),
	}),
	(t) => [
		index('idx_user_email').on(t.email),
		index('idx_user_name').on(t.name),
		index('idx_user_username').on(t.username),
		index('idx_user_created_at').on(t.createdAt),
		index('idx_user_updated_at').on(t.updatedAt),
	],
)

export const session = authSchema.table(
	'session',
	(t) => ({
		id: t.text('id').primaryKey(),
		expiresAt: t.timestamp('expires_at').notNull(),
		token: t.text('token').notNull().unique(),
		createdAt: t.timestamp('created_at').notNull(),
		updatedAt: t.timestamp('updated_at').notNull(),
		ipAddress: t.text('ip_address'),
		userAgent: t.text('user_agent'),
		userId: t
			.text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: t.text('impersonated_by'),
	}),
	(t) => [
		index('idx_session_user_id').on(t.userId),
		index('idx_session_token').on(t.token),
	],
)

export const account = authSchema.table(
	'account',
	(t) => ({
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
		accessTokenExpiresAt: t.timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at'),
		scope: t.text('scope'),
		password: t.text('password'),
		createdAt: t.timestamp('created_at').notNull(),
		updatedAt: t.timestamp('updated_at').notNull(),
	}),
	(t) => [
		index('idx_account_user_id').on(t.userId),
		index('idx_account_provider').on(t.providerId),
	],
)

export const verification = authSchema.table(
	'verification',
	(t) => ({
		id: t.text('id').primaryKey(),
		identifier: t.text('identifier').notNull(),
		value: t.text('value').notNull(),
		expiresAt: t.timestamp('expires_at').notNull(),
		createdAt: t
			.timestamp('created_at')
			.$defaultFn(() => /* @__PURE__ */ new Date()),
		updatedAt: t
			.timestamp('updated_at')
			.$defaultFn(() => /* @__PURE__ */ new Date()),
	}),
	(t) => [index('idx_verification_identifier').on(t.identifier)],
)
