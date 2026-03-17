'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { runCouncils, stopCouncil, simulateStatus } from '@/hooks/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { COUNCILS_DATA } from '@/lib/types'
import type { CouncilStatus as CouncilStatusType } from '@/lib/types'
import {
    Link,
    Activity,
    AlertTriangle,
    Building2,
    Play,
    Square,
    ChevronDown,
    ExternalLink,
} from 'lucide-react'

export function CouncilStatusTab() {
    const { councils, totalRuns, pagesPerCouncil } = useStore()
    const [simOpen, setSimOpen] = useState(false)
    const [simCouncil, setSimCouncil] = useState('')
    const [simStatus, setSimStatus] = useState<CouncilStatusType>('idle')

    const totalLinks = councils.reduce((sum, c) => sum + c.linksCollected, 0)
    const totalErrors = councils.reduce((sum, c) => sum + c.errorCount, 0)

    const handleRunSingle = async (councilId: string) => {
        await runCouncils([councilId], pagesPerCouncil)
    }

    const handleStopSingle = async (councilId: string) => {
        await stopCouncil(councilId)
    }

    const handleSimulate = async () => {
        if (!simCouncil) return
        await simulateStatus(simCouncil, simStatus)
    }

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard
                    title="Total Links"
                    value={totalLinks.toString()}
                    icon={<Link className="w-4 h-4" />}
                    color="text-primary"
                />
                <MetricCard
                    title="Total Runs"
                    value={totalRuns.toString()}
                    icon={<Activity className="w-4 h-4" />}
                    color="text-secondary"
                />
                <MetricCard
                    title="Total Errors"
                    value={totalErrors.toString()}
                    icon={<AlertTriangle className="w-4 h-4" />}
                    color="text-destructive"
                />
                <MetricCard
                    title="Councils"
                    value={councils.length.toString()}
                    icon={<Building2 className="w-4 h-4" />}
                    color="text-green-500"
                />
            </div>

            {/* Council Table */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Council Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="pb-3 font-mono text-xs text-muted-foreground">COUNCIL</th>
                                    <th className="pb-3 font-mono text-xs text-muted-foreground">STATUS</th>
                                    <th className="pb-3 font-mono text-xs text-muted-foreground text-right">LINKS</th>
                                    <th className="pb-3 font-mono text-xs text-muted-foreground text-right">ERRORS</th>
                                    <th className="pb-3 font-mono text-xs text-muted-foreground">LAST RUN</th>
                                    <th className="pb-3 font-mono text-xs text-muted-foreground text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {councils.map((council) => (
                                    <tr key={council.id} className="border-b border-border/50 hover:bg-muted/30">
                                        <td className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{council.label}</span>
                                                <a
                                                    href={`https://${council.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                                >
                                                    {council.url}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={council.status} />
                                        </td>
                                        <td className="py-3 text-right font-mono text-sm text-foreground">
                                            {council.linksCollected.toLocaleString()}
                                        </td>
                                        <td className="py-3 text-right font-mono text-sm text-foreground">
                                            {council.errorCount}
                                        </td>
                                        <td className="py-3 font-mono text-xs text-muted-foreground">
                                            {council.lastRun
                                                ? new Date(council.lastRun).toLocaleString('en-AU', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short',
                                                })
                                                : 'Never'}
                                        </td>
                                        <td className="py-3 text-right">
                                            {council.status === 'running' || council.status === 'queued' ? (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleStopSingle(council.id)}
                                                    className="h-7 px-2"
                                                >
                                                    <Square className="w-3 h-3 mr-1" />
                                                    Stop
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRunSingle(council.id)}
                                                    className="h-7 px-2 bg-gradient-to-r from-primary to-secondary"
                                                >
                                                    <Play className="w-3 h-3 mr-1" />
                                                    Run
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Simulate Panel */}
            <Collapsible open={simOpen} onOpenChange={setSimOpen}>
                <Card className="bg-card border-border">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 rounded-t-lg">
                            <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground">
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${simOpen ? 'rotate-180' : ''}`}
                                />
                                Simulate state (demo)
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-muted-foreground mb-1 block">Council</label>
                                    <Select value={simCouncil} onValueChange={setSimCouncil}>
                                        <SelectTrigger className="bg-muted border-border">
                                            <SelectValue placeholder="Select council" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNCILS_DATA.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                                    <Select value={simStatus} onValueChange={(v) => setSimStatus(v as CouncilStatusType)}>
                                        <SelectTrigger className="bg-muted border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="idle">Idle</SelectItem>
                                            <SelectItem value="running">Running</SelectItem>
                                            <SelectItem value="queued">Queued</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                            <SelectItem value="error">Error</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSimulate}
                                    disabled={!simCouncil}
                                    className="bg-gradient-to-r from-primary to-secondary"
                                >
                                    Apply
                                </Button>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    )
}

function MetricCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: string
    icon: React.ReactNode
    color: string
}) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono text-muted-foreground uppercase">{title}</p>
                        <p className="text-2xl font-bold font-mono text-foreground mt-1">{value}</p>
                    </div>
                    <div className={`p-2 bg-muted rounded-lg ${color}`}>{icon}</div>
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: CouncilStatusType }) {
    const config = {
        idle: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Idle', pulse: false },
        running: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Running', pulse: true },
        queued: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Queued', pulse: false },
        done: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Done', pulse: false },
        error: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Error', pulse: false },
    } satisfies Record<CouncilStatusType, { bg: string; text: string; label: string; pulse?: boolean }>

    const { bg, text, label, pulse } = config[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-mono ${bg} ${text} ${pulse ? 'animate-pulse-opacity' : ''}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''} ${text.replace('text-', 'bg-')}`} />
            {label}
        </span>
    )
}