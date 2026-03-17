import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    const { council } = body as { council: string }

    console.log('[STOP] Stopping scraper for council:', council)

    return NextResponse.json({ ok: true })
}
