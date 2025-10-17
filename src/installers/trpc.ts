import path from 'node:path'
import fs from 'fs-extra'

import { extraDir, BASE_ROOT } from '~/consts.js'
import type { Installer } from '~/installers/index.js'
import { addPackageDependency } from '~/utils/addPackageDependency.js'

export const trpcInstaller: Installer = ({
	projectDir,
	packages,
	framework,
}) => {
	addPackageDependency({
		projectDir,
		dependencies: [
			'@tanstack/react-query',
			'superjson',
			'@trpc/server',
			'@trpc/client',
			'@trpc/react-query',
			'@trpc/tanstack-react-query',
			...(framework === 'next' ? ['server-only' as const] : []),
		],
		devMode: false,
	})

	const usingAuth = packages?.['better-auth'].inUse

	const TRPC_PATHS = trpcPaths(framework)

	const extrasDir = extraDir(framework)
	const copySrcDest: [string, string][] = []

	copySrcDest.push([
		TRPC_PATHS.CLIENT.SRC,
		path.join(projectDir, TRPC_PATHS.CLIENT.DEST),
	])
	copySrcDest.push([
		path.join(extrasDir, TRPC_PATHS.API_HANDLER.SRC),
		path.join(projectDir, TRPC_PATHS.API_HANDLER.DEST),
	])
	copySrcDest.push([
		path.join(BASE_ROOT, TRPC_PATHS.CLIENT_SERVER.SRC),
		path.join(projectDir, TRPC_PATHS.CLIENT_SERVER.DEST),
	])

	Object.values(TRPC_PATHS.SERVER).forEach(({ DEST, NO_AUTH, WITH_AUTH }) => {
		copySrcDest.push([
			usingAuth ? WITH_AUTH : NO_AUTH,
			path.join(projectDir, DEST),
		])
	})

	copySrcDest.forEach(([src, dest]) => {
		fs.copySync(src, dest)
	})
}

function trpcPaths(framework: string) {
	const srcDir = {
		next: 'src',
				'tanstack-star': 'src',
				desktop: 'src/renderer', 
	}[framework] || 'src'

	const TRPC_PATH =  {
		SERVER: {
			INIT: {
				WITH_AUTH: path.join(BASE_ROOT, 'src/server/trpc/with-auth-init.ts'),
				NO_AUTH: path.join(BASE_ROOT, 'src/server/trpc/init.ts'),
				DEST: `${srcDir}/server/trpc/init.ts`,
			},
			ROOT: {
				WITH_AUTH: path.join(BASE_ROOT, 'src/server/trpc/root.ts'),
				NO_AUTH: path.join(BASE_ROOT, 'src/server/trpc/root.ts'),
				DEST: `${srcDir}/server/trpc/root.ts`,
			},
			ROUTES: {
				WITH_AUTH: path.join(BASE_ROOT, 'src/server/trpc/routes'),
				NO_AUTH: path.join(BASE_ROOT, 'src/server/trpc/routes'),
				DEST: `${srcDir}/server/trpc/routes`,
			},
			CLIENT_CONTEXT: {
				WITH_AUTH: path.join(BASE_ROOT, 'src/lib/trpc-context/context-with-auth.ts'),
				NO_AUTH: path.join(BASE_ROOT, 'src/lib/trpc-context/context.ts'),
				DEST: `${srcDir}/lib/trpc/context.ts`,
			}
		},
		CLIENT: {
			SRC: path.join(BASE_ROOT, 'src/lib/trpc'),
			DEST: `${srcDir}/lib/trpc`,
		}
	} as const

	const TRPC_PATHS_NEXT = {
		...TRPC_PATH,
		CLIENT_SERVER: {
			SRC: 'src/lib/trpc-context/server-next.ts',
			DEST: 'src/lib/trpc/server.ts',
		},
		API_HANDLER: {
			DEST: 'src/app/api/[trpc]/route.ts',
			SRC: 'src/app/api/[trpc]/route.ts',
		},
	}
	const TRPC_PATHS_TTS = {
		...TRPC_PATH,
		CLIENT_SERVER: {
			SRC: 'src/lib/trpc-context/server-tts.ts',
			DEST: 'src/lib/trpc/server.ts',
		},
		API_HANDLER: {
			DEST: 'src/app/api/trpc/$.ts',
			SRC: 'src/app/api/trpc/$.ts',
		},
	}
	const TRPC_PATHS_DESKTOP = {
		...TRPC_PATH,
		CLIENT_SERVER: {
			SRC: 'src/lib/trpc-context/server-tts.ts',
			DEST: 'src/renderer/lib/trpc/server.ts',
		},
		API_HANDLER: {
			SRC: 'app/api/trpc/$.ts',
			DEST: 'src/renderer/app/api/trpc/$.ts',
		},
	}

	return {
		next: TRPC_PATHS_NEXT,
		'tanstack-star': TRPC_PATHS_TTS,
		desktop: TRPC_PATHS_DESKTOP,
	}[framework] || TRPC_PATHS_NEXT
}