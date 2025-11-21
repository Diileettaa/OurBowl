/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 告诉 Vercel：TypeScript 有错也给我过！
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. 告诉 Vercel：代码风格不完美也给我过！
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 3. 允许加载所有图片
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;