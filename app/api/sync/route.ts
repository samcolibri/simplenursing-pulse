import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const { target } = body

  const tasks: string[] = []
  const errors: string[] = []

  // Trigger competitor scrape
  if (!target || target === 'competitors') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : 'http://localhost:3000'}/api/apify/competitors`, {
        method: 'POST',
      })
      if (res.ok) tasks.push('competitors')
      else errors.push('competitors: ' + res.statusText)
    } catch (e: any) {
      errors.push('competitors: ' + e.message)
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    synced: tasks,
    errors,
    synced_at: new Date().toISOString(),
  })
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoints: ['/api/apify/competitors', '/api/apify/hashtags', '/api/recommendations'],
    apify_configured: !!process.env.APIFY_TOKEN,
    meta_configured: !!process.env.META_PAGE_ACCESS_TOKEN,
    pinterest_configured: !!process.env.PINTEREST_ACCESS_TOKEN,
    anthropic_configured: !!process.env.ANTHROPIC_API_KEY,
  })
}
