import Versions from '~components/versions'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import electronLogo from '../assets/electron-logo.svg'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	const [lastPing, setLastPing] = useState<string | null>(null)

	const ipcHandle = async () => {
		const response = await window.api.core.ping({ name: 'React' })
		const formattedTimestamp = new Date(response.timestamp).toLocaleTimeString()
		setLastPing(`${response.message} • ${formattedTimestamp}`)
	}

	return (
		<div className='mb-20 flex flex-col items-center justify-center gap-2 space-y-5'>
			<img
				alt='logo'
				className='mb-5 h-32 w-32 select-none transition-[filter] duration-300 will-change-[filter] hover:drop-shadow-[0_0_1.2em_#6988e6aa]'
				src={electronLogo}
				draggable={false}
			/>
			<div className='mb-2.5 font-semibold text-muted-foreground text-sm leading-4'>
				Powered by electron-vite
			</div>
			<div className='mx-2.5 py-4 text-center font-bold text-[28px] text-foreground leading-8'>
				Build an Electron app with{' '}
				<span className='bg-gradient-to-br from-55% from-[#087ea4] to-[#7c93ee] bg-clip-text font-bold text-transparent'>
					React
				</span>
				&nbsp;and{' '}
				<span className='bg-gradient-to-br from-45% from-[#3178c6] to-[#f0dc4e] bg-clip-text font-bold text-transparent'>
					TypeScript
				</span>
			</div>
			<p className='font-semibold text-base text-muted-foreground leading-6'>
				Please try pressing{' '}
				<code className='rounded-sm bg-muted px-1.5 py-0.5 font-mono font-semibold text-[85%]'>
					F12
				</code>{' '}
				to open the devTool
			</p>
			<div className='-m-1.5 flex flex-wrap justify-start pt-8'>
				<div className='shrink-0 p-1.5'>
					<a
						href='https://electron-vite.org/'
						target='_blank'
						rel='noreferrer'
						className='inline-block cursor-pointer whitespace-nowrap rounded-[20px] border border-border bg-secondary px-5 py-0 text-center font-semibold text-secondary-foreground text-sm leading-[38px] no-underline transition-colors hover:border-border/80 hover:bg-secondary/80 hover:text-secondary-foreground'
					>
						Documentation
					</a>
				</div>
				<div className='shrink-0 p-1.5'>
					<button
						type='button'
						onClick={ipcHandle}
						className='inline-block cursor-pointer whitespace-nowrap rounded-[20px] border border-border bg-secondary px-5 py-0 text-center font-semibold text-secondary-foreground text-sm leading-[38px] no-underline transition-colors hover:border-border/80 hover:bg-secondary/80 hover:text-secondary-foreground'
					>
						Send IPC
					</button>
				</div>
			</div>
			{lastPing && (
				<div className='rounded-lg border border-border/60 bg-secondary/40 px-4 py-2 text-muted-foreground text-sm'>
					{lastPing}
				</div>
			)}
			<Versions />
		</div>
	)
}
