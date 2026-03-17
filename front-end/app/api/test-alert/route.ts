import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    const { channel } = body as { channel: 'email' | 'whatsapp' | 'slack' }

    console.log('[TEST-ALERT] Sending test alert via:', channel)

    return NextResponse.json({ ok: true })
}
