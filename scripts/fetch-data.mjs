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
import { syncLiveStats, syncOurPosts, syncCompetitorPosts, syncYouTubeVideos, syncTrendingTopics, logFetchRun } from '../lib/airtable-sync.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA_DIR = path.join(ROOT, 'public', 'data')

const APIFY = process.env.APIFY_TOKEN
const PINTEREST = process.env.PINTEREST_ACCESS_TOKEN
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const AT_KEY = process.env.AIRTABLE_API_KEY

const APIFY_BASE = 'https://api.apify.com/v2'
const PINTEREST_BASE = 'https://api.pinterest.com/v5'
const YOUTUBE_CHANNEL_ID = 'UCUxQWmWk1_Hk9iDRKvhH29Q'

const OWNED = {
  instagram: 'simplenursing.com_',
  tiktok: 'https://www.tiktok.com/@simplenursing',
  facebook: 'https://www.facebook.com/simplenursing',
}

const COMPETITORS = {
  instagram: [
    'registerednursern_com',
    'kristine_nurseinthemaking',
    'yournursingeducator',
    'archernursingreview',     // Archer Review
    'uworld',                  // UWorld (verify handle)
    'nclexbootcamp',           // NCLEX Bootcamp (verify handle)
    'nursingstudybyally',      // NursingStudyByAlly (verify handle)
  ],
  tiktok: [
    'https://www.tiktok.com/@registerednursern.com',
    'https://www.tiktok.com/@nurseinthemakingkristine',
    'https://www.tiktok.com/@archernursing',
    'https://www.tiktok.com/@yournursingeducator',
    'https://www.tiktok.com/@uworldnclex',          // UWorld (verify handle)
    'https://www.tiktok.com/@nclexbootcamp',        // NCLEX Bootcamp (verify handle)
    'https://www.tiktok.com/@nursingstudybyally',   // NursingStudyByAlly (verify handle)
  ],
}

// Maps every platform-specific handle variant → one canonical key for deduplication
const CANONICAL_HANDLE = {
  'registerednursern.com':    'registerednursern',
  'registerednursern_com':    'registerednursern',
  'nurseinthemakingkristine': 'nurseinthemaking',
  'kristine_nurseinthemaking':'nurseinthemaking',
  'archernursing':            'archernursing',
  'archernursingreview':      'archernursing',
  'uworldnclex':              'uworld',
  'uworld':                   'uworld',
  'yournursingeducator':      'yournursingeducator',
  'nclexbootcamp':            'nclexbootcamp',
  'nursingstudybyally':       'nursingstudybyally',
}
function canonicalKey(handle) { return CANONICAL_HANDLE[handle.toLowerCase()] || handle.toLowerCase() }

const NURSING_HASHTAGS = [
  'nursingstudent', 'nclex', 'nursetok', 'nursingschool',
  'futurenurse', 'studentnurse', 'nclexprep', 'nursinglife',
  'nursingstudentlife', 'nursingtips',
]
const TIKTOK_SEARCH_QUERIES = [
  'nursing tips', 'nclex prep', 'nursing school hacks', 'pharmacology nursing',
  'nursing student life', 'nursing school studying', 'nursing school advice',
  'nclex study tips', 'nursing school struggles', 'how to pass nursing school',
]

const log = (...a) => console.log('[fetch]', ...a)
const warn = (...a) => console.warn('[warn]', ...a)
const err = (...a) => console.error('[error]', ...a)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))


