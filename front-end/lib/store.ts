import { create } from 'zustand'
import type { AppState, Council, LogEntry, AlertConfig, CouncilStatus } from './types'
import { COUNCILS_DATA } from './types'

function generateMockLogs(): LogEntry[] {
    const now = new Date()
    const logs: LogEntry[] = []
    const messages = [
        { level: 'INFO' as const, msg: 'Scraper initialized successfully' },
        { level: 'INFO' as const, msg: 'Starting council scan cycle', council: 'nsw' },
        { level: 'DEBUG' as const, msg: 'Fetching page 1 of 5', council: 'nsw' },
        { level: 'WARN' as const, msg: 'Rate limit approaching, slowing down', council: 'vic' },
        { level: 'ERROR' as const, msg: 'Connection timeout after 30s', council: 'qld' },
        { level: 'INFO' as const, msg: 'Found 47 new tender listings', council: 'nsw' },
        { level: 'DEBUG' as const, msg: 'Processing tender ID: T-2024-1847', council: 'act' },
        { level: 'INFO' as const, msg: 'Database sync completed', council: 'ausGov' },
        { level: 'WARN' as const, msg: 'Duplicate entry detected, skipping', council: 'sa' },
        { level: 'ERROR' as const, msg: 'Invalid response format from API', council: 'nt' },
    ]

    messages.forEach((m, i) => {
        const time = new Date(now.getTime() - (i * 30000))
        logs.push({
            ts: time.toTimeString().slice(0, 8),
            level: m.level,
            msg: m.msg,
            council: m.council,
        })
    })

    return logs
}

function generateMockCouncils(): Council[] {
    const statuses: CouncilStatus[] = ['idle', 'running', 'queued', 'done', 'error', 'idle', 'done', 'running', 'idle']
    return COUNCILS_DATA.map((c, i) => ({
        ...c,
        status: statuses[i % statuses.length],
        linksCollected: Math.floor(Math.random() * 500) + 50,
        errorCount: Math.floor(Math.random() * 10),
        lastRun: i % 3 === 0 ? null : new Date(Date.now() - Math.random() * 86400000).toISOString(),
    }))
}

const initialAlertConfig: AlertConfig = {
    email: { enabled: false, address: '', triggerOn: ['ERROR'] },
    whatsapp: { enabled: false, number: '', triggerOn: ['ERROR'] },
    slack: { enabled: false, webhookUrl: '', triggerOn: ['ERROR', 'WARN'] },
}

interface StoreState {
    councils: Council[]
    logs: LogEntry[]
    alertConfig: AlertConfig
    totalRuns: number
    selectedCouncils: string[]
    pagesPerCouncil: number
    activeTab: string
    logFilters: {
        levels: ('INFO' | 'WARN' | 'ERROR' | 'DEBUG')[]
        council: string | null
    }
    setCouncils: (councils: Council[]) => void
    setLogs: (logs: LogEntry[]) => void
    setAlertConfig: (config: AlertConfig) => void
    setTotalRuns: (count: number) => void
    setSelectedCouncils: (councils: string[]) => void
    setPagesPerCouncil: (pages: number) => void
    setActiveTab: (tab: string) => void
    toggleLogLevel: (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG') => void
    setLogCouncilFilter: (council: string | null) => void
    updateState: (state: Partial<AppState>) => void
}

export const useStore = create<StoreState>((set) => ({
    councils: generateMockCouncils(),
    logs: generateMockLogs(),
    alertConfig: initialAlertConfig,
    totalRuns: 142,
    selectedCouncils: [],
    pagesPerCouncil: 5,
    activeTab: 'status',
    logFilters: {
        levels: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
        council: null,
    },
    setCouncils: (councils) => set({ councils }),
    setLogs: (logs) => set({ logs }),
    setAlertConfig: (alertConfig) => set({ alertConfig }),
    setTotalRuns: (totalRuns) => set({ totalRuns }),
    setSelectedCouncils: (selectedCouncils) => set({ selectedCouncils }),
    setPagesPerCouncil: (pagesPerCouncil) => set({ pagesPerCouncil }),
    setActiveTab: (activeTab) => set({ activeTab }),
    toggleLogLevel: (level) =>
        set((state) => ({
            logFilters: {
                ...state.logFilters,
                levels: state.logFilters.levels.includes(level)
                    ? state.logFilters.levels.filter((l) => l !== level)
                    : [...state.logFilters.levels, level],
            },
        })),
    setLogCouncilFilter: (council) =>
        set((state) => ({
            logFilters: { ...state.logFilters, council },
        })),
    updateState: (newState) =>
        set((state) => ({
            ...state,
            ...newState,
        })),
}))
