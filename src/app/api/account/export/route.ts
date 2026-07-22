import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    { data: profile },
    { data: properties },
    { data: transactions },
    { data: obligations },
    { data: submissions },
    { data: hmrc },
    { data: xero },
  ] = await Promise.all([
    supabaseAdmin.from('users').select('email, full_name, role, subscription_status, created_at').eq('id', user.id).single(),
    supabaseAdmin.from('properties').select('id, name, address, property_type, ownership_percentage, created_at').eq('user_id', user.id),
    supabaseAdmin.from('transactions').select('id, property_id, date, description, amount, type, category, is_mortgage_interest, created_at').eq('user_id', user.id),
    supabaseAdmin.from('obligations').select('id, property_id, period_start, period_end, due_date, status, created_at').eq('user_id', user.id),
    supabaseAdmin.from('submissions').select('id, property_id, period_start, period_end, total_income, total_expenses, net_profit, mortgage_interest, section24_relief, status, hmrc_submission_id, submitted_at').eq('user_id', user.id),
    supabaseAdmin.from('hmrc_connections').select('nino, business_id, created_at').eq('id', user.id).single(),
    supabaseAdmin.from('xero_connections').select('tenant_name, created_at').eq('user_id', user.id).single(),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    profile,
    properties: properties || [],
    transactions: transactions || [],
    obligations: obligations || [],
    submissions: submissions || [],
    hmrc_connection: hmrc ? { nino: decrypt(hmrc.nino), business_id: hmrc.business_id, connected_at: hmrc.created_at } : null,
    xero_connection: xero || null,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="yield-data-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
