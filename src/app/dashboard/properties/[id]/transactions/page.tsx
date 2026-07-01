'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { TransactionCategory } from '@/types'

const CATEGORIES: { value: TransactionCategory; label: string }[] = [
  { value: 'rental_income', label: 'Rental income' },
  { value: 'mortgage_interest', label: 'Mortgage interest (Section 24)' },
  { value: 'repairs_maintenance', label: 'Repairs & maintenance' },
  { value: 'agent_fees', label: 'Agent fees' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'council_tax', label: 'Council tax' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'legal_professional', label: 'Legal & professional fees' },
  { value: 'other_allowable', label: 'Other allowable expenses' },
  { value: 'non_allowable', label: 'Non-allowable (ignore)' },
]

type Row = {
  id?: string
  xero_transaction_id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: TransactionCategory
}

export default function TransactionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params)
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [xeroConnected, setXeroConnected] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      // Check Xero connection
      const { data: xero } = await supabase.from('xero_connections').select('id').eq('user_id', session.user.id).single()
      setXeroConnected(!!xero)

      // Load existing saved transactions
      const { data: existing } = await supabase
        .from('transactions')
        .select('*')
        .eq('property_id', propertyId)
        .order('date', { ascending: false })

      if (existing && existing.length > 0) {
        setRows(existing)
        setLoading(false)
        return
      }

      // If Xero connected, fetch from Xero
      if (xero) {
        const taxYearStart = new Date().getMonth() >= 3
          ? `${new Date().getFullYear()}-04-06`
          : `${new Date().getFullYear() - 1}-04-06`
        const res = await fetch(
          `/api/xero/transactions?propertyId=${propertyId}&from=${taxYearStart}&to=${new Date().toISOString().split('T')[0]}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        )
        const data = await res.json()
        setRows((data.transactions || []).map((t: Row) => ({
          ...t,
          category: t.type === 'income' ? 'rental_income' : 'repairs_maintenance',
        })))
      }
      setLoading(false)
    }
    load()
  }, [propertyId, router])

  function updateCategory(idx: number, category: TransactionCategory) {
    setRows(r => r.map((row, i) => i === idx ? { ...row, category } : row))
  }

  async function saveAll() {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('transactions').delete().eq('property_id', propertyId)
    const toInsert = rows.filter(r => r.category !== 'non_allowable').map(r => ({
      user_id: session.user.id,
      property_id: propertyId,
      xero_transaction_id: r.xero_transaction_id,
      date: r.date,
      description: r.description,
      amount: r.amount,
      type: r.type,
      category: r.category,
      is_mortgage_interest: r.category === 'mortgage_interest',
    }))

    await supabase.from('transactions').insert(toInsert)
    setSaving(false)
    router.push(`/dashboard/properties/${propertyId}/submit`)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-500">Loading transactions...</p></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
          <span className="text-lg font-semibold text-gray-900">Categorise transactions</span>
        </div>
        <button onClick={saveAll} disabled={saving || rows.length === 0} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save & review submission →'}
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!xeroConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
            Xero not connected — transactions imported from Xero will appear here automatically once connected.
            <Link href="/api/auth/xero" className="ml-2 font-medium underline">Connect Xero</Link>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No transactions found for this tax year</p>
            <Link href="/api/auth/xero" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Connect Xero to import</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={row.xero_transaction_id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{row.description || '—'}</td>
                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${row.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {row.type === 'income' ? '+' : '-'}£{row.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.category}
                        onChange={e => updateCategory(i, e.target.value as TransactionCategory)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
