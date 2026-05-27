const BASE = 'https://api.pinterest.com/v5'
const TOKEN = process.env.PINTEREST_ACCESS_TOKEN!

async function pinterestFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
    next: { revalidate: 3600 }, // cache 1h
  })
  if (!res.ok) throw new Error(`Pinterest API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getPinterestProfile() {
  return pinterestFetch('/user_account')
}

export async function getPinterestBoards() {
  const data = await pinterestFetch('/boards?page_size=25')
  return (data.items || []).filter((b: any) => b.privacy === 'PUBLIC')
}

export async function getPinterestPins(pageSize = 25, bookmark?: string) {
  const bm = bookmark ? `&bookmark=${bookmark}` : ''
  return pinterestFetch(`/pins?page_size=${pageSize}${bm}`)
}

export async function getPinterestAccountAnalytics(startDate: string, endDate: string) {
  return pinterestFetch(
    `/user_account/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=IMPRESSION,OUTBOUND_CLICK,PIN_CLICK,SAVE`
  )
}

export async function getPinterestPinAnalytics(pinId: string, startDate: string, endDate: string) {
  return pinterestFetch(
    `/pins/${pinId}/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=IMPRESSION,OUTBOUND_CLICK,PIN_CLICK,SAVE`
  )
}

export async function getPinterestBoardPins(boardId: string, pageSize = 25) {
  const data = await pinterestFetch(`/boards/${boardId}/pins?page_size=${pageSize}`)
  return data.items || []
}

// Get last 30 days of analytics, summed
export async function getPinterestMonthSummary() {
  const end = new Date()
  end.setDate(end.getDate() - 1) // yesterday (today may be processing)
  const start = new Date(end)
  start.setDate(start.getDate() - 29)

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const data = await getPinterestAccountAnalytics(fmt(start), fmt(end))

  const daily = data?.all?.daily_metrics || []
  const summary = data?.all?.summary_metrics || {}

  return {
    impressions: Math.round(summary.IMPRESSION || 0),
    pin_clicks: Math.round(summary.PIN_CLICK || 0),
    saves: Math.round(summary.SAVE || 0),
    outbound_clicks: Math.round(summary.OUTBOUND_CLICK || 0),
    daily,
    period: `${fmt(start)} → ${fmt(end)}`,
  }
}

export const PINTEREST_BOARDS = {
  carousels:   '881298289521014237',
  medicalTerms:'881298289521014252',
  nclexBlogs:  '881298289521007421',
  nursingHumor:'881298289521014253',
  pharmacology:'881298289521014247',
  quickSaves:  '881298289520728453',
  studyGuides: '881298289521014242',
}
