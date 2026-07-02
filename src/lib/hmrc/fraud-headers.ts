import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

export function buildFraudHeaders(req: NextRequest, userId: string): Record<string, string> {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'

  const userAgent = req.headers.get('user-agent') || 'Mozilla/5.0'
  const hashHex = createHash('sha256').update(userId).digest('hex')

  // Format as UUID (8-4-4-4-12)
  const deviceId = [
    hashHex.slice(0, 8),
    hashHex.slice(8, 12),
    hashHex.slice(12, 16),
    hashHex.slice(16, 20),
    hashHex.slice(20, 32),
  ].join('-')

  // Ephemeral port derived from userId (port range 1024-65535)
  const portNum = 1024 + (parseInt(hashHex.slice(0, 4), 16) % 64511)

  // Vendor server IP (Vercel edge)
  const vendorIp = req.headers.get('x-vercel-proxied-for')
    || req.headers.get('x-vercel-ip')
    || clientIp

  return {
    'Gov-Client-Connection-Method': 'WEB_APP_VIA_SERVER',
    'Gov-Client-Device-ID': deviceId,
    'Gov-Client-User-IDs': `device=${hashHex.slice(0, 32)}`,
    'Gov-Client-Timezone': 'UTC+01:00',
    'Gov-Client-Local-IPs': '127.0.0.1',
    'Gov-Client-Public-IP': clientIp,
    'Gov-Client-Public-IP-Timestamp': new Date().toISOString(),
    'Gov-Client-Public-Port': String(portNum),
    'Gov-Client-Browser-JS-User-Agent': userAgent,
    'Gov-Client-Browser-Do-Not-Track': 'false',
    'Gov-Client-Window-Size': 'width=1920&height=1080',
    'Gov-Client-Screens': 'width=1920&height=1080&scaling-factor=1&colour-depth=24',
    'Gov-Vendor-Version': 'Yield=1.0.0',
    'Gov-Vendor-Product-Name': 'Yield',
    'Gov-Vendor-Forwarded': `by=${encodeURIComponent(vendorIp)}&for=${encodeURIComponent(clientIp)}`,
    'Gov-Vendor-License-IDs': '',
  }
}
