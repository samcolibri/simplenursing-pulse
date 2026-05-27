import { NextResponse } from 'next/server'
import { scrapeInstagramHashtags, NURSING_HASHTAGS } from '@/lib/apify'

export const maxDuration = 300

export async function POST() {
  try {
    const hashtagsToScrape = NURSING_HASHTAGS.slice(0, 10)
    const data = await scrapeInstagramHashtags(hashtagsToScrape)

    const processed = data.map((h: any) => ({
      hashtag: h.hashtag || h.name,
      platform: 'instagram',
      post_count: h.postsCount || h.topPostsCount,
      captured_at: new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, data: processed, count: processed.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ hashtags: NURSING_HASHTAGS })
}
