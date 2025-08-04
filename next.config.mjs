/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // اضافه کردن تنظیمات webpack برای حل مشکل alias
  webpack: (config) => {
    return config;
  },
}

export default nextConfig
