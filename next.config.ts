import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Set basePath only when deploying to GitHub Pages subpath
  ...(isProd && repoName ? {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  } : {}),
}

export default config
