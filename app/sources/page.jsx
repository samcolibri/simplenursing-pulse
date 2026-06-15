'use client'
import { useEffect, useState } from 'react'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()
const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function useStaticData(file) {
  const [d, setD] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(setD).catch(() => {}) }, [file])
  return d
}

function Section({ num, title, source, badge, children }) {
  return (
    <section className="card-strong p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">{num}</div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
          <div className="text-[11px] text-[var(--text-dim)] mt-1 mono">{source}</div>
        </div>
        {badge && <span className="mono text-[10px] uppercase px-2 py-1 rounded-full border border-[#62d070]/40 text-[#62d070] bg-[#62d070]/10 shrink-0">{badge}</span>}
      </div>
      {children}
    </section>
  )
}

function Row({ label, value, green }) {
  return (
    <div className="flex justify-between py-1.5 text-xs sm:text-sm border-b border-[var(--border)]/40">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={'font-medium mono ' + (green ? 'text-[#62d070]' : '')}>{value}</span>
    </div>
  )
}

function Tag({ label, color = '#75c7e6' }) {
  return <span className="mono text-[9px] uppercase px-1.5 py-0.5 rounded border" style={{ color, borderColor: color + '40', background: color + '10' }}>{label}</span>
}

export default function SourcesPage() {
  const tt  = useStaticData('tiktok')
  const ig  = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const yt  = useStaticData('youtube')
  const meta = useStaticData('last-updated')

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Data provenance · 100% live APIs</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Sources &amp; Connections</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">4 live sources — Apify, Pinterest API v5, YouTube Data API v3, Airtable. No spreadsheets. Refreshed weekly every Monday.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag label="Apify · TikTok + Instagram" color="#75c7e6" />
          <Tag label="Pinterest API v5" color="#e60036" />
          <Tag label="YouTube Data API v3" color="#ff0000" />
          <Tag label="Airtable brain · weekly" color="#fad74f" />
        </div>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#62d070]/10 text-[#62d070] text-xs font-medium border border-[#62d070]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#62d070] live-dot" />
          last run {meta?.fetched_at?.slice(0, 16).replace('T', ' ') || '—'} UTC
        </div>
      </div>

      {/* SOURCE 1: APIFY */}
      <Section num="01 · apify" title="TikTok + Instagram — live scraping" source="4 actors · @simplenursing + 7 competitors · 60 posts each · 10 nursing search queries" badge="live · weekly">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Actors</div>
            <Row label="clockworks~free-tiktok-scraper" value="60 posts / profile" />
            <Row label="clockworks~tiktok-scraper" value="10 nursing search queries" />
            <Row label="apify~instagram-profile-scraper" value="20 posts / profile" />
            <Row label="apify~instagram-scraper" value="10 nursing hashtags" />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Competitors tracked (7)</div>
            {['nurseinthemaking','registerednursern','yournursingeducator','archernursing','uworld','nclexbootcamp','nursingstudybyally'].map(h => (
              <Row key={h} label={'@' + h} value="TikTok + Instagram" />
            ))}
          </div>
          {tt?.owned && (
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">@simplenursing TikTok · live</div>
              <Row label="Followers" value={fmtFull(tt.owned.followers)} />
              <Row label="Hearts" value={fmtFull(tt.owned.hearts)} />
              <Row label="Posts captured (90d)" value={fmtFull(tt.owned.recent_posts?.length)} />
              <Row label="Top post views" value={fmtFull(tt.owned.recent_posts?.slice().sort((a,b)=>(b.views||0)-(a.views||0))[0]?.views)} />
            </div>
          )}
          {ig?.owned && (
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">@{ig.owned.handle} Instagram · live</div>
              <Row label="Followers" value={fmtFull(ig.owned.followers)} />
              <Row label="Posts captured (90d)" value={fmtFull(ig.owned.recent_posts?.length)} />
              <Row label="Top post engagement" value={fmtFull(ig.owned.recent_posts?.slice().sort((a,b)=>(b.video_views||b.likes||0)-(a.video_views||a.likes||0))[0]?.video_views || ig.owned.recent_posts?.slice().sort((a,b)=>(b.likes||0)-(a.likes||0))[0]?.likes)} />
            </div>
          )}
        </div>
      </Section>

      {/* SOURCE 2: PINTEREST */}
      <Section num="02 · pinterest api v5" title="Pinterest — official API" source="api.pinterest.com/v5 · /user_account · /analytics · /boards · /pins" badge="live · weekly">
        {pin?.profile ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Account · live</div>
              <Row label="Username" value={'@' + pin.profile.username} />
              <Row label="Monthly views" value={fmtFull(pin.profile.monthly_views)} />
              <Row label="Followers" value={fmtFull(pin.profile.follower_count)} />
              <Row label="Total pins" value={fmtFull(pin.profile.pin_count)} />
            </div>
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">30-day analytics</div>
              <Row label="Impressions" value={fmtFull(pin.summary?.impressions)} />
              <Row label="Saves" value={fmtFull(pin.summary?.saves)} />
              <Row label="Pin clicks" value={fmtFull(pin.summary?.pin_clicks)} />
              <Row label="Outbound clicks" value={fmtFull(pin.summary?.outbound_clicks)} />
            </div>
          </div>
        ) : <div className="text-xs text-[var(--text-muted)]">Loading Pinterest…</div>}
      </Section>

      {/* SOURCE 3: YOUTUBE */}
      <Section num="03 · youtube data api v3" title="YouTube — live video performance" source="googleapis.com/youtube/v3 · channel UCUxQWmWk1_Hk9iDRKvhH29Q · last 90 days" badge="live · weekly">
        {yt?.channel ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Channel · live</div>
              <Row label="Channel" value={yt.channel.title} />
              <Row label="Subscribers" value={fmt(yt.channel.subscribers)} />
              <Row label="Total channel views" value={fmt(yt.channel.total_views)} />
              <Row label="Total videos" value={fmtFull(yt.channel.video_count)} />
            </div>
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Last 90 days</div>
              <Row label="Videos published" value={fmtFull(yt.videos?.length)} />
              <Row label="Top video views" value={fmtFull(yt.videos?.slice().sort((a,b)=>(b.views||0)-(a.views||0))[0]?.views)} />
              <Row label="Top video" value={(yt.videos?.slice().sort((a,b)=>(b.views||0)-(a.views||0))[0]?.title || '—').slice(0, 45) + '…'} />
            </div>
          </div>
        ) : <div className="text-xs text-[var(--text-muted)]">Loading YouTube…</div>}
      </Section>

      {/* SOURCE 4: AIRTABLE */}
      <Section num="04 · airtable brain" title="Airtable — agent memory · auto-sync" source="7 tables · upserted every weekly fetch · key in GitHub Secrets" badge="auto-sync · weekly">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Tables</div>
            <Row label="Live_Stats" value="followers · upserted each run" />
            <Row label="Our_Posts" value="upserted by Post ID · 90d window" />
            <Row label="Competitor_Posts" value="7 accounts · upserted by Post ID" />
            <Row label="YouTube_Videos" value="upserted by Video ID · 90d window" />
            <Row label="Trending_Topics" value="topic scores · upserted by run date" />
            <Row label="Team_Notes" value="per-range notes from dashboard" />
            <Row label="Fetch_Log" value="every run logged with counts" />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Access</div>
            <Row label="API key" value="GitHub Secrets only — never in code" green />
            <Row label="Base access" value="Private · write-protected" green />
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1 mt-3">Agent capabilities</div>
            <Row label="Competitor trend tracking across runs" value="✓" green />
            <Row label="Topic velocity week-over-week" value="✓" green />
            <Row label="Run reliability + failure tracking" value="✓" green />
            <Row label="Team interpretation per date range" value="✓" green />
          </div>
        </div>
      </Section>

      {/* WHAT'S PENDING */}
      <Section num="05 · pending" title="Not yet connected" source="Explicit transparency — these are not wired yet">
        <div className="space-y-1">
          <Row label="Facebook owned insights" value="Needs Meta Business App approval + Page Access Token" />
          <Row label="Instagram Business insights (native)" value="Needs Meta Business App (same as FB)" />
          <Row label="GA4 sessions / free trials / revenue" value="Needs GA4 Property ID + service account key" />
          <Row label="Podcast (Buzzsprout · Spotify · Apple)" value="Not yet scoped" />
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-3">
          When you are ready to unlock GA4 or Facebook: bring the credentials and we wire them in one session. Every new source follows the same pattern — fetch in <span className="mono">scripts/fetch-data.mjs</span>, write to <span className="mono">public/data/</span>, display on Pulse.
        </p>
      </Section>

      {/* AUDIT */}
      <Section num="06 · audit" title="Re-verify yourself" source="Everything is reproducible">
        <pre className="bg-[var(--bg-card-2)] p-3 rounded-lg mono text-[11px] overflow-x-auto text-[var(--text-muted)]">{`# Trigger a manual refresh
gh workflow run refresh-data.yml --repo samcolibri/simplenursing-pulse

# Inspect raw data after a run
cat public/data/youtube.json | jq '.channel'
cat public/data/tiktok.json  | jq '.owned.followers'
cat public/data/instagram.json | jq '.owned.followers'
cat public/data/pinterest.json | jq '.profile.monthly_views'
cat public/data/last-updated.json   # pipeline health per source`}</pre>
      </Section>
    </main>
  )
}
