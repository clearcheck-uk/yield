export const metadata = {
  title: 'Privacy Policy — Yield',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: 1 July 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who we are</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Yield is a Making Tax Digital (MTD) Income Tax software service for UK landlords. The data controller is
            Yield (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). Contact us at{' '}
            <a href="mailto:support@yield-mtd.co.uk" className="text-blue-600 underline">support@yield-mtd.co.uk</a>.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            If you believe you&apos;ve found a security vulnerability or wish to report a security incident, please email{' '}
            <a href="mailto:support@yield-mtd.co.uk" className="text-blue-600 underline">support@yield-mtd.co.uk</a>{' '}
            — see also our{' '}
            <a href="/.well-known/security.txt" className="text-blue-600 underline">security.txt</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What data we collect</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li>Your name and email address (for account creation)</li>
            <li>Your National Insurance number (to authenticate with HMRC on your behalf)</li>
            <li>Your HMRC OAuth tokens (to submit MTD returns)</li>
            <li>Property details you enter (address, description)</li>
            <li>Income and expense transactions you add or import from Xero</li>
            <li>Submission history (quarterly updates submitted to HMRC)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How we use your data</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li>To submit quarterly MTD Income Tax updates to HMRC on your behalf</li>
            <li>To retrieve your property business obligations from HMRC</li>
            <li>To display your income and expense summaries in the dashboard</li>
            <li>To provide customer support</li>
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            We do not sell your data to third parties. We do not use your data for advertising.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Legal basis</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We process your data under <strong>contract</strong> (to deliver the service you subscribed to) and
            where necessary to comply with our legal obligations under UK GDPR.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Where your data is stored</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your data is stored in the United States (Supabase and Vercel). Both providers are covered by
            the UK–US Data Bridge adequacy agreement, which provides equivalent data protection to UK GDPR.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. How long we keep your data</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We keep your account data and submission history for 7 years from the date of each submission,
            in line with HMRC record-keeping requirements. You may request earlier deletion of account data
            by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your rights</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-2">Under UK GDPR you have the right to:</p>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Restrict or object to processing</li>
            <li>Data portability</li>
          </ul>
          <p className="text-gray-600 text-sm leading-relaxed mt-3">
            To exercise any of these rights, email{' '}
            <a href="mailto:support@yield-mtd.co.uk" className="text-blue-600 underline">support@yield-mtd.co.uk</a>.
            You also have the right to lodge a complaint with the{' '}
            <a href="https://ico.org.uk" className="text-blue-600 underline" target="_blank" rel="noreferrer">
              Information Commissioner&apos;s Office (ICO)
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We use strictly necessary session cookies to keep you logged in and to securely handle
            HMRC OAuth authorisation. We do not use tracking or advertising cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Third-party services</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li><strong>HMRC</strong> — receives your MTD submissions as required by law</li>
            <li><strong>Xero</strong> — optionally, if you connect Xero to import transactions</li>
            <li><strong>Stripe</strong> — processes subscription payments (they handle payment data; we never see your card details)</li>
            <li><strong>Supabase</strong> — database hosting</li>
            <li><strong>Vercel</strong> — application hosting</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to this policy</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We will notify you by email if we make material changes to this privacy policy.
          </p>
        </section>
      </div>
    </div>
  )
}
