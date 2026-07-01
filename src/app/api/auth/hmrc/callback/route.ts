import { NextRequest, NextResponse } from 'next/server'
import { exchangeHMRCCode } from '@/lib/hmrc/oauth'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = req.cookies.get('hmrc_state')?.value
  const userId = req.cookies.get('hmrc_user_id')?.value

  if (!code || state !== storedState || !userId) {
    return NextResponse.redirect(new URL('/dashboard?error=hmrc_auth', req.url))
  }

  try {
    const tokens = await exchangeHMRCCode(code)

    await supabaseAdmin.from('hmrc_connections').upsert({
      id: userId,
      nino: '',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })

    const response = NextResponse.redirect(new URL('/dashboard/connect/hmrc-setup', req.url))
    response.cookies.delete('hmrc_state')
    response.cookies.delete('hmrc_user_id')
    return response
  } catch (err) {
    console.error('HMRC callback error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=hmrc_failed', req.url))
  }
}
