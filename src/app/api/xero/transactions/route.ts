import { NextRequest, NextResponse } from 'next/server'
import { fetchXeroTransactions } from '@/lib/xero/api'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('propertyId')
  const fromDate = searchParams.get('from') || new Date(new Date().getFullYear(), 3, 6).toISOString().split('T')[0]
  const toDate = searchParams.get('to') || new Date().toISOString().split('T')[0]

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!propertyId) return NextResponse.json({ error: 'propertyId required' }, { status: 400 })

  const transactions = await fetchXeroTransactions(user.id, fromDate, toDate)
  return NextResponse.json({ transactions })
}
