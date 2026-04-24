/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/fenrir',
  assetPrefix: '/fenrir/',
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
