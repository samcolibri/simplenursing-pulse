// Seeded from Social Performance Tracker (2026).xlsx — Jan to Apr 2026
// This is used as mock/seed data until live API connections are wired

export const SEED_MONTHLY_METRICS = [
  // INSTAGRAM
  { platform: 'instagram', month: '2026-01', accounts_reached: 2753754, total_views: 6083475, likes: 65257, comments: 1397, shares: 18733, saves: 18117, new_follows: 4623, sessions: 1798, free_trials: 210, revenue_ga4: 813.95, revenue_shopify: 509.95, ftcr: null, follower_pct_views: 0.442, non_follower_pct_views: 0.556, broadcast_members: '9.1k' },
  { platform: 'instagram', month: '2026-02', accounts_reached: 2080664, total_views: 5621747, likes: 80721, comments: 758, shares: 31278, saves: 10587, new_follows: 5816, sessions: 1646, free_trials: 188, revenue_ga4: 352, revenue_shopify: 45, ftcr: null, follower_pct_views: 0.449, non_follower_pct_views: 0.551, broadcast_members: '9.1k' },
  { platform: 'instagram', month: '2026-03', accounts_reached: 1626707, total_views: 3603150, likes: 26641, comments: 352, shares: 4886, saves: 6757, new_follows: 12954, sessions: 869, free_trials: 106, revenue_ga4: 1197.55, revenue_shopify: 489.96, ftcr: null, follower_pct_views: 0.574, non_follower_pct_views: 0.426, broadcast_members: '9.2k' },
  { platform: 'instagram', month: '2026-04', accounts_reached: 1664455, total_views: 4239995, likes: 38118, comments: 298, shares: 5254, saves: 11624, new_follows: 12511, sessions: 1214, free_trials: 150, revenue_ga4: 980.97, revenue_shopify: 233.99, ftcr: null, follower_pct_views: 0.384, non_follower_pct_views: 0.616, avg_skip_rate: 0.777, avg_share_rate: 0.003, avg_like_rate: 0.013, avg_save_rate: 0.006, broadcast_members: '9.2k' },

  // FACEBOOK
  { platform: 'facebook', month: '2026-01', total_views: 12816129, accounts_reached: 4052049, fb_visits: 43911, content_interactions: 66020, new_follows: 16371, free_trials: 142, sessions: 3789, revenue_ga4: 720.49, revenue_shopify: 349.93, follower_pct_views: 0.134, non_follower_pct_views: 0.837, fb_group_members: '39.4k' },
  { platform: 'facebook', month: '2026-02', total_views: 7760649, accounts_reached: 2632548, fb_visits: 24789, content_interactions: 33740, new_follows: 7810, free_trials: 84, sessions: 2511, revenue_ga4: 451.99, revenue_shopify: 139.99, follower_pct_views: 0.148, non_follower_pct_views: 0.82, fb_group_members: '39.8k' },
  { platform: 'facebook', month: '2026-03', total_views: 12580793, accounts_reached: 4892622, fb_visits: 13623, content_interactions: 14733, new_follows: 3789, free_trials: 47, sessions: 2552, revenue_ga4: 88.99, revenue_shopify: 0, follower_pct_views: 0.053, non_follower_pct_views: 0.94, fb_group_members: '39.9k' },
  { platform: 'facebook', month: '2026-04', total_views: 7074880, accounts_reached: 1940977, fb_visits: 19109, content_interactions: 19918, new_follows: 4090, free_trials: 55, sessions: 1689, revenue_ga4: 0, revenue_shopify: 179.99, follower_pct_views: 0.158, non_follower_pct_views: 0.842, fb_group_members: '40.1k' },

  // TIKTOK
  { platform: 'tiktok', month: '2026-01', total_views: 16057347, accounts_reached: 15364361, profile_views: 60884, engaged_audience: 231399, likes: 142213, comments: 2186, shares: 16368, saves: 10988, new_follows: 14263, post_count: 53, sessions: 1775, free_trials: 199, revenue_ga4: 1620.85, revenue_shopify: 1409.84, follower_pct_views: 0.57, non_follower_pct_views: 0.43, returning_views_pct: 0.92, broadcast_members: '5.8k' },
  { platform: 'tiktok', month: '2026-02', total_views: 17222661, accounts_reached: 16028127, profile_views: 101574, engaged_audience: 585200, likes: 214278, comments: 2868, shares: 26545, saves: 5234, new_follows: 24814, post_count: 40, sessions: 3024, free_trials: 464, revenue_ga4: 1242.42, revenue_shopify: 661.36, follower_pct_views: 0.58, non_follower_pct_views: 0.42, returning_views_pct: 0.89, broadcast_members: '7.2k' },
  { platform: 'tiktok', month: '2026-03', total_views: 12398586, accounts_reached: 11863501, profile_views: 63000, engaged_audience: 276796, likes: 107071, comments: 218, shares: 12682, saves: 4586, new_follows: 13120, post_count: 48, sessions: 1396, free_trials: 82, revenue_ga4: 1064.52, revenue_shopify: 359.96, follower_pct_views: 0.59, non_follower_pct_views: 0.41, returning_views_pct: 0.87, broadcast_members: '7.9k' },
  { platform: 'tiktok', month: '2026-04', total_views: 12296014, accounts_reached: 11791676, profile_views: 86918, engaged_audience: 278521, likes: 178819, comments: 1369, shares: 3639, saves: 11764, new_follows: 15323, post_count: 48, sessions: 2644, free_trials: 52, revenue_ga4: 280.80, revenue_shopify: 179.99, follower_pct_views: 0.60, non_follower_pct_views: 0.40, returning_views_pct: 0.91, broadcast_members: '8.8k' },
] as const

