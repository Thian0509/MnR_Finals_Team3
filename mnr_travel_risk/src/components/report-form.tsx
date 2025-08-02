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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Coord } from "@/types/coord"
import { AlertTriangle, CloudRain, CloudSnow, Cloud, Wind, Sun, Car, Construction, Shield, XCircle, Snowflake, CloudHail, CloudFog, Hourglass, Disc3, EqualApproximately, Mountain, TrafficCone, Trash } from "lucide-react"
import { RiskType } from "@/generated/prisma"
import { removeUnderscores, capitalize } from "@/lib/underscore"

interface WeatherReportFormProps {
    className?: string
    currentLocation?: Coord
}

// Map road risks to appropriate Lucide icons
const riskIcons: Record<RiskType, React.ComponentType<{ className?: string }>> = {
    SNOW: Snowflake,
    HAIL: CloudHail,
    RAIN: CloudRain,
    FOG: CloudFog,
    ICE: CloudSnow,
    WIND: Wind,
    SANDY: Hourglass,
    BAD_GRAVEL: Disc3,
    MUD: EqualApproximately,
    ROCK: Mountain,
    DEBRIS: Trash,
    POTHOLE: TrafficCone,
    ROADWORK: Construction,
    POLICE: Shield,
    CLOSED_ROAD: XCircle,
}

export function WeatherReportForm({ className, currentLocation }: WeatherReportFormProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedRisk, setSelectedRisk] = useState<RiskType | null>(null)

    console.debug(currentLocation)

    const handleRiskToggle = (risk: RiskType) => {
        setSelectedRisk(prev => 
            prev === risk ? null : risk
        )
    }

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

        if (!selectedRisk) {
            setError("Please select at least one road risk type.")
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
                    riskTypes: selectedRisk,
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
                setSelectedRisk(null)
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <AlertTriangle className="h-4 w-4" />
                    Report Road Hazards
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Report Road Conditions</DialogTitle>
                    <DialogDescription>
                        Help other travelers by reporting current road conditions in your area.
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Road Risk Selection */}
                        <div className="space-y-3">
                            <Label>Select Road Hazards</Label>
                            <div className="grid grid-cols-5 gap-4 items-center justify-center">
                                {Object.values(RiskType).map((risk) => {
                                    const IconComponent = riskIcons[risk] || AlertTriangle
                                    const isSelected = selectedRisk === risk
                                    
                                    return (
                                        <div
                                            key={risk}
                                            className={cn(
                                                "h-24 w-24 flex flex-col justify-center items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
                                                isSelected
                                                    ? "border-blue-500 bg-blue-500/5"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            )}
                                            onClick={() => handleRiskToggle(risk)}
                                        >
                                            <input
                                                type="checkbox"
                                                name="risks"
                                                value={risk}
                                                checked={isSelected}
                                                onChange={() => handleRiskToggle(risk)}
                                                className="sr-only"
                                            />
                                            <div className="flex flex-col items-center justify-center text-center gap-2 w-20">
                                                <IconComponent className="h-8 w-8 text-gray-600" />
                                                <p className="text-sm font-medium">{capitalize(removeUnderscores(risk))}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe the road conditions in detail"
                            />
                        </div>

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
                )}
            </DialogContent>
        </Dialog>
    )
}
