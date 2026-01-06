import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.pinimg.com', // Wildcard for all pinimg subdomains
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
