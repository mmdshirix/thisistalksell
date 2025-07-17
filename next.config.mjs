import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller, production-ready Docker images.
  output: 'standalone',
  
  // For Next.js 14.2.x - use experimental
  experimental: {
    serverComponentsExternalPackages: ['pg', 'pg-native', 'dotenv'],
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
      '@': path.resolve(__dirname),
    };
    
    // Fix for Node.js modules in Edge Runtime
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        crypto: false,
        path: false,
        stream: false,
        util: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
