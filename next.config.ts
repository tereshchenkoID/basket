import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'node:path'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const config: NextConfig = {
  poweredByHeader: false,
  compress: true,
  sassOptions: {
    includePaths: [
      path.join(process.cwd(), 'src/styles'),
      path.join(process.cwd(), 'src/scss'),
    ],
    additionalData: `
      @use "@/scss/config" as *;
    `,
  },
  experimental: {
    optimizePackageImports: ['next-intl', 'use-intl', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 576, 768, 992, 1280],
  },
  logging: { incomingRequests: { ignore: [/invite/, /\/auth\/callback/] } },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/:locale/invite/:token',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default withNextIntl(config)
