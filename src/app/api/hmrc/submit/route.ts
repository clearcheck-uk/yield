import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { submitPeriodSummary } from '@/lib/hmrc/api'
import { buildFraudHeaders } from '@/lib/hmrc/fraud-headers'
import { mapToHMRCExpenses } from '@/lib/hmrc/section24'
import { refreshHMRCToken } from '@/lib/hmrc/oauth'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { propertyId, obligationId, fromDate, toDate, taxYear, businessId } = body

  // Get HMRC connection
  const { data: hmrc } = await supabaseAdmin
    .from('hmrc_connections')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!hmrc) return NextResponse.json({ error: 'HMRC not connected' }, { status: 400 })

  // Refresh token if needed
  let accessToken = hmrc.access_token
  if (new Date(hmrc.expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
    const refreshed = await refreshHMRCToken(hmrc.refresh_token)
    accessToken = refreshed.access_token
    await supabaseAdmin.from('hmrc_connections').update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    }).eq('id', user.id)
  }

  // Get transactions for this property and period
  const { data: transactions } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('property_id', propertyId)
    .gte('date', fromDate)
    .lte('date', toDate)

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ error: 'No transactions found for this period' }, { status: 400 })
  }

  const { income, expenses } = mapToHMRCExpenses(transactions)
  const fraudHeaders = buildFraudHeaders(req, user.id)

  const result = await submitPeriodSummary(
    hmrc.nino,
    hmrc.business_id || businessId,
    taxYear,
    {
      fromDate,
      toDate,
      income: { rentIncome: income.rentIncome },
      expenses,
    },
    accessToken,
    fraudHeaders
  )

  // Save submission record
  await supabaseAdmin.from('submissions').insert({
    user_id: user.id,
    property_id: propertyId,
    obligation_id: obligationId,
    period_start: fromDate,
    period_end: toDate,
    total_income: income.rentIncome,
    total_expenses: Object.values(expenses).reduce((a, b) => a + b, 0),
    net_profit: income.rentIncome - Object.values(expenses).reduce((a, b) => a + b, 0),
    mortgage_interest: expenses.financialCosts || 0,
    section24_relief: (expenses.financialCosts || 0) * 0.20,
    status: 'submitted',
    hmrc_submission_id: result?.submissionId || null,
    submitted_at: new Date().toISOString(),
  })

  // Mark obligation as fulfilled
  await supabaseAdmin.from('obligations').update({ status: 'fulfilled' }).eq('id', obligationId)

  return NextResponse.json({ success: true, submissionId: result?.submissionId })
}
