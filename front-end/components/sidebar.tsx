'use client'

import { useStore } from '@/lib/store'
import { runCouncils } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { COUNCILS_DATA } from '@/lib/types'
import { Play, PlayCircle, Mail, MessageCircle, Zap } from 'lucide-react'

export function Sidebar() {
    const {
        councils,
        alertConfig,
        selectedCouncils,
        pagesPerCouncil,
        setSelectedCouncils,
        setPagesPerCouncil,
    } = useStore()

    const statusCounts = {
        running: councils.filter((c) => c.status === 'running').length,
        queued: councils.filter((c) => c.status === 'queued').length,
        done: councils.filter((c) => c.status === 'done').length,
        error: councils.filter((c) => c.status === 'error').length,
    }

    const handleCouncilToggle = (councilId: string) => {
        if (selectedCouncils.includes(councilId)) {
            setSelectedCouncils(selectedCouncils.filter((id) => id !== councilId))
        } else {
            setSelectedCouncils([...selectedCouncils, councilId])
        }
    }

    const handleRunSelected = async () => {
        if (selectedCouncils.length === 0) return
        await runCouncils(selectedCouncils, pagesPerCouncil)
    }

    const handleRunAll = async () => {
        const allIds = COUNCILS_DATA.map((c) => c.id)
        await runCouncils(allIds, pagesPerCouncil)
    }

    return (
        <aside className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col p-4 shrink-0">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
                    <span className="text-2xl">🕷</span> TenderScraper
                </h1>
                <p className="text-xs font-mono text-muted-foreground tracking-widest mt-1">
                    CONTROL ROOM
                </p>
            </div>

            {/* Council Picker */}
            <div className="mb-4">
                <Label className="text-xs text-muted-foreground mb-2 block">
                    Select Councils
                </Label>
                <div className="bg-muted rounded-lg p-2 max-h-48 overflow-y-auto space-y-1">
                    {COUNCILS_DATA.map((council) => (
                        <label
                            key={council.id}
                            className="flex items-center gap-2 p-1.5 rounded hover:bg-card cursor-pointer text-sm"
                        >
                            <Checkbox
                                checked={selectedCouncils.includes(council.id)}
                                onCheckedChange={() => handleCouncilToggle(council.id)}
                                className="border-border"
                            />
                            <span className="font-mono text-foreground">{council.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pages Input */}
            <div className="mb-4">
                <Label className="text-xs text-muted-foreground mb-2 block">
                    Pages per Council
                </Label>
                <Input
                    type="number"
                    min={1}
                    max={100}
                    value={pagesPerCouncil}
                    onChange={(e) => setPagesPerCouncil(Number(e.target.value))}
                    className="bg-muted border-border font-mono"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mb-6">
                <Button
                    onClick={handleRunSelected}
                    disabled={selectedCouncils.length === 0}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Run Selected
                </Button>
                <Button
                    onClick={handleRunAll}
                    variant="outline"
                    className="border-border hover:bg-muted"
                >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run All
                </Button>
            </div>

            {/* Status Summary */}
            <div className="mb-6">
                <Label className="text-xs text-muted-foreground mb-2 block">
                    Live Status
                </Label>
                <div className="grid grid-cols-2 gap-2">
                    <StatusChip label="Running" count={statusCounts.running} color="bg-blue-500" pulse />
                    <StatusChip label="Queued" count={statusCounts.queued} color="bg-amber-500" />
                    <StatusChip label="Done" count={statusCounts.done} color="bg-green-500" />
                    <StatusChip label="Error" count={statusCounts.error} color="bg-red-500" />
                </div>
            </div>

            {/* Alert Channels */}
            <div className="mt-auto">
                <Label className="text-xs text-muted-foreground mb-2 block">
                    Active Alerts
                </Label>
                <div className="flex flex-wrap gap-2">
                    {alertConfig.email.enabled && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-mono">
                            <Mail className="w-3 h-3" />
                            Email
                        </div>
                    )}
                    {alertConfig.whatsapp.enabled && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-mono">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                        </div>
                    )}
                    {alertConfig.slack.enabled && (
                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-mono">
                            <Zap className="w-3 h-3" />
                            Slack
                        </div>
                    )}
                    {!alertConfig.email.enabled && !alertConfig.whatsapp.enabled && !alertConfig.slack.enabled && (
                        <span className="text-xs text-muted-foreground">No alerts configured</span>
                    )}
                </div>
            </div>
        </aside>
    )
}

function StatusChip({
    label,
    count,
    color,
    pulse,
}: {
    label: string
    count: number
    color: string
    pulse?: boolean
}) {
    return (
        <div className="flex items-center gap-2 bg-muted px-2 py-1.5 rounded">
            <span
                className={`w-2 h-2 rounded-full ${color} ${pulse && count > 0 ? 'animate-pulse-opacity' : ''}`}
            />
            <span className="text-xs font-mono text-foreground">
                {count} {label}
            </span>
        </div>
    )
}
