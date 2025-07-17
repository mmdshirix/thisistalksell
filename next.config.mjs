/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller, production-ready Docker images.
  // This bundles only the necessary files for running the application.
  output: 'standalone',
  
  experimental: {
    // Optional: Recommended for better performance with pnpm
    serverComponentsExternalPackages: ['pg'],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
  },
  
  // Fix for path resolution issues in Docker builds
  webpack: (config, { isServer }) => {
    // Ensure proper path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    
    return config;
  },
};

export default nextConfig;
