import { NextResponse } from 'next/server'
import type { AppState, Council, LogEntry, AlertConfig, CouncilStatus } from '@/lib/types'
import { COUNCILS_DATA } from '@/lib/types'

// In-memory state for demo purposes
let mockCouncils: Council[] = COUNCILS_DATA.map((c, i) => {
    const statuses: CouncilStatus[] = ['idle', 'running', 'queued', 'done', 'error', 'idle', 'done', 'running', 'idle']
    return {
        ...c,
        status: statuses[i % statuses.length],
        linksCollected: Math.floor(Math.random() * 500) + 50,
        errorCount: Math.floor(Math.random() * 10),
        lastRun: i % 3 === 0 ? null : new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }
})

let mockLogs: LogEntry[] = [
    { ts: '14:32:15', level: 'INFO', msg: 'Scraper initialized successfully' },
    { ts: '14:32:10', level: 'INFO', msg: 'Starting council scan cycle', council: 'nsw' },
    { ts: '14:31:45', level: 'DEBUG', msg: 'Fetching page 1 of 5', council: 'nsw' },
    { ts: '14:31:30', level: 'WARN', msg: 'Rate limit approaching, slowing down', council: 'vic' },
    { ts: '14:31:15', level: 'ERROR', msg: 'Connection timeout after 30s', council: 'qld' },
    { ts: '14:30:55', level: 'INFO', msg: 'Found 47 new tender listings', council: 'nsw' },
    { ts: '14:30:40', level: 'DEBUG', msg: 'Processing tender ID: T-2024-1847', council: 'act' },
    { ts: '14:30:25', level: 'INFO', msg: 'Database sync completed', council: 'ausGov' },
    { ts: '14:30:10', level: 'WARN', msg: 'Duplicate entry detected, skipping', council: 'sa' },
    { ts: '14:29:55', level: 'ERROR', msg: 'Invalid response format from API', council: 'nt' },
]

let mockAlertConfig: AlertConfig = {
    email: { enabled: false, address: '', triggerOn: ['ERROR'] },
    whatsapp: { enabled: false, number: '', triggerOn: ['ERROR'] },
    slack: { enabled: false, webhookUrl: '', triggerOn: ['ERROR', 'WARN'] },
}

let totalRuns = 142

export async function GET() {
    const state: AppState = {
        councils: mockCouncils,
        logs: mockLogs,
        alertConfig: mockAlertConfig,
        totalRuns,
    }

    return NextResponse.json(state)
}

// Export mutable state for other routes
export { mockCouncils, mockLogs, mockAlertConfig, totalRuns }
export function setMockCouncils(councils: Council[]) { mockCouncils = councils }
export function setMockLogs(logs: LogEntry[]) { mockLogs = logs }
export function setMockAlertConfig(config: AlertConfig) { mockAlertConfig = config }
export function setTotalRuns(runs: number) { totalRuns = runs }
