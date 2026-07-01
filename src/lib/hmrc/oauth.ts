const HMRC_BASE = process.env.HMRC_BASE_URL!
const CLIENT_ID = process.env.HMRC_CLIENT_ID!
const CLIENT_SECRET = process.env.HMRC_CLIENT_SECRET!
const REDIRECT_URI = process.env.HMRC_REDIRECT_URI!

export function getHMRCAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'read:self-assessment write:self-assessment',
    redirect_uri: REDIRECT_URI,
    state,
  })
  return `${HMRC_BASE}/oauth/authorize?${params.toString()}`
}

export async function exchangeHMRCCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(`${HMRC_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }),
  })
  if (!res.ok) throw new Error(`HMRC token exchange failed: ${await res.text()}`)
  return res.json()
}

export async function refreshHMRCToken(refresh_token: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(`${HMRC_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token,
    }),
  })
  if (!res.ok) throw new Error(`HMRC token refresh failed: ${await res.text()}`)
  return res.json()
}
