export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Terms of service · v1</div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
        <p><strong className="text-white">Effective date:</strong> May 27, 2026</p>

        <h2 className="text-lg font-bold text-white mt-6">1. About this app</h2>
        <p>SimpleNursing Pulse is an internal analytics dashboard for the SimpleNursing brand, hosted at <span className="mono">samcolibri.github.io/simplenursing-pulse</span>. It is offered as-is with no warranty.</p>

        <h2 className="text-lg font-bold text-white mt-6">2. Acceptable use</h2>
        <p>This dashboard is intended for internal use by the SimpleNursing marketing team. It is publicly viewable because it is hosted on GitHub Pages, but it contains no interactive user features (no login, no submissions, no comments).</p>

        <h2 className="text-lg font-bold text-white mt-6">3. Data accuracy</h2>
        <p>Numbers shown are pulled from third-party platforms via their official APIs and from manually-maintained Excel records. We make best efforts to keep them accurate but cannot guarantee zero discrepancy. The <a href="/simplenursing-pulse/sources/" className="text-[#75c7e6] hover:underline">Sources page</a> documents the provenance of every metric.</p>

        <h2 className="text-lg font-bold text-white mt-6">4. Platform compliance</h2>
        <p>This dashboard uses official APIs from Meta (Facebook + Instagram), Pinterest, and TikTok in accordance with each platform's Developer Terms. Competitor data is gathered via Apify, which respects each platform's robots.txt and public-data terms.</p>

        <h2 className="text-lg font-bold text-white mt-6">5. No content publishing</h2>
        <p>This app never publishes, posts, modifies, or deletes content on any social platform. All API access is read-only.</p>

        <h2 className="text-lg font-bold text-white mt-6">6. Liability</h2>
        <p>The dashboard is provided as-is. SimpleNursing and the dashboard authors are not liable for business decisions made based on the data shown.</p>

        <h2 className="text-lg font-bold text-white mt-6">7. Changes</h2>
        <p>These terms may be updated. Updates will be reflected in the version date at the top of this page.</p>
      </div>
    </main>
  )
}