const DAYS_BACK = Number(process.env.DAYS_BACK) || 90
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
    resultsPerPage: 60, shouldDownloadVideos: false,
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
      searchQueries: TIKTOK_SEARCH_QUERIES, resultsPerPage: 20,
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
// Two-pass approach:
//   Pass 1: apify~instagram-profile-scraper — gets follower/bio metadata + ~12 latestPosts
//   Pass 2: apify~instagram-scraper per profile — paginates through posts to get full 90d history
async function fetchInstagram() {
  if (!APIFY) { warn('Skipping IG'); return null }

  // --- Pass 1: profile metadata ---
  log('Instagram profiles (metadata)…')
  const allHandles = [OWNED.instagram, ...COMPETITORS.instagram]
  const profileItems = await apifyRunSync('apify~instagram-profile-scraper', {
    usernames: allHandles,
  })

  // Build a metadata map keyed by handle
  const metaMap = new Map()
  for (const p of (profileItems || [])) {
    metaMap.set((p.username || '').toLowerCase(), {
      handle: p.username, display_name: p.fullName,
      followers: p.followersCount || 0, following: p.followsCount || 0,
      posts: p.postsCount || 0, verified: p.verified || false,
      bio: p.biography || '', avatar: p.profilePicUrl || '',
      business_category: p.businessCategoryName,
      external_url: p.externalUrl || '',
    })
  }

  // --- Pass 2: paginated post scrape per profile ---
  log('Instagram posts (paginated, last 90d)…')
  const directUrls = allHandles.map(h => `https://www.instagram.com/${h.replace('@', '')}/`)
  const postItems = await apifyRunSync('apify~instagram-scraper', {
    directUrls,
    resultsType: 'posts',
    resultsLimit: 200,   // up to 200 posts per profile — gives full 90d window for daily posters
  }, 600000) // 10 min timeout for paginated scrape

  // Group posts by profile handle
  const postsByHandle = new Map()
  for (const item of (postItems || [])) {
    const owner = (item.ownerUsername || item.username || '').toLowerCase()
    if (!owner) continue
    if (!postsByHandle.has(owner)) postsByHandle.set(owner, [])
    const t = item.timestamp || item.takenAtTimestamp || ''
    if (!isRecent(t)) continue
    postsByHandle.get(owner).push({
      id: item.id || item.shortCode,
      url: item.url || `https://www.instagram.com/p/${item.shortCode}/`,
      thumbnail: item.displayUrl || item.imageUrl || '',
      caption: (item.caption || item.alt || '').slice(0, 280),
      type: (item.type || '').toLowerCase(),
      likes: item.likesCount || item.likes || 0,
      comments: item.commentsCount || item.comments || 0,
      timestamp: t,
      video_views: item.videoViewCount || item.videoPlayCount || null,
      hashtags: (item.hashtags || []).slice(0, 6),
    })
  }

  // Merge metadata + posts
  const ownedKey = OWNED.instagram.replace('@', '').toLowerCase()
  const accounts = []
  for (const rawHandle of allHandles) {
    const key = rawHandle.replace('@', '').toLowerCase()
    const meta = metaMap.get(key) || { handle: key }
    const recent_posts = (postsByHandle.get(key) || [])
      .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
    accounts.push({ ...meta, recent_posts })
    log(`  @${key}: ${recent_posts.length} posts in last ${DAYS_BACK}d`)
  }

  const owned = accounts.find(a => (a.handle || '').toLowerCase() === ownedKey) || null
  const competitors = accounts.filter(a => (a.handle || '').toLowerCase() !== ownedKey)
  return { owned, competitors, fetched_at: new Date().toISOString() }
}

async function fetchInstagramHashtags() {
  if (!APIFY) return null
  log('Instagram hashtag scrape (full Apify power)…')
  try {
    const directUrls = NURSING_HASHTAGS.map(h => `https://www.instagram.com/explore/tags/${h}/`)
    const items = await apifyRunSync('apify~instagram-scraper', {
      directUrls,
      resultsType: 'posts',
      resultsLimit: 12,
    }, 360000)
    const tagData = new Map()
    for (const item of (items || [])) {
      const url = item.url || ''
      const tagMatch = url.match(/explore\/tags\/([^/]+)/)
      const tag = item.hashtag || item.name || (tagMatch && tagMatch[1]) || 'nursing'
      if (!tagData.has(tag)) tagData.set(tag, { hashtag: tag, post_count: 0, top_posts: [] })
      const entry = tagData.get(tag)
      const postUrl = item.url || item.shortCode && `https://www.instagram.com/p/${item.shortCode}/`
      if (postUrl) {
        entry.top_posts.push({
          url: postUrl,
          thumbnail: item.displayUrl || item.thumbnailUrl || '',
          likes: item.likesCount || item.likes || 0,
          comments: item.commentsCount || item.comments || 0,
          caption: (item.caption || item.description || '').slice(0, 200),
          owner: item.ownerUsername || item.username,
          type: (item.type || '').toLowerCase(),
        })
      }
    }
    log('IG hashtag scraper raw items:', (items || []).length, '→', tagData.size, 'tags')
    const hashtags = Array.from(tagData.values()).map(t => ({
      ...t,
      top_posts: t.top_posts.sort((a, b) => b.likes - a.likes).slice(0, 5),
    }))
    return { hashtags, fetched_at: new Date().toISOString() }
  } catch (e) { warn('IG hashtags failed:', e.message); return { error: e.message, hashtags: [] } }
}

