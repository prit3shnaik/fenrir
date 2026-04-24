/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/fenrir',
  assetPrefix: '/fenrir/',
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
}

module.exports = nextConfig
