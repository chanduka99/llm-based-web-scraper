'use client'

import useSWR from 'swr'
import { useStore } from '@/lib/store'
import type { AppState, AlertConfig, CouncilStatus } from '@/lib/types'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAppState() {
    const updateState = useStore((state) => state.updateState)

    const { data, error, mutate } = useSWR<AppState>('/api/state', fetcher, {
        refreshInterval: 3000,
        onSuccess: (data) => {
            updateState({
                councils: data.councils,
                logs: data.logs,
                alertConfig: data.alertConfig,
                totalRuns: data.totalRuns,
            })
        },
    })

    return { data, error, mutate }
}

export async function runCouncils(councils: string[], pages: number) {
    const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ councils, pages }),
    })
    if (res.ok) {
        toast.success(`Started scraping ${councils.length} council(s)`)
    } else {
        toast.error('Failed to start scraper')
    }
    return res.json()
}

export async function stopCouncil(council: string) {
    const res = await fetch('/api/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ council }),
    })
    if (res.ok) {
        toast.success(`Stopped ${council.toUpperCase()}`)
    } else {
        toast.error('Failed to stop scraper')
    }
    return res.json()
}

export async function saveAlertConfig(config: AlertConfig) {
    const res = await fetch('/api/alert-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    })
    if (res.ok) {
        toast.success('Alert configuration saved')
    } else {
        toast.error('Failed to save configuration')
    }
    return res.json()
}

export async function testAlert(channel: 'email' | 'whatsapp' | 'slack') {
    const res = await fetch('/api/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
    })
    if (res.ok) {
        toast.success(`Test alert sent via ${channel}`)
    } else {
        toast.error('Failed to send test alert')
    }
    return res.json()
}

export async function clearLogs() {
    const res = await fetch('/api/clear-logs', {
        method: 'POST',
    })
    if (res.ok) {
        toast.success('Logs cleared')
    } else {
        toast.error('Failed to clear logs')
    }
    return res.json()
}

export async function simulateStatus(council: string, status: CouncilStatus) {
    const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ council, status }),
    })
    if (res.ok) {
        toast.success(`Simulated ${council.toUpperCase()} as ${status}`)
    } else {
        toast.error('Failed to simulate status')
    }
    return res.json()
}
