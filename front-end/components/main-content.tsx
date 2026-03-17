'use client'

import { useStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CouncilStatusTab } from '@/components/tabs/council-status'
import { ErrorLogsTab } from '@/components/tabs/error-logs'
import { AlertConfigTab } from '@/components/tabs/alert-config'
import { Activity, FileText, Bell } from 'lucide-react'

export function MainContent() {
    const { activeTab, setActiveTab } = useStore()

    return (
        <main className="flex-1 h-screen overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-col" >
                <TabsList className=" bg-card border border-border mb-6">
                    <TabsTrigger
                        value="status"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                        <Activity className="w-4 h-4 mr-2" />
                        Council Status
                    </TabsTrigger>
                    <TabsTrigger
                        value="logs"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Error Logs
                    </TabsTrigger>
                    <TabsTrigger
                        value="alerts"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        Alert Config
                    </TabsTrigger>
                </TabsList>


                <TabsContent value="status">
                    <CouncilStatusTab />
                </TabsContent>

                <TabsContent value="logs">
                    <ErrorLogsTab />
                </TabsContent>

                <TabsContent value="alerts">
                    <AlertConfigTab />
                </TabsContent>
            </Tabs>
        </main>
    )
}
