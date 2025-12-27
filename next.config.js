/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME || 'Miniatures.lk',
    NEXT_PUBLIC_PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#C9A66B',
    NEXT_PUBLIC_SECONDARY_COLOR: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#EBD3A0',
    NEXT_PUBLIC_DARK_COLOR: process.env.NEXT_PUBLIC_DARK_COLOR || '#2F2F2F',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig
