/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // packages that must stay external in the server bundle

  // keep any other experimental or custom settings here …

  eslint: {
    // skip ESLint during `next build`
    ignoreDuringBuilds: true,
  },
  typescript: {
    // allow production builds even if TypeScript errors are present
    ignoreBuildErrors: true,
  },
  images: {
    // we don’t need the Next.js Image Optimization CDN
    unoptimized: true,
  },
}

export default nextConfig
