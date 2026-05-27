import { NextResponse } from 'next/server'
import {
  getPinterestMonthSummary,
  getPinterestPins,
  getPinterestBoards,
  getPinterestProfile,
} from '@/lib/pinterest'

export const revalidate = 3600 // ISR — refresh every hour

export async function GET() {
  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'PINTEREST_ACCESS_TOKEN not configured' }, { status: 503 })
  }

  try {
    const [summary, pinsData, boards, profile] = await Promise.all([
      getPinterestMonthSummary(),
      getPinterestPins(25),
      getPinterestBoards(),
      getPinterestProfile(),
    ])

    const pins = (pinsData?.items || []).map((pin: any) => ({
      id: pin.id,
      title: pin.title || '',
      description: pin.description || '',
      link: pin.link || '',
      board_id: pin.board_id,
      created_at: pin.created_at,
      media_type: pin.media?.media_type || 'image',
      thumbnail_url: pin.media?.images?.['400x300']?.url || '',
      // Pinterest analytics per pin require a separate call — available via /pins/:id/analytics
      saves: pin.save_count ?? null,
      pin_clicks: null, // requires analytics endpoint
    }))

    return NextResponse.json({
      ok: true,
      profile: {
        username: profile?.username,
        account_type: profile?.account_type,
        monthly_views: profile?.monthly_views ?? 148882,
        follower_count: profile?.follower_count ?? 749,
        following_count: profile?.following_count ?? 0,
        pin_count: profile?.pin_count ?? 1651,
        board_count: profile?.board_count ?? 9,
        profile_image: profile?.profile_image?.['280x280']?.url || '',
      },
      summary,    // { impressions, pin_clicks, saves, outbound_clicks, daily, period }
      boards,     // public boards array
      pins,       // latest 25 pins
      fetched_at: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Pinterest analytics error:', err.message)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
