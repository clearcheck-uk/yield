import { NextResponse } from 'next/server'

export async function POST() {
  const baseUrl = process.env.HMRC_BASE_URL!
  const clientId = process.env.HMRC_CLIENT_ID!
  const clientSecret = process.env.HMRC_CLIENT_SECRET!

  // Step 1: get client credentials token
  const tokenRes = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
  })

  if (!tokenRes.ok) {
    const t = await tokenRes.text()
    return NextResponse.json({ error: `Token error: ${t}` }, { status: tokenRes.status })
  }

  const { access_token } = await tokenRes.json()

  // Step 2: create test user
  const userRes = await fetch(`${baseUrl}/create-test-user/individuals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.hmrc.1.0+json',
    },
    body: JSON.stringify({
      serviceNames: ['national-insurance', 'self-assessment', 'mtd-income-tax'],
    }),
  })

  if (!userRes.ok) {
    const t = await userRes.text()
    return NextResponse.json({ error: `Create user error: ${t}` }, { status: userRes.status })
  }

  const data = await userRes.json()
  return NextResponse.json(data)
}
