import path from 'node:path'
import fs from 'fs-extra'
import { extraDir } from '~/consts'
import type { Installer } from '~/installers/index'
import { addPackageDependency } from '~/utils/addPackageDependency'
import { addPackageScript } from '~/utils/addPackageScript'
export const fbteeInstaller: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ['fbtee'],
		devMode: false,
	})
	addPackageDependency({
		projectDir,
		dependencies: ['@nkzw/babel-preset-fbtee'],
		devMode: true,
	})

	addPackageScript({
		projectDir,
		scripts: {
			'fbtee:prepare':
				"node -e \"require('fs').mkdirSync('translations',{recursive:true});\" && $npm_execpath fbtee prepare-translations --locales es_ES -o translations",
			'fbtee:translate':
				'$npm_execpath fbtee translate --translations translations/*.json -o src/components/providers/locale/i18n',
			'fbtee:all':
				'$npm_execpath fbtee collect && $npm_execpath fbtee:prepare && $npm_execpath fbtee:translate',
		},
	})

	// GraphQL specific setup will be implemented later
	// This is a basic installer for now
	const extrasDir = extraDir(framework)

  const FBTEE_LOCALE_DIR = 'src/components/providers/locale'
  const fbteeLocaleSrc = path.join(extrasDir, FBTEE_LOCALE_DIR)
  const fbteeLocaleDest = path.join(projectDir, FBTEE_LOCALE_DIR)
  fs.copySync(fbteeLocaleSrc, fbteeLocaleDest)
}
export const fbteeInstallerDesktop: Installer = ({ projectDir, framework }) => {
	addPackageDependency({
		projectDir,
		dependencies: ['fbtee'],
		devMode: false,
	})
	addPackageDependency({
		projectDir,
		dependencies: ['@nkzw/babel-preset-fbtee'],
		devMode: true,
	})

	addPackageScript({
		projectDir,
		scripts: {
			'fbtee:prepare':
				"node -e \"require('fs').mkdirSync('translations',{recursive:true});\" && $npm_execpath fbtee prepare-translations --locales es_ES -o translations",
			'fbtee:translate':
				'$npm_execpath fbtee translate --translations translations/*.json -o src/renderer/components/providers/locale/i18n',
			'fbtee:all':
				'$npm_execpath fbtee collect && $npm_execpath fbtee:prepare && $npm_execpath fbtee:translate',
		},
	})

	// GraphQL specific setup will be implemented later
	// This is a basic installer for now
	const extrasDir = extraDir(framework)

  const FBTEE_LOCALE_DIR = 'components/providers/locale'
  const fbteeLocaleSrc = path.join(extrasDir, FBTEE_LOCALE_DIR)
  const fbteeLocaleDest = path.join(projectDir, FBTEE_LOCALE_DIR.replace('components', 'src/renderer/components'))
  fs.copySync(fbteeLocaleSrc, fbteeLocaleDest)
}
