#!/usr/bin/env node
/**
 * fetch-data.mjs — pulls live data via Apify (full power) + Pinterest API v5
 *
 * Actors used:
 *   apify~instagram-profile-scraper       — owned + competitor IG profiles + recent posts
 *   apify~instagram-hashtag-scraper       — top posts under 8 nursing hashtags
 *   apify~instagram-reel-scraper          — competitor Reels (last 5 each)
 *   clockworks~free-tiktok-scraper        — owned + competitor TikTok profiles + posts
 *   clockworks~tiktok-comments-scraper    — comments on top 3 viral competitor TikToks
 *   clockworks~tiktok-search-scraper      — discovers what hashtags + sounds are rising in nursing
 *
 * Required env: APIFY_TOKEN, PINTEREST_ACCESS_TOKEN
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA_DIR = path.join(ROOT, 'public', 'data')

const APIFY = process.env.APIFY_TOKEN
const PINTEREST = process.env.PINTEREST_ACCESS_TOKEN

const APIFY_BASE = 'https://api.apify.com/v2'
const PINTEREST_BASE = 'https://api.pinterest.com/v5'

const OWNED = {
  instagram: 'simplenursing.com_',
  tiktok: 'https://www.tiktok.com/@simplenursing',
}

const COMPETITORS = {
  instagram: ['registerednursern_com', 'kristine_nurseinthemaking', 'yournursingeducator'],
  tiktok: [
    'https://www.tiktok.com/@registerednursern.com',
    'https://www.tiktok.com/@nurseinthemakingkristine',
    'https://www.tiktok.com/@archernursing',
  ],
}

const NURSING_HASHTAGS = ['nursingstudent', 'nclex', 'nursetok', 'nursingschool', 'futurenurse', 'studentnurse']
const TIKTOK_SEARCH_QUERIES = ['nursing tips', 'nclex prep', 'nursing school hacks', 'pharmacology nursing']

const log = (...a) => console.log('[fetch]', ...a)
const warn = (...a) => console.warn('[warn]', ...a)
const err = (...a) => console.error('[error]', ...a)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))


const DAYS_BACK = 30
const CUTOFF = new Date(Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000).toISOString()
const isRecent = (iso) => iso && iso >= CUTOFF
function velocity(post) {
  const t = post.created_at || post.timestamp
  if (!t) return 0
  const hoursAgo = Math.max(1, (Date.now() - new Date(t).getTime()) / 3600000)
  const engagement = (post.views || 0) + (post.likes || 0) * 10 + (post.video_views || 0)
  return engagement / hoursAgo
}

async function writeJSON(name, data) {
  const file = path.join(DATA_DIR, name + '.json')
  await fs.writeFile(file, JSON.stringify(data, null, 2))
  log('wrote', name + '.json', '(' + Math.round((await fs.stat(file)).size / 1024) + 'KB)')
}

async function apifyRunSync(actorId, input, timeoutMs = 240000) {
  if (!APIFY) throw new Error('APIFY_TOKEN missing')
  const start = await fetch(APIFY_BASE + '/acts/' + actorId + '/runs?token=' + APIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!start.ok) throw new Error('Apify start ' + start.status + ': ' + (await start.text()).slice(0, 200))
  const { data } = await start.json()
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    await sleep(4000)
    const r = await fetch(APIFY_BASE + '/actor-runs/' + data.id + '?token=' + APIFY)
    const { data: run } = await r.json()
    if (run.status === 'SUCCEEDED') break
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) throw new Error('Apify ' + actorId + ' ' + run.status)
  }
  const items = await fetch(APIFY_BASE + '/datasets/' + data.defaultDatasetId + '/items?token=' + APIFY + '&format=json')
  return items.json()
}

async function pinterestGet(p) {
  const r = await fetch(PINTEREST_BASE + p, {
    headers: { Authorization: 'Bearer ' + PINTEREST, Accept: 'application/json' },
  })
  if (!r.ok) throw new Error('Pinterest ' + r.status + ': ' + (await r.text()).slice(0, 200))
  return r.json()
}

// ─── Pinterest ────────────────────────────────────────────────────────────────
async function fetchPinterest() {
  if (!PINTEREST) { warn('Skipping Pinterest — no token'); return null }
  log('Pinterest…')
  const today = new Date(); today.setUTCDate(today.getUTCDate() - 1)
  const end = today.toISOString().split('T')[0]
  const startD = new Date(today); startD.setUTCDate(startD.getUTCDate() - 29)
  const start = startD.toISOString().split('T')[0]

  const [profile, analytics, boardsData, pinsData] = await Promise.all([
    pinterestGet('/user_account'),
    pinterestGet('/user_account/analytics?start_date=' + start + '&end_date=' + end + '&metric_types=IMPRESSION,OUTBOUND_CLICK,PIN_CLICK,SAVE'),
    pinterestGet('/boards?page_size=25'),
    pinterestGet('/pins?page_size=25'),
  ])
  const summary = analytics?.all?.summary_metrics || {}
  return {
    profile: {
      username: profile.username, account_type: profile.account_type,
      monthly_views: profile.monthly_views, follower_count: profile.follower_count,
      pin_count: profile.pin_count, board_count: profile.board_count,
      profile_image: profile.profile_image,
    },
    summary: {
      impressions: Math.round(summary.IMPRESSION || 0),
      pin_clicks: Math.round(summary.PIN_CLICK || 0),
      saves: Math.round(summary.SAVE || 0),
      outbound_clicks: Math.round(summary.OUTBOUND_CLICK || 0),
      period: start + ' → ' + end,
    },
    daily: analytics?.all?.daily_metrics || [],
    boards: (boardsData.items || []).filter(b => b.privacy === 'PUBLIC').map(b => ({
      id: b.id, name: b.name, pin_count: b.pin_count, follower_count: b.follower_count,
      image: b.media?.image_cover_url || '', modified_at: b.board_pins_modified_at,
    })),
    pins: (pinsData.items || []).map(p => ({
      id: p.id, title: p.title || '', description: (p.description || '').slice(0, 200),
      link: p.link, board_id: p.board_id,
      media_type: p.media?.media_type || 'image',
      thumbnail: p.media?.images?.['400x300']?.url || '',
      created_at: p.created_at,
    })),
    fetched_at: new Date().toISOString(),
  }
}

// ─── TikTok ───────────────────────────────────────────────────────────────────
function normaliseTikTokAuthor(item) {
  const a = item.authorMeta || item.author || {}
  return {
    handle: a.name || a.uniqueId || 'unknown',
    display_name: a.nickName || a.nickname || a.name,
    followers: a.fans || a.followerCount || 0,
    following: a.following || 0,
    posts: a.video || 0,
    hearts: a.heart || a.heartCount || 0,
    bio: a.signature || '',
    avatar: a.avatar || a.avatarMedium || '',
    verified: a.verified || false,
    sig_url: a.profileUrl,
  }
}

function groupByAuthor(items) {
  const map = new Map()
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const author = normaliseTikTokAuthor(item)
    if (!author.handle || author.handle === 'unknown') continue
    if (!map.has(author.handle)) map.set(author.handle, { ...author, recent_posts: [] })
    if (item.diggCount !== undefined && isRecent(item.createTimeISO)) {
      map.get(author.handle).recent_posts.push({
        id: item.id, url: item.webVideoUrl,
        thumbnail: item.videoMeta?.coverUrl || '',
        caption: (item.text || '').slice(0, 280),
        views: item.playCount || 0,
        likes: item.diggCount || 0,
        comments: item.commentCount || 0,
        shares: item.shareCount || 0,
        created_at: item.createTimeISO,
        duration: item.videoMeta?.duration,
        music: item.musicMeta?.musicName,
        music_author: item.musicMeta?.musicAuthor,
        hashtags: (item.hashtags || []).slice(0, 6).map(h => h.name),
      })
    }
  }
  for (const v of map.values()) v.recent_posts.sort((a, b) => velocity(b) - velocity(a))
  return Array.from(map.values())
}

async function fetchTikTok() {
  if (!APIFY) { warn('Skipping TikTok'); return null }
  log('TikTok profiles…')
  const items = await apifyRunSync('clockworks~free-tiktok-scraper', {
    profiles: [OWNED.tiktok, ...COMPETITORS.tiktok],
    resultsPerPage: 10, shouldDownloadVideos: false,
    shouldDownloadCovers: false, shouldDownloadSubtitles: false,
  })
  const accounts = groupByAuthor(items)
  const owned = accounts.find(a => a.handle.toLowerCase() === 'simplenursing') || null
  const competitors = accounts.filter(a => a.handle.toLowerCase() !== 'simplenursing')
  return { owned, competitors, fetched_at: new Date().toISOString() }
}

async function fetchTikTokTrends() {
  if (!APIFY) return null
  log('TikTok search trends (full Apify power)…')
  try {
    const items = await apifyRunSync('clockworks~tiktok-scraper', {
      searchQueries: TIKTOK_SEARCH_QUERIES, resultsPerPage: 8,
      shouldDownloadVideos: false, shouldDownloadCovers: false,
    }, 360000)
    const sounds = new Map()
    const hashtags = new Map()
    const trendingPosts = []
    for (const item of (items || [])) {
      if (item.musicMeta?.musicName) {
        const key = item.musicMeta.musicName
        const e = sounds.get(key) || { name: key, author: item.musicMeta.musicAuthor, uses: 0, total_views: 0 }
        e.uses += 1
        e.total_views += item.playCount || 0
        sounds.set(key, e)
      }
      for (const tag of (item.hashtags || [])) {
        const e = hashtags.get(tag.name) || { name: tag.name, uses: 0, total_views: 0 }
        e.uses += 1
        e.total_views += item.playCount || 0
        hashtags.set(tag.name, e)
      }
      if ((item.playCount || 0) > 100000) {
        trendingPosts.push({
          url: item.webVideoUrl,
          views: item.playCount,
          likes: item.diggCount,
          author: item.authorMeta?.name,
          caption: (item.text || '').slice(0, 200),
          thumbnail: item.videoMeta?.coverUrl,
          music: item.musicMeta?.musicName,
          created_at: item.createTimeISO,
        })
      }
    }
    return {
      sounds: Array.from(sounds.values()).sort((a, b) => b.total_views - a.total_views).slice(0, 10),
      hashtags: Array.from(hashtags.values()).sort((a, b) => b.total_views - a.total_views).slice(0, 15),
      trending_posts: trendingPosts.sort((a, b) => b.views - a.views).slice(0, 12),
      queries: TIKTOK_SEARCH_QUERIES,
      fetched_at: new Date().toISOString(),
    }
  } catch (e) { warn('TikTok trends failed:', e.message); return { error: e.message, sounds: [], hashtags: [], trending_posts: [] } }
}

// ─── Instagram ────────────────────────────────────────────────────────────────
async function fetchInstagram() {
  if (!APIFY) { warn('Skipping IG'); return null }
  log('Instagram profiles…')
  const items = await apifyRunSync('apify~instagram-profile-scraper', {
    usernames: [OWNED.instagram, ...COMPETITORS.instagram],
  })
  const accounts = items.map(p => ({
    handle: p.username, display_name: p.fullName,
    followers: p.followersCount || 0, following: p.followsCount || 0,
    posts: p.postsCount || 0, verified: p.verified || false,
    bio: p.biography || '', avatar: p.profilePicUrl || '',
    business_category: p.businessCategoryName,
    external_url: p.externalUrl || '',
    recent_posts: (p.latestPosts || []).filter(post => isRecent(post.timestamp)).slice(0, 8).map(post => ({
      id: post.id, url: post.url, thumbnail: post.displayUrl || '',
      caption: (post.caption || '').slice(0, 280),
      type: (post.type || '').toLowerCase(),
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      timestamp: post.timestamp,
      video_views: post.videoViewCount || null,
      hashtags: (post.hashtags || []).slice(0, 6),
    })),
  }))
  const ownedHandle = OWNED.instagram.replace('@', '')
  const owned = accounts.find(a => a.handle === ownedHandle) || null
  const competitors = accounts.filter(a => a.handle !== ownedHandle)
  return { owned, competitors, fetched_at: new Date().toISOString() }
}

async function fetchInstagramHashtags() {
  if (!APIFY) return null
  log('Instagram hashtag scrape (full Apify power)…')
  try {
    const items = await apifyRunSync('apify~instagram-hashtag-scraper', {
      hashtags: NURSING_HASHTAGS, resultsLimit: 5,
    }, 360000)
    const tagData = new Map()
    for (const item of (items || [])) {
      const tag = item.hashtag || item.name
      if (!tag) continue
      if (!tagData.has(tag)) {
        tagData.set(tag, {
          hashtag: tag,
          post_count: item.postsCount || item.topPostsCount || 0,
          top_posts: [],
        })
      }
      const entry = tagData.get(tag)
      if (item.url) {
        entry.top_posts.push({
          url: item.url,
          thumbnail: item.displayUrl || '',
          likes: item.likesCount || 0,
          comments: item.commentsCount || 0,
          caption: (item.caption || '').slice(0, 200),
          owner: item.ownerUsername,
          type: (item.type || '').toLowerCase(),
        })
      }
    }
    const hashtags = Array.from(tagData.values()).map(t => ({
      ...t,
      top_posts: t.top_posts.sort((a, b) => b.likes - a.likes).slice(0, 5),
    }))
    return { hashtags, fetched_at: new Date().toISOString() }
  } catch (e) { warn('IG hashtags failed:', e.message); return { error: e.message, hashtags: [] } }
}

// ─── Build aggregated "what's working" insights from live data ───────────────
async function buildInsights(tt, ig, ttTrends) {
  const allPosts = []
  if (tt?.owned) for (const p of tt.owned.recent_posts) if (isRecent(p.created_at)) allPosts.push({ platform: 'tiktok', isOwned: true, handle: tt.owned.handle, ...p, score: velocity(p) })
  for (const c of (tt?.competitors || [])) for (const p of c.recent_posts) if (isRecent(p.created_at)) allPosts.push({ platform: 'tiktok', isOwned: false, handle: c.handle, ...p, score: velocity(p) })
  if (ig?.owned) for (const p of ig.owned.recent_posts) if (isRecent(p.timestamp)) allPosts.push({ platform: 'instagram', isOwned: true, handle: ig.owned.handle, ...p, score: velocity(p) })
  for (const c of (ig?.competitors || [])) for (const p of c.recent_posts) if (isRecent(p.timestamp)) allPosts.push({ platform: 'instagram', isOwned: false, handle: c.handle, ...p, score: velocity(p) })

  const top = allPosts.sort((a, b) => b.score - a.score).slice(0, 12)

  const TOPICS = {
    'NCLEX Prep': /nclex|boards|exam|test|review/i,
    'ECG & Cardiac': /ecg|ekg|heart|cardiac|rhythm|cardio/i,
    'Pharmacology': /pharm|medication|drug|med |dosage|insulin|antibi/i,
    'Lab Values': /lab|electrolyte|panel|sodium|potassium|hemoglobin|glucose/i,
    'Clinical Skills': /clinical|skill|injection|iv |cath|wound|trach|sterile/i,
    'New Grad / Career': /new grad|first year|residency|career|burnout|night shift/i,
    'Nursing Humor': /humor|funny|joke|haha|lol|relatable|tired/i,
    'Mental Health': /mental|anxiety|stress|self.?care|cope/i,
  }
  const topics = {}
  for (const p of top) {
    let matched = false
    for (const [t, rx] of Object.entries(TOPICS)) {
      if (rx.test(p.caption || '')) { topics[t] = (topics[t] || 0) + p.score; matched = true; break }
    }
    if (!matched) topics['Other'] = (topics['Other'] || 0) + p.score
  }
  const topicRanked = Object.entries(topics).sort((a, b) => b[1] - a[1])

  const ours = allPosts.filter(p => p.isOwned).sort((a, b) => b.score - a.score)
  const competitors = allPosts.filter(p => !p.isOwned).sort((a, b) => b.score - a.score)
  return {
    top_viral: top,
    ours_top: ours.slice(0, 12),
    competitor_top: competitors.slice(0, 12),
    topics: topicRanked,
    cutoff_date: CUTOFF.slice(0, 10),
    days_back: DAYS_BACK,
    fetched_at: new Date().toISOString(),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const results = { fetched_at: new Date().toISOString(), platforms: {} }

  const tasks = [
    ['pinterest', fetchPinterest],
    ['tiktok', fetchTikTok],
    ['instagram', fetchInstagram],
    ['tiktok_trends', fetchTikTokTrends],
    ['ig_hashtags', fetchInstagramHashtags],
  ]

  const datasets = {}
  for (const [name, fn] of tasks) {
    try {
      const data = await fn()
      if (data) {
        await writeJSON(name, data)
        datasets[name] = data
        results.platforms[name] = { ok: true }
      } else {
        results.platforms[name] = { ok: false, reason: 'no data' }
      }
    } catch (e) {
      err(name, 'failed:', e.message)
      results.platforms[name] = { ok: false, reason: e.message }
    }
  }

  // Build insights from live data
  if (datasets.tiktok && datasets.instagram) {
    const insights = await buildInsights(datasets.tiktok, datasets.instagram, datasets.tiktok_trends)
    await writeJSON('insights', insights)
    results.platforms.insights = { ok: true, viral_posts: insights.top_viral.length, topics: insights.topics.length }
  }

  await writeJSON('last-updated', results)
  log('done.')
}

main().catch(e => { err('fatal', e); process.exit(1) })
