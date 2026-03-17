'use client'

import { useStore } from '@/lib/store'
import { clearLogs } from '@/hooks/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { COUNCILS_DATA } from '@/lib/types'
import { Trash2, Info, AlertTriangle, XCircle, Bug } from 'lucide-react'

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

export function ErrorLogsTab() {
    const { logs, logFilters, toggleLogLevel, setLogCouncilFilter } = useStore()

    const filteredLogs = logs.filter((log) => {
        if (!logFilters.levels.includes(log.level)) return false
        if (logFilters.council && log.council !== logFilters.council) return false
        return true
    })

    const levelCounts = {
        INFO: logs.filter((l) => l.level === 'INFO').length,
        WARN: logs.filter((l) => l.level === 'WARN').length,
        ERROR: logs.filter((l) => l.level === 'ERROR').length,
        DEBUG: logs.filter((l) => l.level === 'DEBUG').length,
    }

    const handleClear = async () => {
        await clearLogs()
    }

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Filter Bar */}
            <Card className="bg-card border-border">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <LevelToggle
                                level="INFO"
                                active={logFilters.levels.includes('INFO')}
                                onToggle={() => toggleLogLevel('INFO')}
                            />
                            <LevelToggle
                                level="WARN"
                                active={logFilters.levels.includes('WARN')}
                                onToggle={() => toggleLogLevel('WARN')}
                            />
                            <LevelToggle
                                level="ERROR"
                                active={logFilters.levels.includes('ERROR')}
                                onToggle={() => toggleLogLevel('ERROR')}
                            />
                            <LevelToggle
                                level="DEBUG"
                                active={logFilters.levels.includes('DEBUG')}
                                onToggle={() => toggleLogLevel('DEBUG')}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Select
                                value={logFilters.council || 'all'}
                                onValueChange={(v) => setLogCouncilFilter(v === 'all' ? null : v)}
                            >
                                <SelectTrigger className="w-36 bg-muted border-border">
                                    <SelectValue placeholder="All councils" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All councils</SelectItem>
                                    {COUNCILS_DATA.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="border-border hover:bg-destructive/10 hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Log Terminal */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Log Output</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-[#0a0c10] rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                        {filteredLogs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No logs matching filters</p>
                        ) : (
                            <div className="space-y-1">
                                {filteredLogs.map((log, i) => (
                                    <LogLine key={i} log={log} />
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Level Counts */}
            <div className="grid grid-cols-4 gap-4">
                <LevelChip level="INFO" count={levelCounts.INFO} />
                <LevelChip level="WARN" count={levelCounts.WARN} />
                <LevelChip level="ERROR" count={levelCounts.ERROR} />
                <LevelChip level="DEBUG" count={levelCounts.DEBUG} />
            </div>
        </div>
    )
}

function LevelToggle({
    level,
    active,
    onToggle,
}: {
    level: LogLevel
    active: boolean
    onToggle: () => void
}) {
    const colors = {
        INFO: 'bg-green-500',
        WARN: 'bg-amber-500',
        ERROR: 'bg-red-500',
        DEBUG: 'bg-blue-500',
    }

    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${active ? 'bg-muted text-foreground' : 'bg-transparent text-muted-foreground'
                }`}
        >
            <span className={`w-2 h-2 rounded-full ${colors[level]} ${active ? '' : 'opacity-30'}`} />
            {level}
        </button>
    )
}

function LogLine({ log }: { log: { ts: string; level: LogLevel; msg: string; council?: string } }) {
    const levelConfig = {
        INFO: { color: 'text-green-400', icon: <Info className="w-3 h-3" /> },
        WARN: { color: 'text-amber-400', icon: <AlertTriangle className="w-3 h-3" /> },
        ERROR: { color: 'text-red-400', icon: <XCircle className="w-3 h-3" /> },
        DEBUG: { color: 'text-blue-400', icon: <Bug className="w-3 h-3" /> },
    }

    const { color, icon } = levelConfig[log.level]

    return (
        <div className="flex items-start gap-2 py-0.5 hover:bg-white/5 rounded px-1">
            <span className="text-muted-foreground shrink-0">{log.ts}</span>
            <span className={`flex items-center gap-1 shrink-0 w-16 ${color}`}>
                {icon}
                {log.level}
            </span>
            {log.council && (
                <span className="text-secondary shrink-0">[{log.council.toUpperCase()}]</span>
            )}
            <span className="text-foreground">{log.msg}</span>
        </div>
    )
}

function LevelChip({ level, count }: { level: LogLevel; count: number }) {
    const config = {
        INFO: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <Info className="w-4 h-4" /> },
        WARN: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertTriangle className="w-4 h-4" /> },
        ERROR: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="w-4 h-4" /> },
        DEBUG: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Bug className="w-4 h-4" /> },
    }

    const { bg, text, icon } = config[level]

    return (
        <Card className="bg-card border-border">
            <CardContent className="p-3">
                <div className={`flex items-center gap-3 ${text}`}>
                    <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
                    <div>
                        <p className="text-2xl font-bold font-mono">{count}</p>
                        <p className="text-xs text-muted-foreground">{level}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
