"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Coord } from "@/types/coord"

interface WeatherReportFormProps {
    className?: string
    currentLocation?: Coord
}

export function WeatherReportForm({ className, currentLocation }: WeatherReportFormProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [riskLevel, setRiskLevel] = useState<number>(1)

    const riskLevels = [
        { value: 1, label: "Low", color: "bg-green-500", description: "Safe weather" },
        { value: 2, label: "Moderate", color: "bg-yellow-500", description: "Minor disturbances, nothing to upset a trip" },
        { value: 3, label: "High", color: "bg-orange-500", description: "Drive with caution" },
        { value: 4, label: "Severe", color: "bg-red-500", description: "Drive if necessary" },
        { value: 5, label: "Critical", color: "bg-red-700", description: "Holy moly, it's not worth it" }
    ]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const description = formData.get("description") as string

        // Use current location or allow manual coordinates
        const lat = currentLocation?.lat;
        const lng = currentLocation?.lng;

        if (!lat || !lng) {
            setError("Location is required. Please allow location access or enter coordinates manually.")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch("/api/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    coordinates: { lat, lng },
                    riskLevel,
                    riskDescription: description,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to submit report")
            }

            setSuccess(true)
            // Reset form after 2 seconds
            setTimeout(() => {
                setSuccess(false)
                setIsOpen(false)
                setRiskLevel(1)
                if (e && e.currentTarget) {
                    e.currentTarget.reset()
                }
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const selectedRisk = riskLevels.find(level => level.value === riskLevel)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Report Hazardous Weather
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report Weather Conditions</DialogTitle>
                    <DialogDescription>
                        Help other travelers by reporting current weather conditions in your area.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-center text-green-600 font-medium">
                            Report submitted successfully!
                        </p>
                        <p className="text-center text-gray-500 text-sm mt-1">
                            Thank you for helping the community.
                        </p>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Weather Report</CardTitle>
                            <CardDescription>
                                Submit a report about current Weather conditions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Risk Level Selection */}
                                <div className="space-y-3">
                                    <Label>Weather Risk Level</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {riskLevels.map((level) => (
                                            <div
                                                key={level.value}
                                                className={cn(
                                                    " flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                                                    riskLevel === level.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-gray-200 hover:bg-gray-50"
                                                )}
                                                onClick={() => setRiskLevel(level.value)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="riskLevel"
                                                    value={level.value}
                                                    checked={riskLevel === level.value}
                                                    onChange={() => setRiskLevel(level.value)}
                                                    className="sr-only"
                                                />
                                                <Badge className={cn("text-white", level.color)}>
                                                    {level.label}
                                                </Badge>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{level.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe the weather situation"
                                    />
                                </div>

                                {/* Current Selection Summary */}
                                {selectedRisk && (
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-sm font-medium text-gray-700">
                                            Selected Risk Level:
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge className={cn("text-white", selectedRisk.color)}>
                                                {selectedRisk.label}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {selectedRisk.description}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Submitting..." : "Submit Report"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    )
}
