/**
 * airtable-sync.mjs — Sync utility for the Pulse agent brain.
 * Imported by scripts/fetch-data.mjs to write live data to Airtable.
 */

const BASE_ID = 'appZ8hLqv6SSvnsig'
const TABLES = {
  Fetch_Log:        'tblO8OGzKass4QEgX',
  Monthly_Metrics:  'tblH7mMU3vuU71UEP',
  Live_Stats:       'tblsJGhFh7iNSt1R6',
  Our_Posts:        'tblYXbfMwAepUdPU4',
  Competitor_Posts: 'tblqAfSQrFcKPGLwn',
  YouTube_Videos:   'tblaweBYpUZMt1raj',
  Trending_Topics:  'tblyOR4XJ166vbYyF',
  Team_Notes:       'tblStHsUTyhOGFqUz',
}

const BASE = 'https://api.airtable.com/v0'
const sleep = ms => new Promise(r => setTimeout(r, ms))

function makeHeaders(key) {
  return { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }
}

async function atFetch(key, method, path, body) {
  const r = await fetch(BASE + path, {
    method, headers: makeHeaders(key),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) {
    const t = await r.text()
    console.warn('[airtable] ' + method + ' ' + path + ' → ' + r.status + ': ' + t.slice(0, 200))
    return null
  }
  return r.json()
}

async function upsert(key, tableId, records, mergeField) {
  if (!records.length) return
  for (let i = 0; i < records.length; i += 10) {
    await sleep(220)
    await atFetch(key, 'PATCH', '/' + BASE_ID + '/' + tableId, {
      performUpsert: { fieldsToMergeOn: [mergeField] },
      records: records.slice(i, i + 10).map(f => ({ fields: f })),
    })
  }
}

async function append(key, tableId, records) {
  if (!records.length) return
  for (let i = 0; i < records.length; i += 10) {
    await sleep(220)
    await atFetch(key, 'POST', '/' + BASE_ID + '/' + tableId, {
      records: records.slice(i, i + 10).map(f => ({ fields: f })),
    })
  }
}

export async function syncLiveStats(key, statsArray) {
  await upsert(key, TABLES.Live_Stats, statsArray, 'Platform')
}

export async function syncOurPosts(key, posts) {
  const records = posts.map(p => ({
    'Post ID': String(p.id || p.url),
    'Platform': p.platform === 'tiktok' ? 'TikTok' : 'Instagram',
    'Handle': p.handle || '',
    'Caption': (p.caption || '').slice(0, 1000),
    'Views': p.views || 0,
    'Likes': p.likes || 0,
    'URL': p.url || '',
    'Created At': p.created_at || p.timestamp || '',
    'Fetched At': new Date().toISOString(),
  }))
  await upsert(key, TABLES.Our_Posts, records, 'Post ID')
}

export async function syncCompetitorPosts(key, competitorsByAccount) {
  const records = []
  for (const c of competitorsByAccount) {
    for (const p of (c.top_posts || [])) {
      records.push({
        'Post ID': String(p.id || p.url),
        'Competitor Handle': c.handle,
        'Platform': p.platform === 'tiktok' ? 'TikTok' : 'Instagram',
        'Caption': (p.caption || '').slice(0, 1000),
        'Views': p.views || 0,
        'Likes': p.likes || 0,
        'URL': p.url || '',
        'Created At': p.created_at || p.timestamp || '',
        'Fetched At': new Date().toISOString(),
      })
    }
  }
  await upsert(key, TABLES.Competitor_Posts, records, 'Post ID')
}

export async function syncYouTubeVideos(key, videos) {
  const records = videos.map(v => ({
    'Video ID': v.id,
    'Title': (v.title || '').slice(0, 255),
    'Views': v.views || 0,
    'Likes': v.likes || 0,
    'URL': v.url || '',
    'Published At': v.created_at || '',
    'Fetched At': new Date().toISOString(),
  }))
  await upsert(key, TABLES.YouTube_Videos, records, 'Video ID')
}

export async function syncTrendingTopics(key, topics) {
  const runDate = new Date().toISOString().slice(0, 10)
  const records = topics.slice(0, 20).map(([topic, score], i) => ({
    'Run Key': runDate + ' · ' + topic,
    'Topic': topic,
    'Score': Math.round(score),
    'Rank': i + 1,
    'Run Date': runDate,
    'Fetched At': new Date().toISOString(),
  }))
  await upsert(key, TABLES.Trending_Topics, records, 'Run Key')
}

export async function logFetchRun(key, summary) {
  await append(key, TABLES.Fetch_Log, [{
    'Name': new Date().toUTCString(),
    'Status': summary.ok ? 'Done' : 'Partial',
    'Platforms OK': summary.platformsOk || '',
    'Platforms Failed': summary.platformsFailed || '',
    'Our Posts Count': summary.ourPosts || 0,
    'Competitor Posts Count': summary.compPosts || 0,
    'YouTube Videos Count': summary.ytVideos || 0,
    'Topics Count': summary.topics || 0,
    'Fetched At': new Date().toISOString(),
  }])
}

export { TABLES }
