import path from 'node:path'
import fs from 'fs-extra'

import { BASE_ROOT, extraDir, PROVIDERS_NAME } from '~/consts'
import type { Installer } from '~/installers/index'
import { addPackageDependency } from '~/utils/addPackageDependency'
import { addPackageScript } from '~/utils/addPackageScript'

export const betterAuthInstaller: Installer = ({
	projectDir,
	databaseProvider,
	framework,
}) => {
	addPackageDependency({
		projectDir,
		dependencies: ['better-auth'],
		devMode: false,
	})
	addPackageScript({
		projectDir,
		scripts: {
			'auth:gen':
				'@better-auth/cli generate --config ./src/server/auth/index.ts',
		},
	})

	const AUTH_PATHS = betterAuthPaths(
		framework,
		PROVIDERS_NAME[databaseProvider],
	)
	const copySrcDest: [string, string][] = []

	copySrcDest.push([
		path.join(AUTH_PATHS.API_HANDLER.SRC),
		path.join(projectDir, AUTH_PATHS.API_HANDLER.DEST),
	])
	copySrcDest.push([
		path.join(AUTH_PATHS.CLIENT.SRC),
		path.join(projectDir, AUTH_PATHS.CLIENT.DEST),
	])
	copySrcDest.push([
		path.join(AUTH_PATHS.HOOKS.SRC),
		path.join(projectDir, AUTH_PATHS.HOOKS.DEST),
	])
	copySrcDest.push([
		path.join(AUTH_PATHS.CONFIG.SRC),
		path.join(projectDir, AUTH_PATHS.CONFIG.DEST),
	])

	copySrcDest.forEach(([src, dest]) => {
		fs.copySync(src, dest)
	})
}

function betterAuthPaths(framework: string, db: string) {
	const srcDir =
		{
			next: 'src',
			'tanstack-star': 'src',
			desktop: 'src/renderer',
		}[framework] || 'src'

	const AUTH_PATHS = {
		CLIENT: {
			SRC: path.join(BASE_ROOT, 'src/lib/$auth/index.ts'),
			DEST: `${srcDir}/lib/$auth/index.ts`,
		},
		HOOKS: {
			SRC: path.join(BASE_ROOT, 'src/hooks/use-auth.ts'),
			DEST: `${srcDir}/hooks/use-auth.ts`,
		},
		CONFIG: {
			SRC: path.join(BASE_ROOT, `src/server/auth/${framework}/${db}-index.ts`),
			DEST: `${srcDir}/server/auth/index.ts`,
		},
	} as const
	const dir = extraDir(framework)
	const AUTH_PATHS_NEXT = {
		...AUTH_PATHS,
		API_HANDLER: {
			SRC: path.join(dir, 'src/app/api/auth/[...all]/route.ts'),
			DEST: `${srcDir}/app/api/auth/route.ts`,
		},
	}
	const AUTH_PATHS_TTS = {
		...AUTH_PATHS,
		API_HANDLER: {
			SRC: path.join(dir, 'src/app/api/auth/$.ts'),
			DEST: `${srcDir}/app/api/auth/$.ts`,
		},
	}
	
	const AUTH_PATHS_DESKTOP = {
		...AUTH_PATHS,
		API_HANDLER: {
			SRC: path.join(dir, 'app/api/auth/$.ts'),
			DEST: `${srcDir}/app/api/auth/$.ts`,
		},
	}

	return {
		next: AUTH_PATHS_NEXT,
		'tanstack-star': AUTH_PATHS_TTS,
		desktop: AUTH_PATHS_DESKTOP,
	}[framework] || AUTH_PATHS_NEXT
	
}
