/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.'
    }
    return config
  }
}

export default nextConfig
