"use client"


import React, { useEffect, useRef, useState } from "react";
import MapComponent from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { toast, Toaster } from "sonner"; // Import Toaster from sonner

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  // Change the ref to store the createdAt timestamp instead of the ID
  const lastAlertCreatedAt = useRef<string | null>(null);

  // Fetch user ID from session API on mount
  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(res => res.json())
      .then(data => setUserId(data.user?.id || null));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const travelDate = formData.get("date") as string;
    const travelTime = formData.get("time") as string;

    if (!fromLocation || !toLocation || !travelDate || !travelTime) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      // This is for the toast for planning the trip
      toast("Trip planned successfully! An alert will be created at the departure time.");

      const response = await fetch("/api/schedule-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
          date: travelDate,
          time: travelTime,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule trip");
      }
      
      // Close dialog only after successful submission
      setIsDialogOpen(false);
    } catch (err) {
      setError("Failed to plan trip. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Poll for alerts and show toast when a new alert appears
  useEffect(() => {
    // We only poll if we have a userId
    if (!userId) return;

    const pollForAlerts = async () => {
      try {
        const lastCreatedAt = lastAlertCreatedAt.current;
        // Now polling the API for alerts, which are now created directly by the cron job
        const res = await fetch(`/api/alert?userId=${userId}${lastCreatedAt ? `&lastCreatedAt=${lastCreatedAt}` : ""}`);
        const alerts = await res.json();
        
        // Show a toast for each new alert
        if (alerts.length > 0) {
          alerts.forEach((alert: { id: string; message: string; createdAt: string; }) => {
            // Display the message from the alert record
            toast(alert.message);
          });

          // Update the lastAlertCreatedAt to the createdAt of the most recent alert
          // The API returns alerts sorted by createdAt ASC, so the last one is the latest.
          const latestAlertCreatedAt = alerts[alerts.length - 1].createdAt;
          lastAlertCreatedAt.current = latestAlertCreatedAt;
        }
      } catch (err) {
        console.error("Failed to poll for alerts:", err);
      }
    };

    // Set up the polling interval
    const interval = setInterval(pollForAlerts, 10000); // poll every 10 seconds

    // Call the function immediately on mount to check for any alerts
    // that might have been created before the component mounted.
    pollForAlerts();

    // Clean up the interval when the component unmounts or userId changes
    return () => clearInterval(interval);
  }, [userId]);

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
      {/* Add the Toaster component here */}
      <Toaster />

      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent />
      </div>
    </div>
  );
};

export default LandingPage;