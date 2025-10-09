import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

// Plugin to trigger full reload when IPC procedures change
function ipcReloadPlugin() {
	return {
		name: 'ipc-reload',
		handleHotUpdate({ file, server }) {
			if (file.includes('src/main/ipc/')) {
				console.log('🔄 IPC procedure changed, reloading renderer...')
				// Send custom event instead of full reload
				server.ws.send({
					type: 'custom',
					event: 'ipc-update',
				})
				return []
			}
			return undefined
		},
	}
}

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin(), viteTsConfigPaths()],
		build: {
			rollupOptions: {
				// Externalize dependencies to speed up dev server restarts
				external: ['electron', 'electron-updater'],
			},
		},
	},
	preload: {
		plugins: [externalizeDepsPlugin(), viteTsConfigPaths()],
		build: {
			watch: {
				// Watch IPC files so preload rebuilds when procedures change
				include: ['src/main/ipc/**'],
			},
		},
	},
	renderer: {
		plugins: [
			viteTsConfigPaths(),
			tailwindcss(),
			ipcReloadPlugin(),
			tanstackStart({
				srcDirectory: './src/renderer',
				router: {
					routesDirectory: './app',
				},
			}),
			react({
				babel: {
					// plugins: ['babel-plugin-react-compiler'],
					// presets: [fbteePreset],
				},
			}),
		],
	},
})
