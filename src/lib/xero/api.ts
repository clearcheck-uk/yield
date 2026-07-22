import { refreshXeroToken } from './oauth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

async function getValidToken(userId: string): Promise<{ accessToken: string; tenantId: string }> {
  const { data: conn } = await supabaseAdmin
    .from('xero_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!conn) throw new Error('No Xero connection found')

  // Refresh if expires within 5 minutes
  if (new Date(conn.expires_at) < new Date(Date.now() + 5 * 60 * 1000)) {
    const tokens = await refreshXeroToken(decrypt(conn.refresh_token))
    await supabaseAdmin.from('xero_connections').update({
      access_token: encrypt(tokens.access_token),
      refresh_token: encrypt(tokens.refresh_token),
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }).eq('user_id', userId)
    return { accessToken: tokens.access_token, tenantId: conn.tenant_id }
  }

  return { accessToken: decrypt(conn.access_token), tenantId: conn.tenant_id }
}

async function xeroFetch(path: string, accessToken: string, tenantId: string) {
  const res = await fetch(`https://api.xero.com/api.xro/2.0${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Xero-Tenant-Id': tenantId,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Xero ${path} failed: ${await res.text()}`)
  return res.json()
}

export async function fetchXeroTransactions(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<Array<{
  xero_transaction_id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
}>> {
  const { accessToken, tenantId } = await getValidToken(userId)

  const params = new URLSearchParams({
    where: `Date >= DateTime(${fromDate.replace(/-/g, ',')}) && Date <= DateTime(${toDate.replace(/-/g, ',')})`,
    order: 'Date DESC',
  })

  const data = await xeroFetch(`/BankTransactions?${params}`, accessToken, tenantId)

  return (data.BankTransactions || []).map((t: {
    BankTransactionID: string
    Date: string
    Reference?: string
    LineItems?: Array<{ Description?: string; LineAmount?: number }>
    Total: number
    Type: string
  }) => ({
    xero_transaction_id: t.BankTransactionID,
    date: t.Date.match(/\d+/)?.[0]
      ? new Date(parseInt(t.Date.match(/\d+/)![0])).toISOString().split('T')[0]
      : fromDate,
    description: t.Reference || t.LineItems?.[0]?.Description || '',
    amount: Math.abs(t.Total),
    type: t.Type === 'RECEIVE' || t.Total > 0 ? 'income' : 'expense',
  }))
}
