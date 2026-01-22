import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${gatewayUrl.replace(/\/$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