export const COMPETITOR_SEED = [
  { platform: 'instagram', handle: 'registerednursern_com', display_name: 'Nurse Sarah', followers: 948436, verified: true, tier: 'direct', bio: 'Follow for NCLEX & Nursing School Reviews 🩺 NurseSarah.com' },
  { platform: 'instagram', handle: 'kristine_nurseinthemaking', display_name: 'Nurse In The Making', followers: 720000, verified: false, tier: 'direct', bio: 'Nursing student tips & NCLEX prep' },
  { platform: 'instagram', handle: 'yournursingeducator', display_name: 'Barbara | BSN, RN', followers: 509812, verified: true, tier: 'direct', bio: 'Owner of @nurseiq · Telemetry RN · Toronto' },
  { platform: 'tiktok', handle: 'registerednursern.com', display_name: 'Nurse Sarah', followers: 1300000, verified: false, tier: 'direct', bio: 'NCLEX & Nursing School content' },
  { platform: 'tiktok', handle: 'archernursing', display_name: 'Archer Review', followers: 450000, verified: false, tier: 'direct', bio: 'NCLEX prep that works' },
  { platform: 'facebook', handle: 'RegisteredNurseRNs', display_name: 'RegisteredNurseRN', followers: 680000, verified: false, tier: 'direct', bio: '' },
  { platform: 'facebook', handle: 'anurseinthemaking', display_name: 'A Nurse In The Making', followers: 350000, verified: false, tier: 'direct', bio: '' },
]

export const TRENDING_HASHTAGS_SEED = [
  { hashtag: 'nursingstudent', platform: 'tiktok', post_count: 4200000, velocity_24h: 3.2 },
  { hashtag: 'nursetok', platform: 'tiktok', post_count: 2800000, velocity_24h: 5.8 },
  { hashtag: 'nclex', platform: 'tiktok', post_count: 1900000, velocity_24h: 2.1 },
  { hashtag: 'nursingschool', platform: 'instagram', post_count: 8500000, velocity_24h: 1.4 },
  { hashtag: 'shiftlife', platform: 'tiktok', post_count: 920000, velocity_24h: 7.3 },
  { hashtag: 'medtok', platform: 'tiktok', post_count: 3100000, velocity_24h: 4.5 },
  { hashtag: 'studentnurse', platform: 'instagram', post_count: 2400000, velocity_24h: 2.9 },
  { hashtag: 'futurenurse', platform: 'tiktok', post_count: 1200000, velocity_24h: 6.1 },
  { hashtag: 'nursememes', platform: 'instagram', post_count: 1800000, velocity_24h: 1.2 },
  { hashtag: 'scrublife', platform: 'tiktok', post_count: 760000, velocity_24h: 8.4 },
]

