import path from 'node:path'
import fs from 'fs-extra'

import { CONFIG_ROOT, extraDir } from '~/consts'
import type { Installer } from '~/installers/index'
import { addPackageDependency } from '~/utils/addPackageDependency'

export const tailwindInstallerNext: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ['tailwindcss', 'postcss', '@tailwindcss/postcss'],
		devMode: true,
	})

	const extrasDir = extraDir(framework)

	const postcssCfgSrc = path.join(CONFIG_ROOT, 'config/postcss.config.js')
	const postcssCfgDest = path.join(projectDir, 'postcss.config.js')

	const cssSrc = path.join(extrasDir, 'src/app/globals.css')
	const cssDest = path.join(projectDir, 'src/app/globals.css')

	fs.copySync(postcssCfgSrc, postcssCfgDest)
	fs.copySync(cssSrc, cssDest)
}

export const tailwindInstallerTTS: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ['tailwindcss', '@tailwindcss/vite'],
		devMode: true,
	})

	const extrasDir = extraDir(framework)

	const cssSrc = path.join(extrasDir, 'src/app/index.css')
	const cssDest = path.join(projectDir, 'src/app/index.css')

	fs.copySync(cssSrc, cssDest)
}
export const tailwindInstallerDesktop: Installer = ({
	projectDir,
	framework,
}) => {
	addPackageDependency({
		projectDir,
		dependencies: ['tailwindcss', '@tailwindcss/vite'],
		devMode: true,
	})

	const extrasDir = extraDir(framework)

	const cssSrc = path.join(extrasDir, 'app/index.css')
	const cssDest = path.join(projectDir, 'src/renderer/app/index.css')

	fs.copySync(cssSrc, cssDest)
}

export const tailwindInstaller: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: [
			'tailwindcss',
			...(['tanstack-star', 'desktop'].includes(framework)
				? ['@tailwindcss/vite' as const]
				: []),
			...(framework === 'next'
				? ['postcss' as const, '@tailwindcss/postcss' as const]
				: []),
		],
		devMode: true,
	})

	const PATHS = tailwindPaths(framework, projectDir)

	if (['next'].includes(framework)) {
		fs.copySync(PATHS.POST_CSS.SRC, PATHS.POST_CSS.DEST)
	}
	fs.copySync(PATHS.CSS_FILE.SRC, PATHS.CSS_FILE.DEST)
}
function tailwindPaths(framework: string, projectDir: string) {
	const srcDir =
		{
			next: 'src',
			'tanstack-star': 'src',
			desktop: 'src/renderer',
		}[framework] || 'src'

	const CSS_PATHS_NEXT = {
		POST_CSS: {
			SRC: path.join(CONFIG_ROOT, 'config/postcss.config.js'),
			DEST: path.join(projectDir, 'postcss.config.js'),
		},
		CSS_FILE: {
			SRC: path.join(CONFIG_ROOT, 'config/index.css'),
			DEST: path.join(projectDir, 'src/app/globals.css'),
		},
	}
	const CSS_PATHS_TTS = {
		POST_CSS: {
			SRC: path.join(CONFIG_ROOT, 'config/postcss.config.js'),
			DEST: path.join(projectDir, 'postcss.config.js'),
		},
		CSS_FILE: {
			SRC: path.join(CONFIG_ROOT, 'config/index.css'),
			DEST: path.join(projectDir, 'src/app/index.css'),
		},
	}
	const CSS_PATHS_DESKTOP = {
		POST_CSS: {
			SRC: path.join(CONFIG_ROOT, 'config/postcss.config.js'),
			DEST: path.join(projectDir, 'postcss.config.js'),
		},
		CSS_FILE: {
			SRC: path.join(CONFIG_ROOT, 'config/index.css'),
			DEST: path.join(projectDir, `${srcDir}/app/index.css`),
		},
	}
	return (
		{
			next: CSS_PATHS_NEXT,
			'tanstack-star': CSS_PATHS_TTS,
			desktop: CSS_PATHS_DESKTOP,
		}[framework] || CSS_PATHS_NEXT
	)
}