// ─── YouTube ─────────────────────────────────────────────────────────────────
async function fetchYouTube() {
  if (!YOUTUBE_API_KEY) { warn('Skipping YouTube — no YOUTUBE_API_KEY'); return null }
  log('YouTube…')
  const publishedAfter = new Date(Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000).toISOString()

  // Search for recent uploads
  const searchUrl = 'https://www.googleapis.com/youtube/v3/search?channelId=' + YOUTUBE_CHANNEL_ID + '&part=id,snippet&type=video&order=date&maxResults=50&publishedAfter=' + encodeURIComponent(publishedAfter) + '&key=' + YOUTUBE_API_KEY
  const searchRes = await fetch(searchUrl)
  if (!searchRes.ok) throw new Error('YouTube search ' + searchRes.status + ': ' + (await searchRes.text()).slice(0, 200))
  const searchData = await searchRes.json()
  const videoIds = (searchData.items || []).map(item => item.id?.videoId).filter(Boolean)

  let videos = []
  if (videoIds.length) {
    const statsUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + videoIds.join(',') + '&part=statistics,snippet,contentDetails&key=' + YOUTUBE_API_KEY
    const statsRes = await fetch(statsUrl)
    if (!statsRes.ok) throw new Error('YouTube videos ' + statsRes.status)
    const statsData = await statsRes.json()
    videos = (statsData.items || []).map(v => ({
      id: v.id,
      url: 'https://www.youtube.com/watch?v=' + v.id,
      title: v.snippet?.title || '',
      caption: (v.snippet?.title || '').slice(0, 280),
      description: (v.snippet?.description || '').slice(0, 200),
      thumbnail: v.snippet?.thumbnails?.medium?.url || '',
      views: parseInt(v.statistics?.viewCount || 0),
      likes: parseInt(v.statistics?.likeCount || 0),
      comments: parseInt(v.statistics?.commentCount || 0),
      created_at: v.snippet?.publishedAt || '',
      duration: v.contentDetails?.duration || '',
      platform: 'youtube',
      handle: 'simplenursing',
      isOwned: true,
    })).sort((a, b) => b.views - a.views)
  }

  let channel = null
  try {
    const chanUrl = 'https://www.googleapis.com/youtube/v3/channels?id=' + YOUTUBE_CHANNEL_ID + '&part=statistics,snippet&key=' + YOUTUBE_API_KEY
    const chanRes = await fetch(chanUrl)
    if (chanRes.ok) {
      const chanData = await chanRes.json()
      const ch = chanData.items?.[0]
      if (ch) channel = {
        title: ch.snippet?.title || 'SimpleNursing',
        subscribers: parseInt(ch.statistics?.subscriberCount || 0),
        total_views: parseInt(ch.statistics?.viewCount || 0),
        video_count: parseInt(ch.statistics?.videoCount || 0),
      }
    }
  } catch (e) { warn('YouTube channel stats failed:', e.message) }

  log('YouTube: ' + videos.length + ' videos in last ' + DAYS_BACK + ' days')
  return { videos, channel, fetched_at: new Date().toISOString() }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────
// Scrapes public page posts via Apify — no Meta Business API needed.
// Gets: post text, likes, comments, shares, date, URL.
// Does NOT get reach/impressions (those need Meta Business API).
async function fetchFacebook() {
  if (!APIFY) { warn('Skipping Facebook'); return null }
  log('Facebook page posts…')
  try {
    const items = await apifyRunSync('apify~facebook-pages-scraper', {
      startUrls: [{ url: OWNED.facebook }],
      maxPosts: 90,           // ~90 days of daily posts
      maxPostComments: 0,     // skip comments — we only need post metrics
      maxReviews: 0,
      scrapeAbout: false,
      scrapeReviews: false,
    }, 300000)

    const posts = []
    let followers = null
    for (const item of (items || [])) {
      // Page-level info
      if (item.likes != null && followers == null) followers = item.likes

      // Posts array is nested under item.posts
      for (const p of (item.posts || [])) {
        const t = p.time ? new Date(p.time * 1000).toISOString() : (p.date || '')
        if (!isRecent(t)) continue
        posts.push({
          id: p.postId || p.url,
          url: p.url || OWNED.facebook,
          caption: (p.text || p.postText || '').slice(0, 280),
          likes: p.likes || 0,
          comments: p.comments || 0,
          shares: p.shares || 0,
          reactions: p.reactions || p.likes || 0,
          timestamp: t,
          type: p.type || 'post',
        })
      }
    }

    posts.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
    log(`Facebook: ${posts.length} posts in last ${DAYS_BACK}d`)
    return { handle: 'simplenursing', followers, recent_posts: posts, fetched_at: new Date().toISOString() }
  } catch (e) {
    warn('Facebook failed:', e.message)
    return null
  }
}

// ─── Build aggregated "what's working" insights from live data ───────────────
async function buildInsights(tt, ig, fb, ttTrends, igHashtags) {
  // Collect all posts, deduplicated by ID
  const seenIds = new Set()
  const allPosts = []
  function addPost(post) {
    const key = String(post.id || post.url || Math.random())
    if (seenIds.has(key)) return
    seenIds.add(key)
    allPosts.push(post)
  }

  if (tt?.owned) for (const p of tt.owned.recent_posts) if (isRecent(p.created_at)) addPost({ platform: 'tiktok', isOwned: true, handle: tt.owned.handle, ...p, score: velocity(p) })
  for (const c of (tt?.competitors || [])) for (const p of c.recent_posts) if (isRecent(p.created_at)) addPost({ platform: 'tiktok', isOwned: false, handle: c.handle, ...p, score: velocity(p) })
  if (ig?.owned) for (const p of ig.owned.recent_posts) if (isRecent(p.timestamp)) addPost({ platform: 'instagram', isOwned: true, handle: ig.owned.handle, ...p, score: velocity(p) })
  for (const c of (ig?.competitors || [])) for (const p of c.recent_posts) if (isRecent(p.timestamp)) addPost({ platform: 'instagram', isOwned: false, handle: c.handle, ...p, score: velocity(p) })
  if (fb?.recent_posts) for (const p of fb.recent_posts) if (isRecent(p.timestamp)) addPost({ platform: 'facebook', isOwned: true, handle: 'simplenursing', ...p, views: p.reactions || p.likes || 0, score: velocity({ ...p, views: p.reactions || p.likes || 0, created_at: p.timestamp }) })

  allPosts.sort((a, b) => b.score - a.score)

  // Per-competitor breakdown — one entry per canonical account, top 10 posts merged across platforms
  const compMap = new Map()
  for (const c of (tt?.competitors || [])) {
    const key = canonicalKey(c.handle)
    if (!compMap.has(key)) compMap.set(key, { handle: key, display_name: c.display_name, followers: c.followers, platform: 'tiktok', top_posts: [] })
    const existing = compMap.get(key)
    existing.followers = Math.max(existing.followers || 0, c.followers || 0)
    const posts = c.recent_posts.filter(p => isRecent(p.created_at))
    const seen = new Set(existing.top_posts.map(p => String(p.id)))
    for (const p of posts) if (!seen.has(String(p.id))) existing.top_posts.push({ ...p, platform: 'tiktok', score: velocity(p) })
  }
  for (const c of (ig?.competitors || [])) {
    const key = canonicalKey(c.handle)
    if (!compMap.has(key)) compMap.set(key, { handle: key, display_name: c.display_name, followers: c.followers, platform: 'instagram', top_posts: [] })
    const existing = compMap.get(key)
    existing.followers = Math.max(existing.followers || 0, c.followers || 0)
    const posts = c.recent_posts.filter(p => isRecent(p.timestamp))
    const seen = new Set(existing.top_posts.map(p => String(p.id)))
    for (const p of posts) if (!seen.has(String(p.id))) existing.top_posts.push({ ...p, platform: 'instagram', score: velocity(p) })
    if (existing.platform === 'tiktok') existing.platform = 'both'
  }
  for (const v of compMap.values()) v.top_posts = v.top_posts.sort((a, b) => b.score - a.score).slice(0, 50)
  const competitors_by_account = Array.from(compMap.values())
    .filter(c => c.top_posts.length > 0)
    .sort((a, b) => (b.followers || 0) - (a.followers || 0))

  // Topic clustering — pull from 3 sources: our+competitor posts, TikTok nursing search, IG nursing hashtag top posts
  const igNichePosts = (igHashtags?.hashtags || []).flatMap(h =>
    (h.top_posts || []).map(p => ({ caption: p.caption, views: p.likes, score: p.likes }))
  )
  const topicPosts = [
    ...allPosts,
    ...(ttTrends?.trending_posts || []),
    ...igNichePosts,
  ]
  const TOPICS = {
    'NCLEX Prep': /nclex|boards|licensing exam|nursing exam|pass rates|kaplan|uworld|archer/i,
    'Nursing School Tips': /study|notes|lecture|prereq|tip|hack|school|semester|schedule|memorize/i,
    'ECG & Cardiac': /ecg|ekg|heart|cardiac|rhythm|cardio|dysrhythmia|afib/i,
    'Pharmacology': /pharm|medication|drug|\bmed\b|dosage|insulin|antibiotic|IV push/i,
    'Lab Values': /lab|electrolyte|sodium|potassium|hemoglobin|glucose|CBC|BMP|CMP/i,
    'Clinical Skills': /clinical|skill|injection|\bIV\b|catheter|wound|trach|sterile|assessment|vital/i,
    'Career & New Grad': /new grad|first year|residency|career|burnout|night shift|job|salary|pay|hire/i,
    'Nursing Student Life': /student nurse|nursing student|nursing school|prereq|application|acceptance|acceptance rate/i,
  }
  const topics = {}
  for (const p of topicPosts) {
    const text = (p.caption || p.text || '')
    for (const [t, rx] of Object.entries(TOPICS)) {
      if (rx.test(text)) { topics[t] = (topics[t] || 0) + (p.score || p.views || 0); break }
    }
  }
  const topicRanked = Object.entries(topics).sort((a, b) => b[1] - a[1])

  const ours = allPosts.filter(p => p.isOwned)
  const competitors = allPosts.filter(p => !p.isOwned)
  return {
    top_viral: allPosts.slice(0, 12),
    ours_top: ours.slice(0, 200),
    competitor_top: competitors.slice(0, 200),
    competitors_by_account,
    topics: topicRanked,
    cutoff_date: CUTOFF.slice(0, 10),
    days_back: DAYS_BACK,
    fetched_at: new Date().toISOString(),
  }
}

// ─── Airtable brain sync ──────────────────────────────────────────────────────
async function syncAirtable(ds, ins, res) {
  if (!AT_KEY) { warn('Skipping Airtable sync — no key'); return }
  log('Airtable sync…')
  try {
    const ls = []
    if (ds.tiktok?.owned) ls.push({ Platform: 'TikTok', Followers: ds.tiktok.owned.followers||0, 'Updated At': new Date().toISOString(), Source: 'Apify' })
    if (ds.instagram?.owned) ls.push({ Platform: 'Instagram', Followers: ds.instagram.owned.followers||0, 'Updated At': new Date().toISOString(), Source: 'Apify' })
    if (ls.length) await syncLiveStats(AT_KEY, ls)
    if (ins?.ours_top?.length) await syncOurPosts(AT_KEY, ins.ours_top)
    if (ins?.competitors_by_account?.length) await syncCompetitorPosts(AT_KEY, ins.competitors_by_account)
    if (ds.youtube?.videos?.length) await syncYouTubeVideos(AT_KEY, ds.youtube.videos)
    if (ins?.topics?.length) await syncTrendingTopics(AT_KEY, ins.topics)
    const okK = Object.keys(res.platforms).filter(k => res.platforms[k].ok)
    const failK = Object.keys(res.platforms).filter(k => !res.platforms[k].ok)
    await logFetchRun(AT_KEY, {
      ok: !failK.length, platformsOk: okK.join(', '), platformsFailed: failK.join(', '),
      ourPosts: ins?.ours_top?.length || 0,
      compPosts: (ins?.competitors_by_account||[]).reduce((s,c)=>s+(c.top_posts?.length||0),0),
      ytVideos: ds.youtube?.videos?.length || 0, topics: ins?.topics?.length || 0,
    })
    log('Airtable sync done.')
  } catch (e) { err('Airtable sync failed:', e.message) }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const results = { fetched_at: new Date().toISOString(), platforms: {} }

  const tasks = [
    ['pinterest', fetchPinterest],
    ['tiktok', fetchTikTok],
    ['instagram', fetchInstagram],
    ['facebook', fetchFacebook],
    ['tiktok_trends', fetchTikTokTrends],
    ['ig_hashtags', fetchInstagramHashtags],
    ['youtube', fetchYouTube],
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
  let insights = null
  if (datasets.tiktok && datasets.instagram) {
    insights = await buildInsights(datasets.tiktok, datasets.instagram, datasets.facebook || null, datasets.tiktok_trends, datasets.ig_hashtags)
    await writeJSON('insights', insights)
    results.platforms.insights = { ok: true, viral_posts: insights.top_viral.length, topics: insights.topics.length }
  }

  await writeJSON('last-updated', results)
  await syncAirtable(datasets, insights, results)
  log('done.')
}

main().catch(e => { err('fatal', e); process.exit(1) })
