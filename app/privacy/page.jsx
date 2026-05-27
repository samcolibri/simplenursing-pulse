export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Privacy policy · v1</div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
        <p><strong className="text-white">Effective date:</strong> May 27, 2026</p>

        <h2 className="text-lg font-bold text-white mt-6">1. What this dashboard is</h2>
        <p>SimpleNursing Pulse is an internal social-media analytics dashboard for the SimpleNursing brand. It aggregates publicly-available metrics (followers, post views, engagement) from social platforms we own and a small set of competitor accounts we monitor.</p>

        <h2 className="text-lg font-bold text-white mt-6">2. Data we read</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-white">Owned account metrics</strong> via OAuth-authorized API access (TikTok, Meta, Pinterest)</li>
          <li><strong className="text-white">Public competitor data</strong> via Apify-powered scrapers — only publicly-listed metrics, no private content</li>
          <li><strong className="text-white">Historical metrics</strong> manually transcribed from our internal Excel tracker</li>
        </ul>

        <h2 className="text-lg font-bold text-white mt-6">3. Data we do NOT collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>End-user identities — the dashboard is read-only and has no user accounts</li>
          <li>Private messages, DMs, or unpublished content</li>
          <li>Personal information of post commenters or followers</li>
          <li>Cookies or tracking pixels — no client-side analytics</li>
        </ul>

        <h2 className="text-lg font-bold text-white mt-6">4. How data is stored</h2>
        <p>All metrics are stored as static JSON files committed to a public GitHub repository (<a href="https://github.com/samcolibri/simplenursing-pulse" className="text-[#75c7e6] hover:underline">samcolibri/simplenursing-pulse</a>). The data refreshes hourly via GitHub Actions. API access tokens are stored as encrypted repository secrets and are never logged or exposed.</p>

        <h2 className="text-lg font-bold text-white mt-6">5. Data we share</h2>
        <p>No data is shared with third parties. No advertising networks, no analytics services, no data brokers.</p>

        <h2 className="text-lg font-bold text-white mt-6">6. Your rights</h2>
        <p>If you are a competitor whose account we monitor and you would like to be removed from this dashboard, contact the SimpleNursing marketing team at the email associated with the SimpleNursing TikTok / Instagram developer accounts. We will remove your account from scraping within 7 business days.</p>

        <h2 className="text-lg font-bold text-white mt-6">7. Token revocation</h2>
        <p>Any platform admin can revoke our API access at any time from their respective developer portal. This will immediately stop the dashboard from pulling new owned-account data.</p>

        <h2 className="text-lg font-bold text-white mt-6">8. Contact</h2>
        <p>This dashboard is operated by SimpleNursing. For privacy questions, contact the SimpleNursing marketing team.</p>

        <hr className="border-[var(--border)] my-8" />
        <p className="text-xs">This privacy policy is intentionally short because the dashboard's data scope is intentionally small. If you have questions about a specific data source, see the <a href="/simplenursing-pulse/sources/" className="text-[#75c7e6] hover:underline">Sources page</a>.</p>
      </div>
    </main>
  )
}
