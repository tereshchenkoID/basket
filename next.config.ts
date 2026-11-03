import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const config: NextConfig = {
  poweredByHeader: false,
  logging: { incomingRequests: { ignore: [/invite/, /\/auth\/callback/] } },
  async headers() {
    return [
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
