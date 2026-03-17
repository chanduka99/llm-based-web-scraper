'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MainContent } from '@/components/main-content'
import { useAppState } from '@/hooks/use-api'

export function Dashboard() {
    // Initialize polling on mount
    useAppState()

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <MainContent />
        </div>
    )
}
