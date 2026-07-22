'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HMRCSetupPage() {
  const router = useRouter()
  const [nino, setNino] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function formatNino(value: string) {
    const clean = value.replace(/\s/g, '').toUpperCase()
    const parts = clean.match(/^([A-Z]{2})(\d{0,2})(\d{0,2})(\d{0,2})([A-D]?)$/)
    if (!parts) return clean
    return [parts[1], parts[2], parts[3], parts[4], parts[5]].filter(Boolean).join(' ').trim()
  }

  function isValidNino(n: string) {
    return /^[A-CEGHJ-PR-TW-Z]{2}\d{6}[A-D]$/.test(n.replace(/\s/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = nino.replace(/\s/g, '').toUpperCase()
    if (!isValidNino(clean)) {
      setError('Enter a valid NI number (e.g. AA 12 34 56 A)')
      return
    }
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    const res = await fetch('/api/hmrc/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ nino: clean }),
    })

    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    // businessId may be null for new landlords not yet enrolled in MTD —
    // that is fine, HMRC will assign one on first submission
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">HMRC connected</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your National Insurance number to complete setup</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nino" className="block text-sm font-medium text-gray-700 mb-1">
                National Insurance number
              </label>
              <input
                id="nino"
                type="text"
                required
                placeholder="AA 12 34 56 A"
                value={nino}
                onChange={e => setNino(formatNino(e.target.value))}
                maxLength={13}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
              />
              <p className="text-xs text-gray-600 mt-1">
                Found on your payslip, P60, or HMRC letters
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Your NI number is sent directly to HMRC and stored securely. It is never shared with third parties.
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
