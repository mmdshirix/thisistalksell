import path from "path"

/** @type {import('next').NextConfig} */
const nextConfig = {
reactStrictMode: true,
experimental: {
  serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
},
images: {
  domains: ['localhost'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
  ],
  unoptimized: true,
},
output: 'standalone',
poweredByHeader: false,
compress: true,
generateEtags: false,
httpAgentOptions: {
  keepAlive: true,
},
onDemandEntries: {
  maxInactiveAge: 25 * 1000,
  pagesBufferLength: 2,
},
webpack: (config, { isServer }) => {
  config.resolve = config.resolve || {}
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    "@": path.resolve(process.cwd()),
  }
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
  }
  return config;
},
env: {
  CUSTOM_KEY: process.env.CUSTOM_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
},
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
},
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
};

export default nextConfig;
