/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

// basePath permite montar el sitio bajo un subpath (ej. /muebleria).
// Debe empezar con / y NO terminar con /. Vacío para deploys en raíz.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  basePath: basePath || undefined,
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
