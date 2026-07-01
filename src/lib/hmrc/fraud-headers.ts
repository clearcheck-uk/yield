import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

export function buildFraudHeaders(req: NextRequest, userId: string): Record<string, string> {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'

  const userAgent = req.headers.get('user-agent') || ''
  const deviceId = createHash('sha256').update(userId).digest('hex').slice(0, 32)

  return {
    'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
    'Gov-Client-Device-ID': deviceId,
    'Gov-Client-User-IDs': `os=yield-user-${userId.slice(0, 8)}`,
    'Gov-Client-Timezone': 'UTC+01:00',
    'Gov-Client-Local-IPs': '127.0.0.1',
    'Gov-Client-MAC-Addresses': createHash('sha256').update(userId + 'mac').digest('hex').slice(0, 17),
    'Gov-Client-Public-IP': clientIp,
    'Gov-Client-Public-Port': '443',
    'Gov-Client-Browser-JS-User-Agent': userAgent,
    'Gov-Client-Browser-Do-Not-Track': 'false',
    'Gov-Client-Window-Size': 'width=1920&height=1080',
    'Gov-Client-Screens': 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
    'Gov-Vendor-Version': 'Yield=1.0.0',
    'Gov-Vendor-Product-Name': 'Yield',
  }
}
