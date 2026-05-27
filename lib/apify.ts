import axios from 'axios'

const APIFY_TOKEN = process.env.APIFY_TOKEN!
const BASE = 'https://api.apify.com/v2'

export const ACTORS = {
  igProfile: 'apify~instagram-profile-scraper',
  igPosts: 'apify~instagram-post-scraper',
  igHashtag: 'apify~instagram-hashtag-scraper',
  ttProfile: 'clockworks~free-tiktok-scraper',
  ttHashtag: 'clockworks~free-tiktok-scraper',
  fbPosts: 'apify~facebook-posts-scraper',
  fbPage: 'apify~facebook-pages-scraper',
} as const

export const COMPETITORS = {
  instagram: [
    { handle: 'registerednursern_com', tier: 'direct' as const },
    { handle: 'kristine_nurseinthemaking', tier: 'direct' as const },
    { handle: 'yournursingeducator', tier: 'direct' as const },
  ],
  tiktok: [
    { handle: 'https://www.tiktok.com/@registerednursern.com', tier: 'direct' as const },
    { handle: 'https://www.tiktok.com/@nurseinthemakingkristine', tier: 'direct' as const },
    { handle: 'https://www.tiktok.com/@archernursing', tier: 'direct' as const },
  ],
  facebook: [
    { handle: 'anurseinthemaking', tier: 'direct' as const },
    { handle: 'RegisteredNurseRNs', tier: 'direct' as const },
  ],
}

export const NURSING_HASHTAGS = [
  'nursingstudent', 'nursingschool', 'nclex', 'nursetok',
  'futurenurse', 'studentnurse', 'medtok', 'shiftlife',
  'nursememes', 'travelnurse', 'scrublife', 'ernurse',
  'nursing', 'nurse', 'healthcare', 'medicalstudent',
]

async function runActor(actorId: string, input: object): Promise<{ runId: string; datasetId: string }> {
  const res = await axios.post(
    `${BASE}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    input,
    { headers: { 'Content-Type': 'application/json' } }
  )
  return {
    runId: res.data.data.id,
    datasetId: res.data.data.defaultDatasetId,
  }
}

async function waitForRun(runId: string, maxWaitMs = 120000): Promise<'SUCCEEDED' | 'FAILED'> {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    const res = await axios.get(`${BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    const status = res.data.data.status
    if (status === 'SUCCEEDED') return 'SUCCEEDED'
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') return 'FAILED'
    await new Promise(r => setTimeout(r, 3000))
  }
  return 'FAILED'
}

async function getDataset<T>(datasetId: string): Promise<T[]> {
  const res = await axios.get(
    `${BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`
  )
  return res.data as T[]
}

export async function scrapeInstagramProfiles(usernames: string[]) {
  const { runId, datasetId } = await runActor(ACTORS.igProfile, { usernames })
  const status = await waitForRun(runId)
  if (status !== 'SUCCEEDED') return []
  return getDataset<any>(datasetId)
}

export async function scrapeInstagramPosts(usernames: string[], limit = 12) {
  const { runId, datasetId } = await runActor(ACTORS.igPosts, {
    username: usernames,
    resultsLimit: limit,
  })
  const status = await waitForRun(runId)
  if (status !== 'SUCCEEDED') return []
  return getDataset<any>(datasetId)
}

export async function scrapeTikTokProfiles(profileUrls: string[], postsPerProfile = 10) {
  const { runId, datasetId } = await runActor(ACTORS.ttProfile, {
    profiles: profileUrls,
    resultsPerPage: postsPerProfile,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
  })
  const status = await waitForRun(runId)
  if (status !== 'SUCCEEDED') return []
  return getDataset<any>(datasetId)
}

export async function scrapeInstagramHashtags(hashtags: string[]) {
  const { runId, datasetId } = await runActor(ACTORS.igHashtag, {
    hashtags,
    resultsLimit: 10,
  })
  const status = await waitForRun(runId)
  if (status !== 'SUCCEEDED') return []
  return getDataset<any>(datasetId)
}

export async function scrapeFacebookPages(pageUrls: string[]) {
  const { runId, datasetId } = await runActor(ACTORS.fbPage, {
    startUrls: pageUrls.map(url => ({ url: `https://www.facebook.com/${url}` })),
    maxPosts: 10,
  })
  const status = await waitForRun(runId)
  if (status !== 'SUCCEEDED') return []
  return getDataset<any>(datasetId)
}
