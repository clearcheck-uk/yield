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

const blankRow = (): Row => ({
  xero_transaction_id: `manual-${Date.now()}-${Math.random()}`,
  date: new Date().toISOString().split('T')[0],
  description: '',
  amount: 0,
  type: 'income',
  category: 'rental_income',
})

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

      const { data: xero } = await supabase.from('xero_connections').select('id').eq('user_id', session.user.id).single()
      setXeroConnected(!!xero)

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

  async function connectXero() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/auth/xero', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const { url } = await res.json()
    if (url) window.open(url, '_blank')
  }

  function updateRow(idx: number, field: keyof Row, value: string | number) {
    setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: value } : row))
  }

  function addRow() {
    setRows(r => [blankRow(), ...r])
  }

  function removeRow(idx: number) {
    setRows(r => r.filter((_, i) => i !== idx))
  }

  async function saveAll() {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('transactions').delete().eq('property_id', propertyId)
    const toInsert = rows.filter(r => r.category !== 'non_allowable' && r.amount > 0).map(r => ({
      user_id: session.user.id,
      property_id: propertyId,
      xero_transaction_id: r.xero_transaction_id,
      date: r.date,
      description: r.description,
      amount: Number(r.amount),
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
          <span className="text-lg font-semibold text-gray-900">Transactions</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addRow} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-400">
            + Add manually
          </button>
          <button onClick={saveAll} disabled={saving || rows.length === 0} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save & review →'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!xeroConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800 flex items-center justify-between">
            <span>Connect Xero to import transactions automatically.</span>
            <button onClick={connectXero} className="ml-4 font-medium underline whitespace-nowrap">Connect Xero</button>
          </div>
        )}

        {rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No transactions yet</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={addRow} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add transaction manually
              </button>
              {!xeroConnected && (
                <button onClick={connectXero} className="text-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:border-gray-400">
                  Connect Xero to import
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Amount (£)</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={row.xero_transaction_id || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="date" value={row.date} onChange={e => updateRow(i, 'date', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" value={row.description} onChange={e => updateRow(i, 'description', e.target.value)}
                        placeholder="Description" className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 w-full focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={row.type} onChange={e => updateRow(i, 'type', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" step="0.01" value={row.amount} onChange={e => updateRow(i, 'amount', e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 text-right w-24 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={row.category} onChange={e => updateRow(i, 'category', e.target.value as TransactionCategory)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 w-full">
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
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
