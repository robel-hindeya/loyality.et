/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard/user',
        destination: '/user',
        permanent: false,
      },
      {
        source: '/dashboard/user/:path*',
        destination: '/user/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/company',
        destination: '/company',
        permanent: false,
      },
      {
        source: '/dashboard/company/:path*',
        destination: '/company/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/cashier',
        destination: '/cashier',
        permanent: false,
      },
      {
        source: '/dashboard/cashier/:path*',
        destination: '/cashier/:path*',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/company',
        permanent: false,
      },
      {
        source: '/campany',
        destination: '/company',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
