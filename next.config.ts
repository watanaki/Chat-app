import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
