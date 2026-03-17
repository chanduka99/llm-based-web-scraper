'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { saveAlertConfig, testAlert } from '@/hooks/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { AlertConfig } from '@/lib/types'
import { Mail, MessageCircle, Zap, ChevronDown, Send, Save } from 'lucide-react'

export function AlertConfigTab() {
    const { alertConfig, setAlertConfig } = useStore()
    const [localConfig, setLocalConfig] = useState<AlertConfig>(alertConfig)

    const updateChannel = <K extends keyof AlertConfig>(
        channel: K,
        updates: Partial<AlertConfig[K]>
    ) => {
        setLocalConfig((prev) => ({
            ...prev,
            [channel]: { ...prev[channel], ...updates },
        }))
    }

    const toggleTrigger = (
        channel: keyof AlertConfig,
        level: string
    ) => {
        const current = localConfig[channel].triggerOn
        const updated = current.includes(level)
            ? current.filter((l) => l !== level)
            : [...current, level]
        updateChannel(channel, { triggerOn: updated })
    }

    const handleSave = async () => {
        setAlertConfig(localConfig)
        await saveAlertConfig(localConfig)
    }

    const handleTest = async (channel: 'email' | 'whatsapp' | 'slack') => {
        await testAlert(channel)
    }

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Email Card */}
            <Collapsible open={localConfig.email.enabled} onOpenChange={(open) => updateChannel('email', { enabled: open })}>
                <Card className="bg-card border-border">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    Email Alerts
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={localConfig.email.enabled}
                                        onCheckedChange={(checked) => updateChannel('email', { enabled: checked })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <ChevronDown
                                        className={`w-5 h-5 text-muted-foreground transition-transform ${localConfig.email.enabled ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="alerts@company.com"
                                    value={localConfig.email.address}
                                    onChange={(e) => updateChannel('email', { address: e.target.value })}
                                    className="bg-muted border-border font-mono"
                                />
                            </div>
                            <TriggerCheckboxes
                                channel="email"
                                triggerOn={localConfig.email.triggerOn}
                                onToggle={(level) => toggleTrigger('email', level)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTest('email')}
                                disabled={!localConfig.email.enabled || !localConfig.email.address}
                                className="border-border"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Test Email
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* WhatsApp Card */}
            <Collapsible open={localConfig.whatsapp.enabled} onOpenChange={(open) => updateChannel('whatsapp', { enabled: open })}>
                <Card className="bg-card border-border">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <MessageCircle className="w-5 h-5 text-green-400" />
                                    </div>
                                    WhatsApp Alerts
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={localConfig.whatsapp.enabled}
                                        onCheckedChange={(checked) => updateChannel('whatsapp', { enabled: checked })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <ChevronDown
                                        className={`w-5 h-5 text-muted-foreground transition-transform ${localConfig.whatsapp.enabled ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                    Phone Number (E.164 format)
                                </Label>
                                <Input
                                    type="tel"
                                    placeholder="+61400000000"
                                    value={localConfig.whatsapp.number}
                                    onChange={(e) => updateChannel('whatsapp', { number: e.target.value })}
                                    className="bg-muted border-border font-mono"
                                />
                            </div>
                            <TriggerCheckboxes
                                channel="whatsapp"
                                triggerOn={localConfig.whatsapp.triggerOn}
                                onToggle={(level) => toggleTrigger('whatsapp', level)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTest('whatsapp')}
                                disabled={!localConfig.whatsapp.enabled || !localConfig.whatsapp.number}
                                className="border-border"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Test WhatsApp
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Slack Card */}
            <Collapsible open={localConfig.slack.enabled} onOpenChange={(open) => updateChannel('slack', { enabled: open })}>
                <Card className="bg-card border-border">
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/30 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Zap className="w-5 h-5 text-purple-400" />
                                    </div>
                                    Slack Alerts
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={localConfig.slack.enabled}
                                        onCheckedChange={(checked) => updateChannel('slack', { enabled: checked })}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <ChevronDown
                                        className={`w-5 h-5 text-muted-foreground transition-transform ${localConfig.slack.enabled ? 'rotate-180' : ''
                                            }`}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Webhook URL</Label>
                                <Input
                                    type="url"
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={localConfig.slack.webhookUrl}
                                    onChange={(e) => updateChannel('slack', { webhookUrl: e.target.value })}
                                    className="bg-muted border-border font-mono text-sm"
                                />
                            </div>
                            <TriggerCheckboxes
                                channel="slack"
                                triggerOn={localConfig.slack.triggerOn}
                                onToggle={(level) => toggleTrigger('slack', level)}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTest('slack')}
                                disabled={!localConfig.slack.enabled || !localConfig.slack.webhookUrl}
                                className="border-border"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Test Slack
                            </Button>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
            </Button>
        </div>
    )
}

function TriggerCheckboxes({
    channel,
    triggerOn,
    onToggle,
}: {
    channel: string
    triggerOn: string[]
    onToggle: (level: string) => void
}) {
    const levels = ['INFO', 'WARN', 'ERROR']

    return (
        <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Trigger On</Label>
            <div className="flex items-center gap-4">
                {levels.map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            id={`${channel}-${level}`}
                            checked={triggerOn.includes(level)}
                            onCheckedChange={() => onToggle(level)}
                            className="border-border"
                        />
                        <span className="text-sm font-mono text-foreground">{level}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
