import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-semibold text-gray-900">Yield</span>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/auth/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Making Tax Digital for Income Tax — mandatory from April 2026
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
          MTD Income Tax for<br />UK landlords, sorted.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          HMRC now requires landlords earning over £50,000 to submit quarterly tax updates digitally.
          Yield connects to your accounts, handles Section 24 automatically, and submits to HMRC in minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup" className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700">
            Start 14-day free trial
          </Link>
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
            Already have an account →
          </Link>
        </div>
        <p className="text-xs text-gray-600 mt-4">No credit card required during trial</p>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Connect your accounts',
                desc: 'Link Xero to automatically import rental income and expenses, or add transactions manually.',
              },
              {
                step: '2',
                title: 'Review your figures',
                desc: 'Yield categorises your transactions, applies Section 24 mortgage interest rules, and shows your net profit.',
              },
              {
                step: '3',
                title: 'Submit to HMRC',
                desc: 'One click sends your quarterly update directly to HMRC. Deadlines are tracked so you never miss one.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Xero integration', desc: 'Import rental income and expenses directly from Xero. No manual data entry for connected landlords.' },
            { title: 'Section 24 handled', desc: 'Mortgage interest is automatically treated as a basic rate tax credit, not a deduction — exactly as HMRC requires.' },
            { title: 'Quarterly submissions', desc: 'Submit Q1–Q4 updates to HMRC directly from the app. Obligation deadlines shown on your dashboard.' },
            { title: 'Multiple properties', desc: 'Manage up to 10 rental properties under one account, each with its own income and expense tracking.' },
            { title: 'Accountant access', desc: 'Accountants can manage multiple landlord clients under one login with agent authorisation.' },
            { title: 'Secure by design', desc: 'Your HMRC credentials are never stored. OAuth tokens are encrypted. Fraud prevention headers sent on every request.' },
          ].map((f) => (
            <div key={f.title} className="p-6 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
          <p className="text-gray-500 text-center text-sm mb-12">14-day free trial on all plans. Cancel anytime.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Landlord</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">£35<span className="text-base font-normal text-gray-500">/month</span></div>
              <p className="text-sm text-gray-500 mb-6">For individual landlords managing their own portfolio</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ Up to 10 properties</li>
                <li>✓ Xero integration</li>
                <li>✓ Quarterly HMRC submissions</li>
                <li>✓ Section 24 calculator</li>
                <li>✓ Manual transaction entry</li>
              </ul>
              <Link href="/auth/signup" className="block text-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                Start free trial
              </Link>
            </div>
            <div className="bg-white border-2 border-gray-900 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-full">Popular</div>
              <h3 className="font-semibold text-gray-900 mb-1">Accountant</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">£150<span className="text-base font-normal text-gray-500">/month</span></div>
              <p className="text-sm text-gray-500 mb-6">For accountants managing multiple landlord clients</p>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✓ Unlimited clients</li>
                <li>✓ Xero integration</li>
                <li>✓ Bulk quarterly submissions</li>
                <li>✓ Section 24 calculator</li>
                <li>✓ Agent authorisation</li>
                <li>✓ Priority support</li>
              </ul>
              <Link href="/auth/signup" className="block text-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Common questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Who needs to use MTD for Income Tax?',
              a: 'From April 2026, landlords and self-employed people with income over £50,000 must submit quarterly updates to HMRC digitally using compatible software. The threshold drops to £30,000 in April 2027.',
            },
            {
              q: 'What is Section 24 and why does it matter?',
              a: 'Section 24 restricts how landlords can claim mortgage interest. Instead of deducting it from rental income, you get a 20% basic rate tax credit. Yield handles this automatically so you never miscalculate.',
            },
            {
              q: 'Do I need Xero to use Yield?',
              a: 'No. You can add income and expense transactions manually within Yield. Xero is an optional integration that saves time if you already use it for bookkeeping.',
            },
            {
              q: 'Is my HMRC data safe?',
              a: 'Yes. Yield uses HMRC\'s official OAuth system — your HMRC password is never shared with or stored by Yield. You authorise Yield directly through HMRC\'s own login page.',
            },
            {
              q: 'Can my accountant use Yield on my behalf?',
              a: 'Yes. Accountants can sign up for the Accountant plan and submit on behalf of multiple landlord clients using HMRC\'s agent authorisation system.',
            },
          ].map((item) => (
            <div key={item.q} className="border-b border-gray-100 pb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to get compliant?</h2>
          <p className="text-gray-400 text-sm mb-8">Start your 14-day free trial. No credit card needed.</p>
          <Link href="/auth/signup" className="bg-white text-gray-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 inline-block">
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm text-gray-600">© {new Date().getFullYear()} Yield. Making Tax Digital Income Tax software.</span>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          <a href="mailto:support@yield-mtd.co.uk" className="hover:text-gray-900">Contact</a>
        </div>
      </footer>
    </main>
  )
}
