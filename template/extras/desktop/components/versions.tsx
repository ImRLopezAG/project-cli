import { useEffect, useState } from 'react'

function Versions(): React.JSX.Element {
	const [versions, setVersions] = useState<{
		electron: string
		chrome: string
		node: string
	} | null>(null)

	useEffect(() => {
		if (typeof window !== 'undefined' && window.electron?.process?.versions) {
			const v = window.electron.process.versions
			setVersions({
				electron: v.electron ?? 'N/A',
				chrome: v.chrome ?? 'N/A',
				node: v.node ?? 'N/A',
			})
		}
	}, [])

	if (!versions) {
		return <div />
	}

	return (
		<ul className='fixed bottom-[30px] mx-auto inline-flex items-center overflow-hidden rounded-[22px] bg-[#202127] py-[15px] font-mono backdrop-blur-[24px]'>
			<li className='float-left border-muted border-r px-5 text-sm leading-[14px] opacity-80'>
				Electron v{versions.electron}
			</li>
			<li className='float-left border-muted border-r px-5 text-sm leading-[14px] opacity-80'>
				Chromium v{versions.chrome}
			</li>
			<li className='float-left px-5 text-sm leading-[14px] opacity-80'>
				Node v{versions.node}
			</li>
		</ul>
	)
}

export default Versions
