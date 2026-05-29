'use client'
import { useEffect, useState } from 'react'
import {
  INSTAGRAM_2026, FACEBOOK_2026, TIKTOK_2026,
  YOUTUBE_2026, PODCAST_2026, BUDGET_2026,
} from '@/lib/excel-data'

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()
const fmtMoney = (n) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function useStaticData(file) {
  const [d, setD] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(setD).catch(() => {}) }, [file])
  return d
}

function Section({ num, title, source, badge, lastFetched, children }) {
  return (
    <section className="card-strong p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">{num}</div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
          <div className="text-[11px] text-[var(--text-dim)] mt-1 mono">{source}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {badge && <span className="mono text-[10px] uppercase px-2 py-1 rounded-full border border-[#62d070]/40 text-[#62d070] bg-[#62d070]/10">{badge}</span>}
          {lastFetched && <span className="mono text-[9px] text-[var(--text-dim)]">fetched {lastFetched}</span>}
        </div>
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
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Data provenance · zero-fabrication audit</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Sources &amp; Connections</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">5 sources live — Excel, Apify, Pinterest, YouTube, Airtable. Nothing fabricated.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag label="Excel · Jan–Apr 2026" color="#62d070" />
          <Tag label="Apify · 7 competitors" color="#75c7e6" />
          <Tag label="Pinterest API v5" color="#e60036" />
          <Tag label="YouTube Data API v3" color="#ff0000" />
          <Tag label="Airtable brain · hourly" color="#fad74f" />
        </div>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#62d070]/10 text-[#62d070] text-xs font-medium border border-[#62d070]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#62d070] live-dot" />
          last run {meta?.fetched_at?.slice(0, 16).replace('T', ' ') || '—'} UTC
        </div>
      </div>

      {/* SOURCE 1: EXCEL */}
      <Section num="01 · excel" title="Social Performance Tracker (2026).xlsx" source="Transcribed cell-by-cell → lib/excel-data.ts · verified 2026-05-27" badge="Excel verified" lastFetched="2026-05-27">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">TikTok · Apr 2026</div>
            <Row label="Views" value={fmtFull(TIKTOK_2026.views[3])} />
            <Row label="New follows" value={fmtFull(TIKTOK_2026.new_follows[3])} />
            <Row label="Free trials" value={fmtFull(TIKTOK_2026.free_trials[3])} />
            <Row label="FTCR" value={(TIKTOK_2026.ftcr[3] * 100).toFixed(2) + '%'} />
            <Row label="GA4 revenue" value={fmtMoney(TIKTOK_2026.revenue_ga4[3])} green />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Instagram · Apr 2026</div>
            <Row label="Total views" value={fmtFull(INSTAGRAM_2026.total_views[3])} />
            <Row label="New follows" value={fmtFull(INSTAGRAM_2026.new_follows[3])} />
            <Row label="Free trials" value={fmtFull(INSTAGRAM_2026.free_trials[3])} />
            <Row label="FTCR" value={(INSTAGRAM_2026.ftcr[3] * 100).toFixed(2) + '%'} />
            <Row label="GA4 revenue" value={fmtMoney(INSTAGRAM_2026.revenue_ga4[3])} green />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Facebook · Apr 2026</div>
            <Row label="Views" value={fmtFull(FACEBOOK_2026.views[3])} />
            <Row label="New follows" value={fmtFull(FACEBOOK_2026.new_follows[3])} />
            <Row label="Free trials" value={fmtFull(FACEBOOK_2026.free_trials[3])} />
            <Row label="GA4 revenue" value={fmtMoney(FACEBOOK_2026.revenue_ga4[3])} green />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">YouTube · Apr 2026 (Excel)</div>
            <Row label="Long-form views" value={fmtFull(YOUTUBE_2026.longform_views[3])} />
            <Row label="Unique viewers" value={fmtFull(YOUTUBE_2026.unique_viewers[3])} />
            <Row label="Watch time (hrs)" value={fmtFull(YOUTUBE_2026.watch_time_hrs[3])} />
          </div>
        </div>
      </Section>

      {/* SOURCE 2: APIFY */}
      <Section num="02 · apify" title="TikTok + Instagram — live scraping" source="4 actors · owned + 7 competitors · 60 posts each · 10 nursing search queries" badge="live · hourly" lastFetched={tt?.fetched_at?.slice(0, 16).replace('T', ' ') + ' UTC'}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Actors</div>
            <Row label="clockworks~free-tiktok-scraper" value="60 posts / profile" />
            <Row label="clockworks~tiktok-scraper" value="10 nursing search queries" />
            <Row label="apify~instagram-profile-scraper" value="20 posts / profile" />
            <Row label="apify~instagram-scraper" value="10 nursing hashtags" />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Competitors (7 accounts)</div>
            {['nurseinthemaking','registerednursern','yournursingeducator','archernursing','uworld','nclexbootcamp','nursingstudybyally'].map(h => (
              <Row key={h} label={'@' + h} value="TikTok + Instagram" />
            ))}
          </div>
          {tt?.owned && (
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">@simplenursing TikTok · live</div>
              <Row label="Followers" value={fmtFull(tt.owned.followers)} />
              <Row label="Hearts" value={fmtFull(tt.owned.hearts)} />
              <Row label="Posts captured" value={fmtFull(tt.owned.recent_posts?.length)} />
              <Row label="Top post views" value={fmtFull(tt.owned.recent_posts?.[0]?.views)} />
            </div>
          )}
          {ig?.owned && (
            <div>
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">@{ig.owned.handle} Instagram · live</div>
              <Row label="Followers" value={fmtFull(ig.owned.followers)} />
              <Row label="Posts captured" value={fmtFull(ig.owned.recent_posts?.length)} />
            </div>
          )}
        </div>
      </Section>

      {/* SOURCE 3: PINTEREST */}
      <Section num="03 · pinterest api v5" title="Pinterest — official API" source="api.pinterest.com/v5 · /user_account · /analytics · /boards · /pins" badge="live · hourly" lastFetched={pin?.fetched_at?.slice(0, 16).replace('T', ' ') + ' UTC'}>
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

      {/* SOURCE 4: YOUTUBE */}
      <Section num="04 · youtube data api v3" title="YouTube — live video performance" source="googleapis.com/youtube/v3 · channel UCUxQWmWk1_Hk9iDRKvhH29Q · last 30 days" badge="live · hourly" lastFetched={yt?.fetched_at?.slice(0, 16).replace('T', ' ') + ' UTC'}>
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
              <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Last 30 days</div>
              <Row label="Videos published" value={fmtFull(yt.videos?.length)} />
              <Row label="Top video views" value={fmtFull(yt.videos?.[0]?.views)} />
              <Row label="Top video" value={(yt.videos?.[0]?.title || '—').slice(0, 45) + '…'} />
            </div>
          </div>
        ) : <div className="text-xs text-[var(--text-muted)]">Loading YouTube…</div>}
      </Section>

      {/* SOURCE 5: AIRTABLE */}
      <Section num="05 · airtable brain" title="Airtable — agent memory · auto-sync" source="Base appZ8hLqv6SSvnsig · 8 tables · upserted every hourly fetch" badge="auto-sync · hourly">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Tables</div>
            <Row label="Monthly_Metrics" value="12 rows · Excel source of truth" />
            <Row label="Live_Stats" value="followers · upserted each run" />
            <Row label="Our_Posts" value="upserted by Post ID · last 30d" />
            <Row label="Competitor_Posts" value="7 accounts · upserted by Post ID" />
            <Row label="YouTube_Videos" value="upserted by Video ID · last 30d" />
            <Row label="Trending_Topics" value="topic scores · upserted by run date" />
            <Row label="Team_Notes" value="per-month notes from dashboard" />
            <Row label="Fetch_Log" value="every run logged with counts" />
          </div>
          <div>
            <div className="text-[10px] mono uppercase text-[var(--text-dim)] mb-1">Agent capabilities</div>
            <Row label="Historical FTCR by platform + month" value="✓" green />
            <Row label="Competitor trend tracking across runs" value="✓" green />
            <Row label="Topic velocity week-over-week" value="✓" green />
            <Row label="Run reliability + failure tracking" value="✓" green />
            <Row label="Team interpretation per month" value="✓" green />
          </div>
        </div>
      </Section>

      {/* WHAT'S PENDING */}
      <Section num="06 · pending" title="Not yet connected" source="Explicit transparency — these are not wired" badge="pending">
        <Row label="Facebook owned insights (Meta Business API)" value="Pending FB App review" />
        <Row label="Instagram owned insights (Meta Business API)" value="Pending FB App review" />
        <Row label="Podcast live (Buzzsprout · Spotify · Apple)" value="Excel data only" />
      </Section>

      {/* AUDIT */}
      <Section num="07 · audit" title="Re-verify yourself" source="Everything is reproducible">
        <pre className="bg-[var(--bg-card-2)] p-3 rounded-lg mono text-[11px] overflow-x-auto text-[var(--text-muted)]">{`gh workflow run refresh-data.yml --repo samcolibri/simplenursing-pulse
cat public/data/youtube.json | jq '.channel'
cat public/data/tiktok.json  | jq '.owned.followers'`}</pre>
      </Section>
    </main>
  )
}
