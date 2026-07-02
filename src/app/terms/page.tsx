export const metadata = {
  title: 'Terms and Conditions — Yield',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: 1 July 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. About Yield</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Yield is a Making Tax Digital (MTD) Income Tax software service that enables UK landlords to
            submit quarterly property income updates to HMRC. By creating an account you agree to these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Eligibility</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You must be aged 18 or over and a UK resident to use Yield. You are responsible for ensuring
            your use of the service complies with applicable UK tax law. Yield is not a tax adviser and
            nothing in the service constitutes tax advice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Your account</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            You are responsible for keeping your login credentials secure. You must notify us immediately
            if you suspect unauthorised access to your account. We may suspend accounts that breach these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. HMRC authorisation</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            To submit MTD returns on your behalf, you must authorise Yield through HMRC&apos;s OAuth service.
            You can revoke this authorisation at any time via your HMRC online account. Yield will only
            interact with HMRC for the purposes you explicitly request within the software.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Subscription and payment</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li>Subscriptions are billed monthly in advance via Stripe.</li>
            <li>You may cancel at any time; access continues until the end of the billing period.</li>
            <li>We do not offer refunds for partial months.</li>
            <li>We reserve the right to change pricing with 30 days&apos; notice by email.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your responsibilities</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-disc pl-5">
            <li>You are responsible for the accuracy of all income and expense data you enter.</li>
            <li>You are responsible for submitting returns within HMRC&apos;s deadlines.</li>
            <li>Yield submits the figures you provide — we are not responsible for errors in data you supply.</li>
            <li>You must not use the service for fraudulent or unlawful purposes.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Availability</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We aim to keep Yield available at all times but do not guarantee uninterrupted service. We are
            not liable for any loss arising from downtime, including missed HMRC filing deadlines caused by
            service unavailability. You should always allow sufficient time before deadlines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of liability</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            To the fullest extent permitted by law, Yield&apos;s total liability to you for any claim arising
            from use of the service is limited to the amount you paid in the 12 months preceding the claim.
            We are not liable for indirect, consequential, or special losses including tax penalties or interest.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Intellectual property</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            All software, design, and content within Yield is owned by us. You may not copy, modify, or
            distribute any part of the service without our written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Termination</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We may terminate your account if you breach these terms. You may close your account at any time
            by contacting us. On termination we will retain submission records for 7 years as required by
            HMRC rules, then delete your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Governing law</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            These terms are governed by the laws of England and Wales. Any disputes will be subject to the
            exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Changes to these terms</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We will notify you by email at least 30 days before making material changes to these terms.
            Continued use of Yield after the effective date constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Contact</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Questions about these terms:{' '}
            <a href="mailto:support@yield-mtd.co.uk" className="text-blue-600 underline">support@yield-mtd.co.uk</a>
          </p>
        </section>
      </div>
    </div>
  )
}
