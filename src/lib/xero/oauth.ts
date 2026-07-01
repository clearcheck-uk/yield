const CLIENT_ID = process.env.XERO_CLIENT_ID!
const CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!
const REDIRECT_URI = process.env.XERO_REDIRECT_URI!

const SCOPES = [
  'accounting.settings.read',
  'accounting.transactions.read',
  'accounting.contacts.read',
  'accounting.reports.read',
  'offline_access',
  'openid',
  'profile',
  'email',
].join(' ')

export function getXeroAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
  })
  return `https://login.xero.com/identity/connect/authorize?${params.toString()}`
}

export async function exchangeXeroCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    }),
  })
  if (!res.ok) throw new Error(`Xero token exchange failed: ${await res.text()}`)
  return res.json()
}

export async function refreshXeroToken(refresh_token: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })
  if (!res.ok) throw new Error(`Xero token refresh failed: ${await res.text()}`)
  return res.json()
}

export async function getXeroTenants(access_token: string): Promise<Array<{
  tenantId: string
  tenantName: string
  tenantType: string
}>> {
  const res = await fetch('https://api.xero.com/connections', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!res.ok) throw new Error(`Failed to get Xero tenants: ${await res.text()}`)
  return res.json()
}
