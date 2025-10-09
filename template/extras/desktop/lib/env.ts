import { z } from 'zod'

export const env = z
	.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		DATABASE_URL: z
			.string()
			.default('postgres://postgres:postgres@localhost:5432/p2p_db'),
		AUTH_SECRET: z.string().default('SUPER_SECRET_KEY'),
		RESEND_API_KEY: z.string().default(''),
	})
	.parse(process.env)
