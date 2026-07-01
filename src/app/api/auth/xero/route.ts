import { NextRequest, NextResponse } from 'next/server'
import { getXeroAuthUrl } from '@/lib/xero/oauth'
import { supabaseAdmin } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const state = crypto.randomBytes(16).toString('hex')
  const url = getXeroAuthUrl(state)

  const response = NextResponse.json({ url })
  response.cookies.set('xero_state', state, { httpOnly: true, maxAge: 600, path: '/' })
  response.cookies.set('xero_user_id', user.id, { httpOnly: true, maxAge: 600, path: '/' })
  return response
}
