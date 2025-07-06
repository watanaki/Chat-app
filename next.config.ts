import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' },
      { hostname: 'utfs.io' }
    ]
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/conversations',
        permanent: false,
      }
    ]
  }
};

export default nextConfig;
