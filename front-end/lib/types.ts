export type CouncilStatus = 'idle' | 'running' | 'queued' | 'done' | 'error'

export type Council = {
    id: string
    label: string
    url: string
    status: CouncilStatus
    linksCollected: number
    errorCount: number
    lastRun: string | null
}

export type LogEntry = {
    ts: string
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
    msg: string
    council?: string
}

export type AlertChannel = {
    enabled: boolean
    triggerOn: string[]
}

export type EmailAlert = AlertChannel & {
    address: string
}

export type WhatsAppAlert = AlertChannel & {
    number: string
}

export type SlackAlert = AlertChannel & {
    webhookUrl: string
}

export type AlertConfig = {
    email: EmailAlert
    whatsapp: WhatsAppAlert
    slack: SlackAlert
}

export type AppState = {
    councils: Council[]
    logs: LogEntry[]
    alertConfig: AlertConfig
    totalRuns: number
}

export const COUNCILS_DATA: Omit<Council, 'status' | 'linksCollected' | 'errorCount' | 'lastRun'>[] = [
    { id: 'act', label: 'ACT', url: 'tenders.act.gov.au' },
    { id: 'ausGov', label: 'AusGov', url: 'tenders.gov.au' },
    { id: 'nsw', label: 'NSW', url: 'buy.nsw.gov.au' },
    { id: 'nt', label: 'NT', url: 'tendersonline.nt.gov.au' },
    { id: 'qld', label: 'QLD', url: 'qtenders.hpw.qld.gov.au' },
    { id: 'sa', label: 'SA', url: 'tenders.sa.gov.au' },
    { id: 'tas', label: 'TAS', url: 'tenders.tas.gov.au' },
    { id: 'vic', label: 'VIC', url: 'tenders.vic.gov.au' },
    { id: 'wa', label: 'WA', url: 'tenders.wa.gov.au' },
]
