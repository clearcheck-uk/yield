'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProperty() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    address: '',
    property_type: 'uk_property',
    ownership_percentage: 100,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <span className="text-lg font-semibold text-gray-900">Add property</span>
      </header>
      <main className="max-w-lg mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property name</label>
            <input type="text" required placeholder="e.g. 12 Oak Street flat" value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">A short name to identify this property</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full address</label>
            <textarea required rows={2} value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property type</label>
            <div className="space-y-2">
              {[
                { value: 'uk_property', label: 'UK residential property' },
                { value: 'furnished_holiday_let', label: 'Furnished holiday let (FHL)' },
                { value: 'foreign_property', label: 'Overseas property' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="property_type"
                    value={opt.value}
                    checked={form.property_type === opt.value}
                    onChange={e => set('property_type', e.target.value)}
                    className="text-gray-900"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your ownership share (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.ownership_percentage}
              onChange={e => set('ownership_percentage', Number(e.target.value))}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Enter 50 if jointly owned. Yield calculates your share automatically.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Add property'}
          </button>
        </form>
      </main>
    </div>
  )
}
