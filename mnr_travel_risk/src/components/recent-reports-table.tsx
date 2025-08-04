"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, AlertTriangle } from "lucide-react"
import { RiskReport } from "@/generated/prisma"
import { Coord } from "@/types/coord"

interface Report {
    id: string
    coordinates: {
        lat: number
        lng: number
    }
    risklevel: number
    riskDescription?: string
    createdAt: string
}

export function RecentReportsDrawer() {
    const [reports, setReports] = useState<RiskReport[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchReports() {
            try {
                const response = await fetch("/api/report")
                if (!response.ok) {
                    throw new Error("Failed to fetch reports")
                }
                const data = await response.json()
                console.log("Fetched reports:", data)
                setReports(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load reports")
            } finally {
                setIsLoading(false)
            }
        }

        fetchReports()
    }, [])

    const formatLocation = (coordinates: any) => {
        if (!coordinates || typeof coordinates !== 'object') return 'Unknown location'
        
        const coord = coordinates as Coord
        if (typeof coord.lat === 'number' && typeof coord.lng === 'number') {
            return `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`
        }
        return 'Invalid coordinates'
    }

    const formatTime = (dateString: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - new Date(dateString).getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="text-sm text-gray-500">Loading reports...</p>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <p className="text-sm text-red-500 text-center">{error}</p>
                </div>
            )
        }

        if (reports.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <MapPin className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500 text-center">
                        No reports available yet
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                        Be the first to report traffic conditions in your area!
                    </p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-4 gap-4 px-4">
                {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                        <CardContent className="p-0 space-y-3">                            
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-mono">
                                        {report.riskType}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-mono">
                                        {formatLocation(report.coordinates)}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        {formatTime(report.createdAt)}
                                    </span>
                                </div>
                                
                                {report.riskDescription && (
                                    <div className="text-sm text-gray-700">
                                        {report.riskDescription}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">
                    <Clock className="h-4 w-4" />
                    Recent Reports
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="">
                    <DrawerHeader>
                        <DrawerTitle>Recent Reports</DrawerTitle>
                        <DrawerDescription>
                            Latest community reports from the past 24 hours
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="w-full">
                        {renderContent()}
                    </div>
                    
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
