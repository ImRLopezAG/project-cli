import { z } from 'zod'

export const env = z
	.object({
		DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
		NODE_ENV: z
			.enum(['development', 'test', 'production'])
			.default('development'),
		AUTH_SECRET: z
			.string()
			.min(1, 'AUTH_SECRET is required')
			.default('SUPER_SECRET'),
	})
	.parse(Bun.env)
