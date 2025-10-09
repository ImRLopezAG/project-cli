import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

const config = defineConfig({
	plugins: [
		nitroV2Plugin(),
		viteTsConfigPaths({
			projects: ['./tsconfig.json'],
		}),
		tailwindcss(),
		tanstackStart({
			router: {
				routesDirectory: './app',
			},
		}),
		viteReact({
			babel: {
				// plugins: ['babel-plugin-react-compiler'],
				// presets: [fbteePreset],
			},
		}),
	],
})

export default config
