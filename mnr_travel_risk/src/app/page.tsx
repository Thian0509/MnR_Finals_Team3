"use client"

import React, { useEffect, useRef, useState, useCallback } from "react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { toast, Toaster } from "sonner";

// Define a type for our trip object for better type safety
type Trip = {
  id: string;
  from: string;
  to: string;
  departureTime: string;
};

const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for trips list and displayed alerts
  const [trips, setTrips] = useState<Trip[]>([]);
  const displayedAlertIDs = useRef(new Set<string>());

  // Fetch user ID on mount
  useEffect(() => {
    fetch("/api/auth/get-session")
      .then(res => res.json())
      .then(data => setUserId(data.user?.id || null));
  }, []);

  // Function to fetch trips
  const fetchTrips = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/trip?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch trips");
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load your trips.");
    }
  }, [userId]);

  // Fetch trips when userId is available
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Function to delete an alert
  const deleteAlert = async (alertId: string) => {
    try {
      await fetch('/api/alert', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      // Remove the alert ID from the displayed set after successful deletion
      displayedAlertIDs.current.delete(alertId);
    } catch (err) {
      console.error("Failed to delete alert:", err);
      toast.error("Failed to dismiss alert. Please try again.");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const departureTime = formData.get("departureTime") as string;

    if (!fromLocation || !toLocation || !departureTime || !userId) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromLocation,
          to: toLocation,
          departureTime,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to schedule trip");
      
      toast.success("Trip scheduled successfully!");
      setIsDialogOpen(false);
      fetchTrips();
    } catch (err) {
      setError("Failed to schedule trip. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Poll for UNREAD alerts
  useEffect(() => {
    if (!userId) return;

    const pollForAlerts = async () => {
      try {
        const res = await fetch(`/api/alert?userId=${userId}`);

        if (!res.ok) {
          // Log the error and exit the function to prevent a crash
          console.error("Failed to fetch alerts, server responded with an error.");
          return; 
        }

        const alerts: { id: string; message: string }[] = await res.json();
        
        alerts.forEach((alert) => {
          // Only show the toast if it's not already displayed
          if (!displayedAlertIDs.current.has(alert.id)) {
            toast(alert.message, {
              action: {
                label: "Remove",
                onClick: () => deleteAlert(alert.id),
              },
              onDismiss: () => deleteAlert(alert.id),
            });
            displayedAlertIDs.current.add(alert.id);
          }
        });
      } catch (err) {
        console.error("Failed to poll for alerts:", err);
      }
    };

    const interval = setInterval(pollForAlerts, 10000); // Poll every 10 seconds
    pollForAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Map and Button Section */}
      <main className="flex-1 flex flex-col items-center justify-end p-5 box-border relative">
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Plan Your Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
              const target = e.target as Element;
              if (target.closest('.pac-container')) e.preventDefault();
            }}>
              <DialogHeader>
                <DialogTitle>Plan Your Trip</DialogTitle>
                <DialogDescription>
                  Set your destination and departure time.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="from">From</Label>
                  <PlaceAutocomplete value={fromLocation} setValue={setFromLocation} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="to">To</Label>
                  <PlaceAutocomplete value={toLocation} setValue={setToLocation} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="departureTime">Departure Date and Time</Label>
                  <Input id="departureTime" name="departureTime" type="datetime-local" required />
                </div>
                {error && <div className="text-sm text-red-500 text-center">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading || !userId}>
                  {isLoading ? "Scheduling..." : "Schedule Trip"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Sheet for Trips List */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                View My Trips
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-1/4">
              <SheetHeader>
                <SheetTitle>Your Trips</SheetTitle>
                <SheetDescription>
                  View your scheduled and upcoming trips here.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                {trips.length > 0 ? (
                  trips.map((trip) => (
                    <div key={trip.id} className="p-4 border rounded-lg shadow-sm">
                      <p className="font-semibold">From: <span className="font-normal">{trip.from}</span></p>
                      <p className="font-semibold">To: <span className="font-normal">{trip.to}</span></p>
                      <p className="text-sm text-gray-600 mt-2">
                        Departs: {new Date(trip.departureTime).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">You have no upcoming trips.</p>
                )}
              </div>
              <SheetFooter className="mt-auto">
                <SheetClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="w-full h-full absolute top-0 left-0 z-0">
          <MapComponent />
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
};

export default LandingPage;