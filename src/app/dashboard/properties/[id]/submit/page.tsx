'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { calculateSection24 } from '@/lib/hmrc/section24'

type Transaction = {
  amount: number
  type: 'income' | 'expense'
  category: string
}

export default function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params)
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [property, setProperty] = useState<{ name: string; ownership_percentage: number } | null>(null)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [obligationId, setObligationId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      const now = new Date()
      const today = now.toISOString().split('T')[0]

      const [{ data: prop }, { data: txns }, { data: hmrc }, { data: obligation }] = await Promise.all([
        supabase.from('properties').select('name, ownership_percentage').eq('id', propertyId).single(),
        supabase.from('transactions').select('amount, type, category').eq('property_id', propertyId),
        supabase.from('hmrc_connections').select('business_id').eq('id', session.user.id).single(),
        supabase.from('obligations')
          .select('id')
          .eq('property_id', propertyId)
          .in('status', ['open', 'overdue'])
          .lte('period_start', today)
          .order('period_start', { ascending: false })
          .limit(1)
          .single(),
      ])

      setProperty(prop)
      setTransactions(txns || [])
      setBusinessId(hmrc?.business_id || null)
      setObligationId(obligation?.id || null)
      setLoading(false)
    }
    load()
  }, [propertyId, router])

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const now = new Date()
    const taxYearStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    const fromDate = `${taxYearStart}-04-06`
    const toDate = now.toISOString().split('T')[0]
    const taxYear = `${taxYearStart}-${String(taxYearStart + 1).slice(2)}`

    const res = await fetch('/api/hmrc/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        propertyId,
        obligationId: obligationId || null,
        fromDate,
        toDate,
        taxYear,
        businessId,
      }),
    })

    const data = await res.json()
    if (data.error) { setError(data.error); setSubmitting(false); return }
    setSubmitted(true)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-sm text-gray-500">Loading...</p></div>

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const allExpenses = transactions.filter(t => t.type === 'expense')
  const mortgageInterest = allExpenses.filter(t => t.category === 'mortgage_interest').reduce((s, t) => s + t.amount, 0)
  const otherExpenses = allExpenses.filter(t => t.category !== 'mortgage_interest').reduce((s, t) => s + t.amount, 0)

  const s24 = calculateSection24({
    totalIncome: income,
    allowableExpenses: otherExpenses,
    mortgageInterest,
    ownershipPercentage: property?.ownership_percentage || 100,
  })

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submitted to HMRC</h1>
          <p className="text-gray-500 mb-8">Your quarterly update has been sent successfully.</p>
          <Link href="/dashboard" className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href={`/dashboard/properties/${propertyId}/transactions`} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <span className="text-lg font-semibold text-gray-900">Review & submit</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{property?.name} — Income summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Rental income</span>
              <span className="font-medium text-green-600">+£{s24.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Allowable expenses</span>
              <span className="font-medium">-£{s24.allowableExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 border-t border-gray-100 pt-3">
              <span className="font-medium">Taxable profit</span>
              <span className="font-bold text-gray-900">£{s24.taxableProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Section 24 — Finance cost relief</h2>
          <p className="text-xs text-gray-500 mb-4">Mortgage interest is not deductible. Instead you receive a 20% tax credit.</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Mortgage interest (not deducted)</span>
              <span>£{s24.mortgageInterest.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-700 font-medium">
              <span>Section 24 tax credit (20%)</span>
              <span>-£{s24.section24TaxCredit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Estimated tax position</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Tax on profit (basic rate)</span>
              <span>£{s24.estimatedTax.basicRate.toFixed(2)}</span>
            </div>
            {s24.estimatedTax.higherRate > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax on profit (higher rate)</span>
                <span>£{s24.estimatedTax.higherRate.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-blue-700">
              <span>Section 24 credit</span>
              <span>-£{s24.section24TaxCredit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
              <span>Estimated tax</span>
              <span>£{s24.estimatedTax.total.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Estimate only — actual tax depends on your personal allowance and other income.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting to HMRC...' : 'Submit quarterly update to HMRC →'}
        </button>
        <p className="text-xs text-gray-400 text-center">This will submit a quarterly Period Summary to HMRC via the MTD Income Tax API.</p>
      </main>
    </div>
  )
}
