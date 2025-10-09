import type { ElectronAPI } from '@electron-toolkit/preload'
import type { AppIpcRouter } from '~int/ipc'
import type { RendererApi } from '~int/ipc/client'

declare global {
	interface Window {
		electron: ElectronAPI
		api: RendererApi<AppIpcRouter>
	}
}
