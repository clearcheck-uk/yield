import { NextRequest, NextResponse } from 'next/server'
import { exchangeXeroCode, getXeroTenants } from '@/lib/xero/oauth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = req.cookies.get('xero_state')?.value
  const userId = req.cookies.get('xero_user_id')?.value

  if (!code || state !== storedState || !userId) {
    return NextResponse.redirect(new URL('/dashboard?error=xero_auth', req.url))
  }

  try {
    const tokens = await exchangeXeroCode(code)
    const tenants = await getXeroTenants(tokens.access_token)
    const tenant = tenants[0]

    await supabaseAdmin.from('xero_connections').upsert({
      user_id: userId,
      tenant_id: tenant.tenantId,
      tenant_name: tenant.tenantName,
      access_token: encrypt(tokens.access_token),
      refresh_token: encrypt(tokens.refresh_token),
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })

    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    response.cookies.delete('xero_state')
    response.cookies.delete('xero_user_id')
    return response
  } catch (err) {
    console.error('Xero callback error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=xero_failed', req.url))
  }
}
