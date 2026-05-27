import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'youtube'

export type Account = {
  id: string
  platform: Platform
  handle: string
  display_name: string | null
  avatar_url: string | null
  is_owned: boolean
  is_competitor: boolean
  competitor_tier: 'direct' | 'indirect' | 'influencer' | null
  followers: number
  following: number
  post_count: number
  verified: boolean
  bio: string | null
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  account_id: string
  platform_post_id: string
  posted_at: string
  content_type: 'reel' | 'image' | 'carousel' | 'video' | 'pin' | 'story' | 'tiktok'
  caption: string | null
  media_url: string | null
  thumbnail_url: string | null
  hashtags: string[]
  mentioned_sounds: string[]
  ai_topic: string | null
  ai_format: string | null
  ai_summary: string | null
  permalink: string | null
}

export type PostMetrics = {
  id: number
  post_id: string
  captured_at: string
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  reach: number | null
  impressions: number | null
  engagement_rate: number | null
  follower_count_at_capture: number | null
}

export type MonthlyMetrics = {
  id: string
  platform: Platform
  month: string
  accounts_reached: number | null
  total_views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  new_follows: number | null
  sessions: number | null
  free_trials: number | null
  revenue_ga4: number | null
  revenue_shopify: number | null
  ftcr: number | null
  follower_pct_views: number | null
  non_follower_pct_views: number | null
  engaged_audience: number | null
  post_count: number | null
  broadcast_members: string | null
}

export type TrendingHashtag = {
  id: number
  hashtag: string
  platform: Platform
  captured_at: string
  post_count: number | null
  view_count: number | null
  velocity_24h: number | null
}

export type AiRecommendation = {
  id: string
  created_at: string
  type: 'post_idea' | 'format_shift' | 'timing' | 'hashtag' | 'competitor_alert'
  priority: 'high' | 'med' | 'low'
  title: string
  body: string
  evidence_post_ids: string[]
  platform: Platform | null
}
