"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface Report {
    id: string
    coordinates: {
        lat: number
        lng: number
    }
    riskLevel: number
    riskDescription?: string
    createdAt: string
}

export function RecentReportsTable() {
    const [reports, setReports] = useState<Report[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const riskLevels = [
        { value: 1, label: "Low", color: "bg-green-500" },
        { value: 2, label: "Moderate", color: "bg-yellow-500" },
        { value: 3, label: "High", color: "bg-orange-500" },
        { value: 4, label: "Severe", color: "bg-red-500" },
        { value: 5, label: "Critical", color: "bg-red-700" }
    ]

    useEffect(() => {
        async function fetchReports() {
            try {
                const response = await fetch("/api/report?limit=2")
                if (!response.ok) {
                    throw new Error("Failed to fetch reports")
                }
                const data = await response.json()
                setReports(data.reports || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load reports")
            } finally {
                setIsLoading(false)
            }
        }

        fetchReports()
    }, [])

    const getRiskBadge = (riskLevel: number) => {
        const risk = riskLevels.find(r => r.value === riskLevel) || riskLevels[0]
        return (
            <Badge className={`text-white ${risk.color}`}>
                {risk.label}
            </Badge>
        )
    }

    const formatLocation = (coordinates: { lat: number; lng: number }) => {
        return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    if (isLoading) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Loading latest community reports...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription className="text-red-500">
                        {error}
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (reports.length === 0) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>No reports available yet</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-500 py-8">
                        Be the first to report traffic conditions in your area!
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl p-2">
            {/* <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                    Latest community reports from the past 24 hours
                </CardDescription>
            </CardHeader> */}
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id}>
                                <TableCell>
                                    {getRiskBadge(report.riskLevel)}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {formatLocation(report.coordinates)}
                                </TableCell>
                                <TableCell> 
                                    <div className="max-w-48 truncate">
                                        {report.riskDescription || "No description"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-500">
                                    {formatTime(report.createdAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
