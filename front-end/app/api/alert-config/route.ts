import { NextResponse } from 'next/server'
import type { AlertConfig } from '@/lib/types'

export async function POST(request: Request) {
    const config = await request.json() as AlertConfig

    console.log('[ALERT-CONFIG] Saving alert configuration:', JSON.stringify(config, null, 2))

    return NextResponse.json({ ok: true })
}
