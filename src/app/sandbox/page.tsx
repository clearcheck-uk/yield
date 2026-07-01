'use client'
import { useState } from 'react'

type TestUser = {
  userId: string
  password: string
  userFullName: string
  nino: string
  groupIdentifier: string
  saUtr?: string
  mtdItId?: string
}

export default function SandboxPage() {
  const [user, setUser] = useState<TestUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function create() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/sandbox/create-test-user', { method: 'POST' })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setUser(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">HMRC Sandbox</h1>
          <p className="text-sm text-gray-500 mt-1">Create a test individual for sandbox testing</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-4">
          <button
            onClick={create}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create test user'}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {user && (
            <div className="space-y-3 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono space-y-2">
                <div><span className="text-gray-500">Username:</span> <span className="font-bold text-gray-900 select-all">{user.userId}</span></div>
                <div><span className="text-gray-500">Password:</span> <span className="font-bold text-gray-900 select-all">{user.password}</span></div>
                <div><span className="text-gray-500">NI Number:</span> <span className="font-bold text-green-700 select-all">{user.nino}</span></div>
                {user.saUtr && <div><span className="text-gray-500">SA UTR:</span> <span className="font-bold text-gray-900 select-all">{user.saUtr}</span></div>}
                {user.mtdItId && <div><span className="text-gray-500">MTD ID:</span> <span className="font-bold text-gray-900 select-all">{user.mtdItId}</span></div>}
              </div>
              <p className="text-xs text-gray-400">Use this NI number in the HMRC setup step after connecting. Use the username + password to sign in on the HMRC sandbox login page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
