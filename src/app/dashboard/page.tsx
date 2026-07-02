'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Property = { id: string; name: string; address: string; property_type: string }
type Obligation = { id: string; period_start: string; period_end: string; due_date: string; status: string; property_id: string }
type Profile = { email: string; full_name: string; role: string; subscription_status: string }

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [obligations, setObligations] = useState<Obligation[]>([])
  const [xeroConnected, setXeroConnected] = useState(false)
  const [hmrcConnected, setHmrcConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }

      const [{ data: prof }, { data: props }, { data: obs }, { data: xero }, { data: hmrc }] = await Promise.all([
        supabase.from('users').select('email, full_name, role, subscription_status').eq('id', session.user.id).single(),
        supabase.from('properties').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('obligations').select('*').eq('user_id', session.user.id).order('due_date', { ascending: true }),
        supabase.from('xero_connections').select('id').eq('user_id', session.user.id).single(),
        supabase.from('hmrc_connections').select('id').eq('id', session.user.id).single(),
      ])

      if (prof?.subscription_status === 'inactive') {
        router.push('/subscribe')
        return
      }

      setProfile(prof)
      setProperties(props || [])
      setObligations(obs || [])
      setXeroConnected(!!xero)
      setHmrcConnected(!!hmrc)
      setLoading(false)
    }
    load()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function connectOAuth(provider: 'hmrc' | 'xero') {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }
    const res = await fetch(`/api/auth/${provider}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const { url, error } = await res.json()
    if (error) { alert(`Failed to connect: ${error}`); return }
    window.open(url, '_blank')
  }

  async function manageSubscription() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  )

  const setupDone = xeroConnected && hmrcConnected && properties.length > 0
  const openObligations = obligations.filter(o => o.status === 'open')
  const overdueObligations = obligations.filter(o => o.status === 'overdue')

  function propertyName(id: string) {
    return properties.find(p => p.id === id)?.name || 'Property'
  }

  function daysUntil(date: string) {
    const diff = new Date(date).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Yield</span>
        <div className="flex items-center gap-4">
          <button onClick={manageSubscription} className="text-sm text-gray-500 hover:text-gray-900">Billing</button>
          <span className="text-sm text-gray-500">{profile?.email}</span>
          <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.full_name ? `Hi, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">MTD Income Tax — {new Date().getFullYear()}-{String(new Date().getFullYear() + 1).slice(2)} tax year</p>
        </div>

        {/* Setup steps (if not complete) */}
        {!setupDone && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Setup</h2>
            {[
              { label: 'Connect Xero', done: xeroConnected, action: () => connectOAuth('xero'), href: null, desc: 'Import transactions automatically' },
              { label: 'Connect HMRC', done: hmrcConnected, action: () => connectOAuth('hmrc'), href: null, desc: 'Authorise quarterly submissions' },
              { label: 'Add a property', done: properties.length > 0, action: null, href: '/dashboard/properties/new', desc: 'Register your rental property' },
            ].map((step, i) => (
              <div key={step.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
                {step.done
                  ? <span className="text-sm text-green-600 font-medium">Connected</span>
                  : step.action
                    ? <button onClick={step.action} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Connect</button>
                    : <Link href={step.href!} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Connect</Link>
                }
              </div>
            ))}
          </div>
        )}

        {/* Overdue obligations */}
        {overdueObligations.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-2">⚠ {overdueObligations.length} overdue submission{overdueObligations.length > 1 ? 's' : ''}</p>
            {overdueObligations.map(ob => (
              <div key={ob.id} className="flex items-center justify-between text-sm">
                <span className="text-red-600">{propertyName(ob.property_id)} — {ob.period_start} to {ob.period_end}</span>
                <Link href={`/dashboard/properties/${ob.property_id}/transactions`} className="text-red-700 font-medium hover:underline">Submit now</Link>
              </div>
            ))}
          </div>
        )}

        {/* Open obligations */}
        {openObligations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming submissions</h2>
            {openObligations.map(ob => {
              const days = daysUntil(ob.due_date)
              return (
                <div key={ob.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{propertyName(ob.property_id)}</p>
                    <p className="text-xs text-gray-500">Quarter: {ob.period_start} → {ob.period_end}</p>
                    <p className={`text-xs font-medium mt-1 ${days <= 14 ? 'text-amber-600' : 'text-gray-400'}`}>
                      Due {ob.due_date} {days <= 30 ? `(${days} days)` : ''}
                    </p>
                  </div>
                  <Link href={`/dashboard/properties/${ob.property_id}/transactions`} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Prepare →
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Properties */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Properties</h2>
            <Link href="/dashboard/properties/new" className="text-sm text-gray-900 font-medium hover:underline">+ Add property</Link>
          </div>
          {properties.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400 mb-4">No properties yet</p>
              <Link href="/dashboard/properties/new" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Add your first property</Link>
            </div>
          ) : (
            properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/dashboard/properties/${p.id}/transactions`} className="text-sm text-gray-600 hover:text-gray-900">Transactions</Link>
                  <Link href={`/dashboard/properties/${p.id}/submit`} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Submit →</Link>
                </div>
              </div>
            ))
          )}
        </div>

        {obligations.filter(o => o.status === 'fulfilled').length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Submitted</h2>
            {obligations.filter(o => o.status === 'fulfilled').map(ob => (
              <div key={ob.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between opacity-60">
                <p className="text-sm text-gray-600">{propertyName(ob.property_id)} — {ob.period_start} to {ob.period_end}</p>
                <span className="text-xs text-green-600 font-medium">✓ Submitted</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
