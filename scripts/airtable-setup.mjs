#!/usr/bin/env node
// airtable-setup.mjs — One-time brain init for the Pulse agent.
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_ID = 'appZ8hLqv6SSvnsig'
const API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE = 'https://api.airtable.com/v0'
if (!API_KEY) { console.error('AIRTABLE_API_KEY not set'); process.exit(1) }

const H = { Authorization: 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const log = (...a) => console.log('[setup]', ...a)
async function api(method, p, body) {
  const r = await fetch(AIRTABLE + p, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(method + ' ' + p + ' → ' + r.status + ': ' + (await r.text()).slice(0, 400))
  return r.json()
}
// field helpers
const text = n => ({ name: n, type: 'singleLineText' })
const memo = n => ({ name: n, type: 'multilineText' })
const url  = n => ({ name: n, type: 'url' })
const num  = (n, p = 0) => ({ name: n, type: 'number', options: { precision: p } })
const money = n => ({ name: n, type: 'currency', options: { precision: 2, symbol: '$' } })
const sel  = (n, c) => ({ name: n, type: 'singleSelect', options: { choices: c.map(x => ({ name: x })) } })

const PLAT = ['TikTok', 'Instagram', 'Facebook']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const TABLES = [
  { name: 'Monthly_Metrics', description: 'Excel-verified monthly performance data', fields: [
    text('Platform · Month'), sel('Platform', PLAT), sel('Month', MONTHS),
    num('Year'), num('Month Index'), num('New Follows'), num('GA4 Sessions'),
    num('Free Trials'), num('FTCR', 4), money('GA4 Revenue'), num('Views'), text('Verified At'),
  ]},
  { name: 'Live_Stats', description: 'Current follower counts — upserted hourly', fields: [
    text('Platform'), num('Followers'), num('Following'), num('Post Count'), text('Updated At'), text('Source'),
  ]},
  { name: 'Our_Posts', description: 'SimpleNursing posts', fields: [
    text('Post ID'), sel('Platform', ['TikTok','Instagram']),
    memo('Caption'), num('Views'), num('Likes'), url('URL'), text('Created At'), text('Fetched At'),
  ]},
  { name: 'Competitor_Posts', description: 'Competitor posts', fields: [
    text('Post ID'), text('Competitor Handle'), sel('Platform', ['TikTok','Instagram']),
    memo('Caption'), num('Views'), num('Likes'), url('URL'), text('Created At'), text('Fetched At'),
  ]},
  { name: 'YouTube_Videos', description: 'SimpleNursing YT videos', fields: [
    text('Video ID'), text('Title'), num('Views'), num('Likes'),
    url('URL'), text('Published At'), text('Fetched At'),
  ]},
  { name: 'Trending_Topics', description: 'Nursing topic scores per run', fields: [
    text('Run Key'), text('Topic'), num('Score'), num('Rank'), text('Run Date'), text('Fetched At'),
  ]},
  { name: 'Team_Notes', description: 'Per-month notes from dashboard', fields: [
    text('Month Key'), memo('Note'), text('Updated At'),
  ]},
]

// Excel-verified seed data for Monthly_Metrics
const SEED = [
  {p:'TikTok',    m:'Jan',mi:0,nf:14263,s:1775, ft:199,ftcr:0.1121,rev:1620.85,v:16057347},
  {p:'TikTok',    m:'Feb',mi:1,nf:24814,s:3024, ft:464,ftcr:0.1534,rev:1242.42,v:17222661},
  {p:'TikTok',    m:'Mar',mi:2,nf:13120,s:1396, ft:82, ftcr:0.0587,rev:1064.52,v:12398586},
  {p:'TikTok',    m:'Apr',mi:3,nf:15323,s:2644, ft:52, ftcr:0.0197,rev:280.80, v:12296014},
  {p:'Instagram', m:'Jan',mi:0,nf:4623, s:1798, ft:210,ftcr:0.1168,rev:813.95, v:6083475},
  {p:'Instagram', m:'Feb',mi:1,nf:5816, s:1646, ft:188,ftcr:0.1142,rev:352.00, v:5621747},
  {p:'Instagram', m:'Mar',mi:2,nf:12954,s:869,  ft:106,ftcr:0.1220,rev:1197.55,v:3603150},
  {p:'Instagram', m:'Apr',mi:3,nf:12511,s:1214, ft:150,ftcr:0.1236,rev:980.97, v:4239995},
  {p:'Facebook',  m:'Jan',mi:0,nf:16371,s:3789, ft:142,ftcr:0.0375,rev:720.49, v:12816129},
  {p:'Facebook',  m:'Feb',mi:1,nf:7810, s:2511, ft:84, ftcr:0.0335,rev:451.99, v:7760649},
  {p:'Facebook',  m:'Mar',mi:2,nf:3789, s:2552, ft:47, ftcr:0.0184,rev:88.99,  v:12580793},
  {p:'Facebook',  m:'Apr',mi:3,nf:4090, s:1689, ft:55, ftcr:0.0326,rev:0,      v:7074880},
]

async function main() {
  const { tables: existing } = await api('GET', '/meta/bases/' + BASE_ID + '/tables')
  const existingNames = new Set(existing.map(t => t.name))
  const tableMap = Object.fromEntries(existing.map(t => [t.name, t.id]))
  log('Existing:', Array.from(existingNames).join(', '))

  // Rename "Table 1" → "Fetch_Log"
  const tbl1 = existing.find(t => t.name === 'Table 1')
  if (tbl1) {
    await sleep(250)
    await api('PATCH', '/meta/bases/' + BASE_ID + '/tables/' + tbl1.id,
      { name: 'Fetch_Log', description: 'Every hourly fetch run — status and counts' })
    tableMap['Fetch_Log'] = tbl1.id
    existingNames.delete('Table 1'); existingNames.add('Fetch_Log')
    log('Renamed Table 1 → Fetch_Log')
  }

  // Add extra fields to Fetch_Log
  if (tableMap['Fetch_Log']) {
    const fl = existing.find(t => t.id === tableMap['Fetch_Log'])
    const fNames = new Set((fl?.fields||[]).map(f=>f.name))
    const extra = [
      text('Platforms OK'), text('Platforms Failed'),
      num('Our Posts Count'), num('Competitor Posts Count'),
      num('YouTube Videos Count'), num('Topics Count'), text('Fetched At'),
    ].filter(f => !fNames.has(f.name))
    for (const field of extra) {
      await sleep(250)
      await api('POST', '/meta/bases/' + BASE_ID + '/tables/' + tableMap['Fetch_Log'] + '/fields', field)
      log('  + Fetch_Log field:', field.name)
    }
  }

  // Create tables
  for (const schema of TABLES) {
    if (existingNames.has(schema.name)) { log('Skip (exists):', schema.name); continue }
    await sleep(300)
    const c = await api('POST', '/meta/bases/' + BASE_ID + '/tables', schema)
    tableMap[schema.name] = c.id
    log('Created:', schema.name, c.id)
  }

  // Seed Monthly_Metrics if empty
  const mmId = tableMap['Monthly_Metrics']
  if (mmId) {
    await sleep(300)
    const ex = await api('GET', '/' + BASE_ID + '/' + mmId + '?maxRecords=1')
    if (!(ex.records||[]).length) {
      log('Seeding Monthly_Metrics…')
      const recs = SEED.map(d => ({ fields: {
        'Platform · Month': d.p + ' · ' + d.m + ' 2026',
        'Platform': d.p, 'Month': d.m, 'Year': 2026, 'Month Index': d.mi,
        'New Follows': d.nf, 'GA4 Sessions': d.s, 'Free Trials': d.ft,
        'FTCR': d.ftcr, 'GA4 Revenue': d.rev, 'Views': d.v, 'Verified At': '2026-05-27',
      }}))
      for (let i = 0; i < recs.length; i += 10) {
        await sleep(250)
        await api('POST', '/' + BASE_ID + '/' + mmId, { records: recs.slice(i, i+10) })
      }
      log('Seeded', recs.length, 'monthly records')
    } else { log('Monthly_Metrics already seeded') }
  }

  const out = path.join(import.meta.dirname, 'airtable-tables.json')
  await fs.writeFile(out, JSON.stringify(tableMap, null, 2))
  log('Done. Table IDs → scripts/airtable-tables.json')
  for (const [n, id] of Object.entries(tableMap)) log(' ', n.padEnd(22), id)
}

main().catch(e => { console.error('[setup] FATAL:', e.message); process.exit(1) })
