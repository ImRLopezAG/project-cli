import type { PropsWithChildren } from 'react'
import { TRPCReactProvider } from '~lib/trpc/react'
import { Toaster } from '~ui/sonner'
import { AuthProvider } from './auth'
import { ThemeProvider } from './theme'
export function Providers({ children }: PropsWithChildren) {
	return (
		<TRPCReactProvider>
			<AuthProvider>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					{children}
					<Toaster richColors position='top-center' />
				</ThemeProvider>
			</AuthProvider>
		</TRPCReactProvider>
	)
}
