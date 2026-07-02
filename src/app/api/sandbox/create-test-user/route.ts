import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const baseUrl = process.env.HMRC_BASE_URL!
  const clientId = process.env.HMRC_CLIENT_ID!
  const clientSecret = process.env.HMRC_CLIENT_SECRET!

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(`${baseUrl}/create-test-user/individuals`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.hmrc.1.0+json',
    },
    body: JSON.stringify({
      serviceNames: [
        'national-insurance',
        'self-assessment',
        'mtd-income-tax',
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
