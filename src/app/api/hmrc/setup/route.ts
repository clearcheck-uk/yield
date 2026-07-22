import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getBusinesses, getObligations } from '@/lib/hmrc/api'
import { buildFraudHeaders } from '@/lib/hmrc/fraud-headers'
import { refreshHMRCToken } from '@/lib/hmrc/oauth'
import { encrypt, decrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nino } = await req.json()
  if (!nino) return NextResponse.json({ error: 'NI number required' }, { status: 400 })

  const { data: hmrc } = await supabaseAdmin
    .from('hmrc_connections')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!hmrc) return NextResponse.json({ error: 'HMRC not connected — please reconnect' }, { status: 400 })

  let accessToken = decrypt(hmrc.access_token)
  if (new Date(hmrc.expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
    const refreshed = await refreshHMRCToken(decrypt(hmrc.refresh_token))
    accessToken = refreshed.access_token
    await supabaseAdmin.from('hmrc_connections').update({
      access_token: encrypt(refreshed.access_token),
      refresh_token: encrypt(refreshed.refresh_token),
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    }).eq('id', user.id)
  }

  const fraudHeaders = buildFraudHeaders(req, user.id)

  // Fetch property businesses from HMRC
  let businessId: string | null = null
  try {
    const businesses = await getBusinesses(nino, accessToken, fraudHeaders)
    const propertyBusiness = businesses?.listOfBusinesses?.find(
      (b: { typeOfBusiness: string }) =>
        b.typeOfBusiness === 'uk-property' || b.typeOfBusiness === 'property-unspecified'
    )
    businessId = propertyBusiness?.businessId || null
  } catch (err) {
    console.error('Failed to fetch businesses:', err)
  }

  // Save NI number and business ID
  await supabaseAdmin.from('hmrc_connections').update({
    nino: encrypt(nino),
    business_id: businessId,
  }).eq('id', user.id)

  // Fetch and store obligations if business found
  if (businessId) {
    try {
      const fromDate = new Date().getFullYear() - 1 + '-04-06'
      const toDate = new Date().getFullYear() + 1 + '-04-05'
      const obs = await getObligations(nino, businessId, fromDate, toDate, accessToken, fraudHeaders)
      const { data: properties } = await supabaseAdmin
        .from('properties')
        .select('id')
        .eq('user_id', user.id)

      const propertyId = properties?.[0]?.id

      if (obs?.obligations && propertyId) {
        const toInsert = obs.obligations.flatMap((ob: {
          obligationDetails: Array<{
            periodStartDate: string
            periodEndDate: string
            dueDate: string
            status: string
            periodKey?: string
          }>
        }) =>
          (ob.obligationDetails || []).map((detail) => ({
            user_id: user.id,
            property_id: propertyId,
            hmrc_obligation_id: detail.periodKey || null,
            hmrc_business_id: businessId,
            period_start: detail.periodStartDate,
            period_end: detail.periodEndDate,
            due_date: detail.dueDate,
            status: detail.status === 'F' ? 'fulfilled' : detail.dueDate < new Date().toISOString().split('T')[0] ? 'overdue' : 'open',
          }))
        )

        if (toInsert.length > 0) {
          await supabaseAdmin.from('obligations').upsert(toInsert, { onConflict: 'hmrc_obligation_id' })
        }
      }
    } catch (err) {
      console.error('Failed to fetch obligations:', err)
    }
  }

  return NextResponse.json({ success: true, businessId })
}
