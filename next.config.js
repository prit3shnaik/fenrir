/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/fenrir',
  assetPrefix: '/fenrir/',
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
