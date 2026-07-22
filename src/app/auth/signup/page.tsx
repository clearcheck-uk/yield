'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<'landlord' | 'accountant'>('landlord')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900'

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')

    let signUpError = null
    let signUpData = null
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      signUpError = result.error
      signUpData = result.data
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error — please try again.')
      setLoading(false)
      return
    }

    if (signUpError) {
      const msg = typeof signUpError.message === 'string' && signUpError.message
        ? signUpError.message
        : JSON.stringify(signUpError)
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Sign in instead.')
      } else if (msg.toLowerCase().includes('rate')) {
        setError('Too many attempts. Please wait a minute and try again.')
      } else {
        setError(msg || 'Something went wrong. Please try again.')
      }
      setLoading(false)
      return
    }

    // If email confirmation is off, user is immediately logged in
    if (signUpData?.session) {
      router.push('/dashboard')
      return
    }

    setStep('otp')
    setLoading(false)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'signup',
    })

    if (error) {
      setError('Invalid or expired code. Check your email and try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function resend() {
    setError('')
    await supabase.auth.resend({ type: 'signup', email })
    setError('New code sent — check your inbox.')
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <Link href="/" className="block text-center text-xl font-semibold text-gray-900 mb-8">Yield</Link>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
              <p className="text-sm text-gray-500 mt-1">We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span></p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
                <input
                  id="otp"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={inputClass + ' text-center text-2xl tracking-widest font-mono'}
                  autoFocus
                />
              </div>
              {error && <p className={`text-sm ${error.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify email'}
              </button>
              <button type="button" onClick={resend} className="w-full text-sm text-gray-500 hover:text-gray-900">
                Resend code
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center text-xl font-semibold text-gray-900 mb-8">Yield</Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Create account</h1>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input id="fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={inputClass + ' pr-10'}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-2">
                {(['landlord', 'accountant'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg text-sm font-medium border capitalize ${
                      role === r ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
