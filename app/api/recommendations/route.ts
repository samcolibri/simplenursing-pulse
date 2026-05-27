import { NextResponse } from 'next/server'
import { AI_RECOMMENDATIONS_SEED } from '@/lib/data'

export async function GET() {
  // Returns seed recommendations. When ANTHROPIC_API_KEY is configured,
  // this route will generate fresh AI recommendations via Claude API.
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      recommendations: AI_RECOMMENDATIONS_SEED,
      generated_at: new Date().toISOString(),
      source: 'seed',
      message: 'Set ANTHROPIC_API_KEY to enable live AI recommendations',
    })
  }

  // TODO: Live Claude API generation
  // import Anthropic from '@anthropic-ai/sdk'
  // const client = new Anthropic()
  // const response = await client.messages.create({ ... })
  return NextResponse.json({
    recommendations: AI_RECOMMENDATIONS_SEED,
    generated_at: new Date().toISOString(),
    source: 'seed',
  })
}
