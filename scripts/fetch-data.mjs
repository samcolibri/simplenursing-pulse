#!/usr/bin/env node
/**
 * fetch-data.mjs — pulls live data from Apify + Pinterest API into public/data/*.json
 * Runs locally (npm run refresh) and in GitHub Actions hourly cron.
 *
 * Required env: APIFY_TOKEN, PINTEREST_ACCESS_TOKEN
 * Optional:     META_PAGE_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID, META_PAGE_ID
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DATA_DIR = path.join(ROOT, 'public', 'data')

const APIFY = process.env.APIFY_TOKEN
const PINTEREST = process.env.PINTEREST_ACCESS_TOKEN
const META_TOKEN = process.env.META_PAGE_ACCESS_TOKEN
const META_IG_ID = process.env.IG_BUSINESS_ACCOUNT_ID
const META_PAGE_ID = process.env.META_PAGE_ID

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

const NURSING_HASHTAGS = ['nursingstudent', 'nursingschool', 'nclex', 'nursetok', 'futurenurse', 'studentnurse', 'medtok', 'nursememes']

const log = (...a) => console.log('[fetch]', ...a)
const warn = (...a) => console.warn('[warn]', ...a)
const err = (...a) => console.error('[error]', ...a)

async function writeJSON(name, data) {
  const file = path.join(DATA_DIR, name + '.json')
  await fs.writeFile(file, JSON.stringify(data, null, 2))
  log('wrote', file)
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function apifyRunSync(actorId, input, timeoutMs = 180000) {
  if (!APIFY) throw new Error('APIFY_TOKEN missing')
  const start = await fetch(APIFY_BASE + '/acts/' + actorId + '/runs?token=' + APIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!start.ok) throw new Error('Apify start ' + start.status + ': ' + (await start.text()).slice(0, 200))
  const { data } = await start.json()
  const runId = data.id
  const datasetId = data.defaultDatasetId

  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    await sleep(4000)
    const r = await fetch(APIFY_BASE + '/actor-runs/' + runId + '?token=' + APIFY)
    const { data: run } = await r.json()
    if (run.status === 'SUCCEEDED') break
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
      throw new Error('Apify run ' + run.status)
    }
  }
  const items = await fetch(APIFY_BASE + '/datasets/' + datasetId + '/items?token=' + APIFY + '&format=json')
  return items.json()
}

async function pinterestGet(p) {
  const r = await fetch(PINTEREST_BASE + p, {
    headers: { Authorization: 'Bearer ' + PINTEREST, Accept: 'application/json' },
  })
  if (!r.ok) throw new Error('Pinterest ' + r.status + ': ' + (await r.text()).slice(0, 200))
  return r.json()
}

async function fetchPinterest() {
  if (!PINTEREST) { warn('Skipping Pinterest — no token'); return null }
  log('Pinterest…')
  const today = new Date()
  today.setUTCDate(today.getUTCDate() - 1)
  const end = today.toISOString().split('T')[0]
  const startD = new Date(today)
  startD.setUTCDate(startD.getUTCDate() - 29)
  const start = startD.toISOString().split('T')[0]

  const [profile, analytics, boardsData, pinsData] = await Promise.all([
    pinterestGet('/user_account'),
    pinterestGet('/user_account/analytics?start_date=' + start + '&end_date=' + end + '&metric_types=IMPRESSION,OUTBOUND_CLICK,PIN_CLICK,SAVE'),
    pinterestGet('/boards?page_size=25'),
    pinterestGet('/pins?page_size=25'),
  ])
  const summary = analytics?.all?.summary_metrics || {}
  const daily = analytics?.all?.daily_metrics || []

  return {
    profile: {
      username: profile.username,
      account_type: profile.account_type,
      monthly_views: profile.monthly_views,
      follower_count: profile.follower_count,
      pin_count: profile.pin_count,
      board_count: profile.board_count,
      profile_image: profile.profile_image,
    },
    summary: {
      impressions: Math.round(summary.IMPRESSION || 0),
      pin_clicks: Math.round(summary.PIN_CLICK || 0),
      saves: Math.round(summary.SAVE || 0),
      outbound_clicks: Math.round(summary.OUTBOUND_CLICK || 0),
      period: start + ' → ' + end,
    },
    daily,
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
  }
}

function groupByAuthor(items) {
  const map = new Map()
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const author = normaliseTikTokAuthor(item)
    if (!author.handle || author.handle === 'unknown') continue
    if (!map.has(author.handle)) map.set(author.handle, { ...author, recent_posts: [] })
    if (item.diggCount !== undefined) {
      map.get(author.handle).recent_posts.push({
        id: item.id, url: item.webVideoUrl,
        thumbnail: item.videoMeta?.coverUrl || '',
        caption: (item.text || '').slice(0, 200),
        views: item.playCount || 0,
        likes: item.diggCount || 0,
        comments: item.commentCount || 0,
        shares: item.shareCount || 0,
        created_at: item.createTimeISO,
        duration: item.videoMeta?.duration,
      })
    }
  }
  for (const v of map.values()) v.recent_posts.sort((a, b) => (b.views || 0) - (a.views || 0))
  return Array.from(map.values())
}

async function fetchTikTok() {
  if (!APIFY) { warn('Skipping TikTok — no Apify token'); return null }
  log('TikTok…')
  const profiles = [OWNED.tiktok, ...COMPETITORS.tiktok]
  const items = await apifyRunSync('clockworks~free-tiktok-scraper', {
    profiles, resultsPerPage: 10,
    shouldDownloadVideos: false, shouldDownloadCovers: false, shouldDownloadSubtitles: false,
  })
  const accounts = groupByAuthor(items)
  const owned = accounts.find(a => a.handle.toLowerCase() === 'simplenursing') || null
  const competitors = accounts.filter(a => a.handle.toLowerCase() !== 'simplenursing')
  return { owned, competitors, fetched_at: new Date().toISOString() }
}

async function fetchInstagram() {
  if (!APIFY) { warn('Skipping Instagram — no Apify token'); return null }
  log('Instagram…')
  const usernames = [OWNED.instagram, ...COMPETITORS.instagram]
  const items = await apifyRunSync('apify~instagram-profile-scraper', { usernames })

  const accounts = items.map(p => ({
    handle: p.username,
    display_name: p.fullName,
    followers: p.followersCount || 0,
    following: p.followsCount || 0,
    posts: p.postsCount || 0,
    verified: p.verified || false,
    bio: p.biography || '',
    avatar: p.profilePicUrl || '',
    business_category: p.businessCategoryName,
    recent_posts: (p.latestPosts || []).slice(0, 8).map(post => ({
      id: post.id, url: post.url, thumbnail: post.displayUrl || '',
      caption: (post.caption || '').slice(0, 200),
      type: (post.type || '').toLowerCase(),
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      timestamp: post.timestamp,
    })),
  }))
  const ownedHandle = OWNED.instagram.replace('@', '')
  const owned = accounts.find(a => a.handle === ownedHandle) || null
  const competitors = accounts.filter(a => a.handle !== ownedHandle)
  return { owned, competitors, fetched_at: new Date().toISOString() }
}

async function fetchHashtags() {
  if (!APIFY) { warn('Skipping hashtags — no Apify token'); return null }
  log('Hashtags…')
  try {
    const items = await apifyRunSync('apify~instagram-hashtag-scraper', {
      hashtags: NURSING_HASHTAGS.slice(0, 8), resultsLimit: 5,
    }, 240000)
    const seen = new Set()
    const hashtags = []
    for (const item of items) {
      const tag = item.hashtag || item.name
      if (!tag || seen.has(tag)) continue
      seen.add(tag)
      hashtags.push({
        hashtag: tag,
        post_count: item.postsCount || item.topPostsCount || 0,
        top_posts: (item.topPosts || []).slice(0, 3).map(p => ({
          likes: p.likesCount, url: p.url, caption: (p.caption || '').slice(0, 120),
        })),
      })
    }
    return { hashtags, fetched_at: new Date().toISOString() }
  } catch (e) {
    warn('Hashtag scrape failed:', e.message)
    return { hashtags: [], error: e.message, fetched_at: new Date().toISOString() }
  }
}

async function fetchMetaOwned() {
  if (!META_TOKEN || !META_IG_ID) {
    return {
      ok: false,
      reason: 'Meta business token + IG_BUSINESS_ACCOUNT_ID required',
      hint: 'developers.facebook.com → Business app → Pages + IG connect',
      fetched_at: new Date().toISOString(),
    }
  }
  log('Meta owned insights…')
  try {
    const ig = await fetch('https://graph.facebook.com/v22.0/' + META_IG_ID + '/insights?metric=reach,profile_views,follower_count&period=day&access_token=' + META_TOKEN).then(r => r.json())
    const fb = META_PAGE_ID ? await fetch('https://graph.facebook.com/v22.0/' + META_PAGE_ID + '/insights?metric=page_views_total,page_impressions,page_post_engagements&period=day&access_token=' + META_TOKEN).then(r => r.json()) : null
    return { ok: true, instagram: ig, facebook: fb, fetched_at: new Date().toISOString() }
  } catch (e) {
    return { ok: false, reason: e.message, fetched_at: new Date().toISOString() }
  }
}

function summarize(name, d) {
  if (name === 'pinterest') return { monthly_views: d.profile?.monthly_views, impressions: d.summary?.impressions, saves: d.summary?.saves, pins: d.pins?.length, boards: d.boards?.length }
  if (name === 'tiktok') return { accounts: 1 + (d.competitors?.length || 0), own_followers: d.owned?.followers }
  if (name === 'instagram') return { accounts: 1 + (d.competitors?.length || 0), own_followers: d.owned?.followers }
  if (name === 'hashtags') return { count: d.hashtags?.length || 0 }
  if (name === 'meta') return { ok: d.ok, reason: d.reason }
  return {}
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const results = { fetched_at: new Date().toISOString(), platforms: {} }
  for (const [name, fn] of [
    ['pinterest', fetchPinterest],
    ['tiktok', fetchTikTok],
    ['instagram', fetchInstagram],
    ['hashtags', fetchHashtags],
    ['meta', fetchMetaOwned],
  ]) {
    try {
      const data = await fn()
      if (data) {
        await writeJSON(name, data)
        results.platforms[name] = { ok: true, summary: summarize(name, data) }
      } else {
        results.platforms[name] = { ok: false, reason: 'no data returned' }
      }
    } catch (e) {
      err(name, 'failed:', e.message)
      results.platforms[name] = { ok: false, reason: e.message }
    }
  }
  await writeJSON('last-updated', results)
  log('done.')
}

main().catch(e => { err('fatal', e); process.exit(1) })
