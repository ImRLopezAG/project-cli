import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { env } from '~lib/env'
import * as schema from './entities'

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
	conn: PGlite | undefined
}

const conn = globalForDb.conn ?? new PGlite(env.DATABASE_URL)
if (env.NODE_ENV !== 'production') globalForDb.conn = conn

const db = drizzle(conn, { schema, casing: 'snake_case' })

export { db, schema }
