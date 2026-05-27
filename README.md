# SimpleNursing Social Intelligence Dashboard

> **Live link:** _will populate once GitHub Pages is enabled_ → `https://samcolibri.github.io/<repo>/pulse/`

Real-time, public, hourly-refreshed social analytics dashboard for the **SimpleNursing** brand. Covers **TikTok, Instagram, Facebook, Pinterest** across owned + competitor accounts. Built to replace the manual `Social Performance Tracker (2026).xlsx` workflow with live, agent-grade intelligence.

![status](https://img.shields.io/badge/build-passing-62d070?style=flat) ![data](https://img.shields.io/badge/refresh-hourly-fc3467?style=flat) ![pinterest](https://img.shields.io/badge/Pinterest-API_v5-e60036?style=flat) ![apify](https://img.shields.io/badge/Apify-IG_%26_TT-75c7e6?style=flat)

---

## What this is

| Surface | Source | Status |
|--------|--------|--------|
| **TikTok** owned + 3 competitors | Apify `clockworks~free-tiktok-scraper` | ✅ Live |
| **Instagram** owned + 3 competitors | Apify `apify~instagram-profile-scraper` | ✅ Live |
| **Pinterest** owned | Pinterest API v5 (direct token) | ✅ Live |
| **Facebook** owned | Meta Graph API v22 | ⚠️ Pending Business App ID |
| **Trending hashtags** (8 nursing tags) | Apify hashtag scraper | ✅ Live (best-effort) |
| **YoY 2026 baseline** (Jan-Apr) | Excel tracker | ✅ Embedded |

Every hour, a GitHub Action runs `scripts/fetch-data.mjs`, writes JSON to `public/data/`, commits it, and triggers a Pages rebuild. The dashboard reads those static JSON files — no server, no cold starts, no API keys leaving the repo's encrypted secrets.

---

## Architecture

```mermaid
flowchart LR
    A[GitHub Actions cron<br/>every hour] -->|run| B[scripts/fetch-data.mjs]
    B -->|Apify API| C1[(TikTok)]
    B -->|Apify API| C2[(Instagram)]
    B -->|Pinterest v5| C3[(Pinterest)]
    B -->|Meta v22| C4[(Facebook - pending)]
    B -->|writes| D[public/data/*.json]
    D -->|git commit| E[main branch]
    E -->|triggers| F[Pages deploy workflow]
    F -->|next build --output=export| G[out/]
    G -->|GitHub Pages| H[Live dashboard URL]
    H -->|browser fetches| I[useStaticData hook]
    I -->|reads| D
    style A fill:#fc3467,stroke:#fc3467,color:#fff
    style B fill:#75c7e6,stroke:#75c7e6,color:#000
    style D fill:#fad74f,stroke:#fad74f,color:#000
    style H fill:#62d070,stroke:#62d070,color:#000
```

### Data flow per refresh cycle

```mermaid
sequenceDiagram
    participant GH as GitHub Actions
    participant FS as fetch-data.mjs
    participant AP as Apify
    participant PI as Pinterest API
    participant GIT as git
    participant PG as Pages Build

    Note over GH: cron: 5 * * * *
    GH->>FS: node scripts/fetch-data.mjs
    par parallel platform fetches
        FS->>AP: scrape TikTok (4 accounts × 10 posts)
        AP-->>FS: tiktok.json
    and
        FS->>AP: scrape Instagram (4 accounts × 8 posts)
        AP-->>FS: instagram.json
    and
        FS->>PI: profile + 30d analytics + boards + pins
        PI-->>FS: pinterest.json
    end
    FS->>GIT: git add public/data/ && commit
    GIT-->>PG: push triggers deploy workflow
    PG->>PG: next build (output: export)
    PG-->>GH: live URL updated
```

### Repo layout

```
.
├── app/
│   ├── pulse/page.jsx        ← unified 4-platform dashboard (main view)
│   ├── posts/                ← per-post browser
│   ├── competitors/          ← deep competitor view
│   ├── trends/               ← hashtag + velocity insights
│   ├── recommendations/      ← AI content suggestions
│   └── settings/             ← connection status + config
├── lib/
│   ├── pinterest.ts          ← Pinterest API v5 client
│   ├── apify.ts              ← Apify actor wrappers
│   └── data.ts               ← Excel-derived baseline seed data
├── scripts/
│   └── fetch-data.mjs        ← cron-runnable data fetcher
├── public/data/              ← refreshed JSON (committed by Action)
│   ├── tiktok.json
│   ├── instagram.json
│   ├── pinterest.json
│   ├── hashtags.json
│   ├── meta.json
│   └── last-updated.json
├── .github/workflows/
│   ├── refresh-data.yml      ← hourly cron, commits JSON
│   └── deploy.yml            ← builds + publishes to Pages
└── next.config.ts            ← output: 'export', basePath dynamic
```

---

## Local development

### Prerequisites
- Node.js 22+
- Apify account ([apify.com](https://apify.com), free tier ~$5/mo credits is enough)
- Pinterest API v5 access token (long-lived; not OAuth needed)

### Setup
```bash
git clone https://github.com/samcolibri/<repo>.git
cd <repo>
npm ci
cp .env.example .env.local  # then fill in your tokens
npm run refresh              # pulls fresh data into public/data/
npm run dev                  # http://localhost:3000/pulse
```

### Environment variables

| Variable | Required | Where used |
|----------|----------|------------|
| `APIFY_TOKEN` | ✅ | TikTok + Instagram + Facebook scraping |
| `PINTEREST_ACCESS_TOKEN` | ✅ | Pinterest API v5 |
| `META_PAGE_ACCESS_TOKEN` | ❌ | Owned FB Page insights (when ready) |
| `IG_BUSINESS_ACCOUNT_ID` | ❌ | Owned IG Business insights |
| `META_PAGE_ID` | ❌ | Facebook Page ID |
| `ANTHROPIC_API_KEY` | ❌ | AI recommendation generation |

**Never commit `.env.local`.** It is gitignored. In CI, all values come from encrypted GitHub repository secrets.

### Manually refresh data
```bash
npm run refresh   # 60-90 seconds, hits all platform APIs
```

### Build static export
```bash
npm run export    # writes ./out/
```

---

## Deployment to GitHub Pages

The repo deploys automatically on every push to `main` via `.github/workflows/deploy.yml`. To set up Pages on a fresh repo:

1. **Add repository secrets** (Settings → Secrets and variables → Actions):
   - `APIFY_TOKEN`
   - `PINTEREST_ACCESS_TOKEN`
   - (Optional) `META_PAGE_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`, `META_PAGE_ID`

2. **Enable Pages** (Settings → Pages):
   - Source: **GitHub Actions**

3. **First deploy:**
   - Push to `main` (or trigger `deploy.yml` manually)
   - First refresh: trigger `refresh-data.yml` manually to populate `public/data/`

4. **Hourly refresh** runs automatically once the workflow is on `main`.

---

## How the Excel was rebuilt 10x

The original `Social Performance Tracker (2026).xlsx` had 12 sheets covering:
- IG / FB / TT monthly hand-typed metrics
- YouTube weekly + daily
- Podcast (Buzzsprout/Spotify/Apple)
- 2025↔2026 YoY comparisons
- 2026 budget vs spend

What this dashboard does on top of it:

| Excel limitation | Dashboard upgrade |
|------------------|------------------|
| Manual monthly data entry | Hourly auto-scrape via Apify + Pinterest API |
| Owned accounts only | Owned **+ 6 direct competitors** tracked in real-time |
| No per-post breakdown | Top 8 viral posts ranked across all accounts every hour |
| No topic intelligence | Auto-clusters viral content into NCLEX/ECG/Pharm/etc topic buckets |
| Static snapshots | Live followers/views/engagement (1.2M+ TT followers tracked live) |
| Single user (Excel file) | Public dashboard, anyone with the link can view |
| No alerting | Connection status + last-refresh timestamp visible at all times |

---

## Security

- `.env.local` is **gitignored**; never committed
- All production secrets live in **GitHub repository secrets** (encrypted at rest)
- The repo contains **zero hardcoded credentials** (verified via `git log -S` scan)
- Pinterest token can be revoked at [developers.pinterest.com](https://developers.pinterest.com) at any time
- Apify token can be rotated at [console.apify.com/account/integrations](https://console.apify.com/account/integrations)
- **Platform passwords (IG/TT/Pinterest login passwords) were shared in chat during initial setup and should be considered leaked → rotate them.** OAuth tokens only from here on.

---

## Stack

- **Next.js 16.2.6** App Router + static export
- **React 19.2** with TanStack Query for client cache
- **Tailwind CSS v4** dark mode default
- **Recharts** for line/bar/area charts
- **Apify** as the universal scraper (cheaper + faster than direct platform APIs for IG/TT in 2026)
- **Pinterest API v5** direct integration
- **GitHub Actions** for cron + Pages deploy
- **GitHub Pages** for free public hosting

---

## Roadmap

- [ ] Wire Meta Graph API for owned FB/IG Business insights once App ID is approved
- [ ] Add YouTube Data API v3 channel + Shorts metrics
- [ ] Add Podcast metrics (Buzzsprout API + Spotify API)
- [ ] AI-generated content recommendations via Claude API (`ANTHROPIC_API_KEY` ready)
- [ ] Slack notification on competitor viral threshold breach
- [ ] Per-post conversion attribution (UTM → GA4 → Shopify)

---

Built for Sam @ SimpleNursing. Pull requests welcome.

🤖 Co-built with Claude Code
