import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-semibold text-gray-900">Yield</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/auth/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          HMRC Recognised Software
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6">
          MTD Income Tax for<br />landlords, done automatically
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Connect your Xero account, categorise your rental income and expenses,
          and submit your quarterly HMRC updates in minutes — not hours.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700">
            Start free trial
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Already have an account →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Xero connected', desc: 'Import your rental income and expenses directly from Xero. No manual data entry.' },
          { title: 'Section 24 calculated', desc: 'Automatic mortgage interest relief calculations under the Section 24 rules.' },
          { title: 'Submit to HMRC', desc: 'One-click quarterly submissions direct to HMRC. Deadlines tracked automatically.' },
        ].map((f) => (
          <div key={f.title} className="p-6 border border-gray-100 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Simple pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Landlord</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">£35<span className="text-base font-normal text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500 mb-6">For individual landlords managing their own portfolio</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Up to 10 properties</li>
              <li>✓ Xero integration</li>
              <li>✓ Quarterly HMRC submissions</li>
              <li>✓ Section 24 calculator</li>
            </ul>
            <Link href="/auth/signup" className="block text-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
              Start free trial
            </Link>
          </div>
          <div className="border-2 border-gray-900 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Accountant</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">£150<span className="text-base font-normal text-gray-500">/month</span></div>
            <p className="text-sm text-gray-500 mb-6">For accountants managing multiple landlord clients</p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ Unlimited clients</li>
              <li>✓ Xero integration</li>
              <li>✓ Bulk quarterly submissions</li>
              <li>✓ Section 24 calculator</li>
              <li>✓ Agent authorisation</li>
            </ul>
            <Link href="/auth/signup" className="block text-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Yield. HMRC Recognised Software for Making Tax Digital Income Tax.
      </footer>
    </main>
  )
}
