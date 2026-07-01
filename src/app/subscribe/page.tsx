'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Subscribe() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(role: 'landlord' | 'accountant') {
    setLoading(role)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ role }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Link href="/" className="block text-center text-xl font-semibold text-gray-900 mb-2">Yield</Link>
        <p className="text-center text-gray-500 text-sm mb-10">14-day free trial — no card charged today</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Landlord</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">£35<span className="text-base font-normal text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500 mb-6">For individual landlords</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Up to 10 properties</li>
              <li>✓ Xero integration</li>
              <li>✓ Quarterly HMRC submissions</li>
              <li>✓ Section 24 calculator</li>
            </ul>
            <button
              onClick={() => checkout('landlord')}
              disabled={!!loading}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {loading === 'landlord' ? 'Redirecting...' : 'Start free trial'}
            </button>
          </div>
          <div className="bg-white rounded-xl border-2 border-gray-900 p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Accountant</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">£150<span className="text-base font-normal text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500 mb-6">For accountants with landlord clients</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Unlimited clients</li>
              <li>✓ Xero integration</li>
              <li>✓ Bulk submissions</li>
              <li>✓ Section 24 calculator</li>
              <li>✓ Agent authorisation</li>
            </ul>
            <button
              onClick={() => checkout('accountant')}
              disabled={!!loading}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {loading === 'accountant' ? 'Redirecting...' : 'Start free trial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
