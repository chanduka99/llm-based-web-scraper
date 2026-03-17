import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    const { councils, pages } = body as { councils: string[]; pages: number }

    console.log('[RUN] Starting scraper for councils:', councils, 'with', pages, 'pages each')

    return NextResponse.json({ ok: true })
}
