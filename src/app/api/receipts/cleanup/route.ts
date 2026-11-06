import { type NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'

import { runReceiptCleanup } from '@/lib/receipts/cleanup'

export const runtime = 'nodejs'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const actual = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret ?? ''}`)

  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return new NextResponse(null, { status: 401 })

  try {
    return NextResponse.json(await runReceiptCleanup(), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Cleanup unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