export const OWNED_ACCOUNTS_SEED = [
  { platform: 'instagram', handle: 'simplenursing.com_', display_name: 'Nurse Mike from Simple Nursing', followers: 862531, verified: true, is_owned: true, bio: 'Simplify nursing school & the NCLEX | 99% NCLEX pass rate 🩺' },
  { platform: 'facebook', handle: 'simplenursing', display_name: 'Simple Nursing', followers: 580000, verified: false, is_owned: true, bio: 'Making nursing simple' },
  { platform: 'tiktok', handle: 'simplenursing', display_name: 'Simple Nursing', followers: 1050000, verified: false, is_owned: true, bio: 'Nursing school made simple' },
]

export const AI_RECOMMENDATIONS_SEED = [
  {
    type: 'competitor_alert',
    priority: 'high',
    title: 'RegisteredNurseRN just hit 1.4M views on ECG Rhythms',
    body: 'A TikTok from @registerednursern.com on "ECG Rhythms You Need to Know" reached 1.4M views with 53K likes and 8,154 shares in under a week. SimpleNursing has not posted ECG content in 30+ days. This topic is trending NOW in #NurseTok. Post a SimpleNursing ECG breakdown this week before the wave passes.',
    platform: 'tiktok',
    evidence_post_ids: [],
  },
  {
    type: 'post_idea',
    priority: 'high',
    title: 'Post "Lab Values Cheat Sheet" — high save signal across all platforms',
    body: 'Save rates on competitor posts around lab values (BMP, CBC, metabolic panel) are 3-4x the platform average. SimpleNursing\'s strongest content format (visual breakdown + Nurse Mike narration) maps perfectly. Expected 10K+ saves on TikTok based on current trajectory.',
    platform: 'tiktok',
    evidence_post_ids: [],
  },
  {
    type: 'format_shift',
    priority: 'med',
    title: 'TikTok FTCR dropped 75% from Feb to Apr — trial CTA needs testing',
    body: 'TikTok Free Trial Conversion Rate fell from 15.3% (Feb) to just 2.0% (Apr). Sessions stayed similar but trials collapsed. Either the CTA is weaker or the audience landing on the trial page changed. Test: pin a comment with the free trial link + "use code TIKTOK" on the next 5 videos.',
    platform: 'tiktok',
    evidence_post_ids: [],
  },
  {
    type: 'timing',
    priority: 'med',
    title: 'Feb was your best TikTok month — 464 trials, 585K engaged. Replicate it.',
    body: 'February 2026 produced 464 free trials (vs 52 in April), 585K engaged audience, and $1,242 GA4 revenue — all from 40 posts (vs 48 in April). Fewer posts, better results. The data suggests quality over quantity: 10 focused posts/week beat 12 scattered ones. Audit what February\'s content looked like vs April.',
    platform: 'tiktok',
    evidence_post_ids: [],
  },
  {
    type: 'hashtag',
    priority: 'med',
    title: '#scrublife velocity is 8.4% — SimpleNursing hasn\'t used it in 14 days',
    body: '#scrublife is surging on TikTok (8.4% 24h velocity, 760K posts). It\'s lifestyle-adjacent content that performs well with nursing students. A "What\'s in my nursing school bag" or "Study setup" video tagged with #scrublife + #nursetok could cross-promote to a new segment.',
    platform: 'tiktok',
    evidence_post_ids: [],
  },
  {
    type: 'post_idea',
    priority: 'low',
    title: 'Instagram New Follows surged to 12.9K in March — what drove it?',
    body: 'New Instagram follows jumped from 5.8K (Feb) to 12.9K (March) and held at 12.5K (April). This is a 2x step change. If you can identify which post or campaign drove it, doubling down could push follows even higher. Pull post-level data for March to find the driver.',
    platform: 'instagram',
    evidence_post_ids: [],
  },
]
