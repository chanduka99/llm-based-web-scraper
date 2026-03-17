import { NextResponse } from 'next/server'
import type { CouncilStatus } from '@/lib/types'

export async function POST(request: Request) {
    const body = await request.json()
    const { council, status } = body as { council: string; status: CouncilStatus }

    console.log('[SIMULATE] Setting council', council, 'to status:', status)

    return NextResponse.json({ ok: true })
}
