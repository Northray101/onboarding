import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages serves this repo at /onboarding — remove if using a custom domain
  basePath: isProd ? '/onboarding' : '',
  assetPrefix: isProd ? '/onboarding' : '',
}

export default nextConfig
