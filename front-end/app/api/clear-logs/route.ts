import { NextResponse } from 'next/server'

export async function POST() {
    console.log('[CLEAR-LOGS] Clearing all logs')

    return NextResponse.json({ ok: true })
}
