/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fetis/shared'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4001', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**', pathname: '/uploads/**' },
    ],
  },
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
