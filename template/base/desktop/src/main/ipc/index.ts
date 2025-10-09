import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { app } from 'electron'
import z from 'zod'
import { buildRouter, createIpcProcedure } from './schema'
export const ipcRouter = buildRouter({
	core: {
		ping: createIpcProcedure({
			input: z.object({
				name: z.string().min(1, 'Name is required').optional(),
			}),
			handler: ({ name }) => {
				return {
					message: `Pong from main process, ${name || 'Explorer'}!`,
					timestamp: new Date().toISOString(),
				}
			},
		}),
		getSystemInfo: createIpcProcedure({
			handler: () => {
				return {
					platform: process.platform,
					arch: process.arch,
					nodeVersion: process.version,
					electronVersion: process.versions.electron,
					chromeVersion: process.versions.chrome,
					hostname: os.hostname(),
					cpus: os.cpus().length,
					totalMemory: os.totalmem(),
					freeMemory: os.freemem(),
					uptime: os.uptime(),
					appVersion: app.getVersion(),
					appPath: app.getAppPath(),
					userData: app.getPath('userData'),
					home: os.homedir(),
				}
			},
		}),
		getDirectoryContents: createIpcProcedure({
			input: z.object({
				dirPath: z.string().default(os.homedir()),
			}),
			handler: async ({ dirPath }) => {
				try {
					const entries = await fs.readdir(dirPath, {
						withFileTypes: true,
					})

					return {
						path: dirPath,
						items: entries.map((entry) => ({
							name: entry.name,
							isDirectory: entry.isDirectory(),
							isFile: entry.isFile(),
							fullPath: path.join(dirPath, entry.name),
						})),
					}
				} catch (error) {
					throw new Error(
						`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`,
					)
				}
			},
		}),
		pang: createIpcProcedure({
			handler: () => {
				return {
					message: 'Pang from main process!',
					timestamp: new Date().toISOString(),
				}
			},
		}),
	},
})

export type AppIpcRouter = typeof ipcRouter
