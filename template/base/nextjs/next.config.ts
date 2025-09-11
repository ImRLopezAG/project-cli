import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	experimental: {
		ppr: true,
	},
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	}
}

export default nextConfig
