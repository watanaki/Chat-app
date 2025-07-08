import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'img.clerk.com' },
      { hostname: '7jyxg67x5h.ufs.sh', protocol: 'https', pathname: '/f/*' },
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
