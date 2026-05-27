import { NextResponse } from 'next/server'
import { scrapeInstagramProfiles, scrapeTikTokProfiles, COMPETITORS } from '@/lib/apify'

export const maxDuration = 300

export async function POST() {
  try {
    const results: Record<string, any[]> = {}

    // Scrape Instagram competitors
    const igHandles = COMPETITORS.instagram.map(c => c.handle)
    const igData = await scrapeInstagramProfiles(igHandles)
    results.instagram = igData.map((p: any) => ({
      handle: p.username,
      display_name: p.fullName,
      followers: p.followersCount,
      following: p.followingCount,
      post_count: p.postsCount,
      verified: p.verified,
      bio: p.biography,
      avatar_url: p.profilePicUrl,
      recent_posts: (p.latestPosts || []).slice(0, 5).map((post: any) => ({
        platform_post_id: post.id,
        likes: post.likesCount,
        comments: post.commentsCount,
        content_type: post.type?.toLowerCase(),
        permalink: post.url,
        thumbnail_url: post.displayUrl,
        caption: post.caption,
      })),
    }))

    // Scrape TikTok competitors
    const ttUrls = COMPETITORS.tiktok.map(c => c.handle)
    const ttData = await scrapeTikTokProfiles(ttUrls, 5)
    const ttByAccount: Record<string, any> = {}
    ttData.forEach((item: any) => {
      const author = item.authorMeta || item.author || {}
      const handle = author.name || author.uniqueId || 'unknown'
      if (!ttByAccount[handle]) {
        ttByAccount[handle] = {
          handle,
          display_name: author.nickName || author.nickname,
          followers: author.fans || author.followerCount || 0,
          following: author.following || 0,
          post_count: author.video || 0,
          hearts: author.heart || author.heartCount || 0,
          bio: author.signature || '',
          recent_posts: [],
        }
      }
      if (item.diggCount !== undefined) {
        ttByAccount[handle].recent_posts.push({
          likes: item.diggCount,
          comments: item.commentCount,
          shares: item.shareCount,
          views: item.playCount,
          caption: item.text,
          platform_post_id: item.id,
        })
      }
    })
    results.tiktok = Object.values(ttByAccount)

    return NextResponse.json({ success: true, data: results, scraped_at: new Date().toISOString() })
  } catch (err: any) {
    console.error('Competitor scrape error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to trigger competitor scrape',
    competitors: COMPETITORS,
  })
}
