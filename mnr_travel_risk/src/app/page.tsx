"use client"

import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PlaceAutocomplete from "@/components/PlaceAutocomplete"

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const travelDate = formData.get("date") as string;
    const travelTime = formData.get("time") as string;

    // Validate form data
    if (!fromLocation || !toLocation || !travelDate || !travelTime) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      // Send trip data to the backend API to schedule the cron job
      const response = await fetch("/api/schedule-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
          date: travelDate,
          time: travelTime
        })
      });

      if (!response.ok) throw new Error("Failed to schedule trip");

      // Handle successful trip planning
      console.log("Trip planned successfully!");
    } catch (err) {
      setError("Failed to plan trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-end h-screen p-5 box-border bg-gray-50 overflow-hidden font-sans">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="z-10 cursor-pointer" variant="outline">
            Plan Your Trip
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
          // Prevent closing when clicking on Google Places Autocomplete dropdown
          const target = e.target as Element;
          if (target.closest('.pac-container')) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Plan Your Safe Trip</DialogTitle>
            <DialogDescription>
              Enter your travel details to get safety recommendations and risk assessment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="from">From</Label>
                  <PlaceAutocomplete value={fromLocation} setValue={setFromLocation} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="to">To</Label>
                  <PlaceAutocomplete value={toLocation} setValue={setToLocation} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="date">Travel Date</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="time">Travel Time</Label>
                  <Input 
                    id="time" 
                    name="time" 
                    type="time"
                    step="60" 
                    required 
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Planning Trip..." : "Plan Trip"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent />
      </div>
    </div>
  );
};

export default LandingPage;