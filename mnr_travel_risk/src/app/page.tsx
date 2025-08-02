"use client"

import React, { useEffect, useState } from "react";
import MapComponent from "@/components/MapComponent";
import TripPlanningForm from "@/components/TripPlanningForm";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import useLocation from "@/hooks/useLocation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/Loading";
import PlaceAutocomplete from "@/components/PlaceAutocomplete"
import { WeatherReportForm } from "@/components/report-form"
import { RecentReportsTable } from "@/components/recent-reports-table"

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directionsRendered, setDirectionsRendered] = useState(false);
  const { isLoaded, loadError, map, setMap } = useGoogleMaps();
  const { location, error, isLoading, requestLocation, permissionStatus } = useLocation();

  const handleDirectionsRendered = () => {
    setDirectionsRendered(true);
    setTimeout(() => setDirectionsRendered(false), 100);
  };
    
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const travelDate = formData.get("date") as string;
    const travelTime = formData.get("time") as string;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Handle successful trip planning
    console.log("Trip planned successfully!");

  } catch (err) {
    setError("Failed to plan trip. Please try again.");
  } finally {
    setIsLoading(false);
  }
}

  if (loadError) {
    return (
      <div className="text-red-500 text-center justify-center items-center h-screen">
        <p>Error loading Google Maps. Please try again later.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <Loading />;
  }

  if (location === null && permissionStatus === 'prompt') {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Location Access Required</DialogTitle>
            <DialogDescription>
              We need your location to provide accurate travel risk information and directions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={requestLocation}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Getting Location..." : "Allow Location Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex flex-col items-center justify-end h-screen p-5 box-border bg-gray-50 overflow-hidden font-sans">
      <TripPlanningForm 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        map={map}
        setMap={setMap}
        onDirectionsRendered={handleDirectionsRendered}
      />

      <Dialog open={error !== null} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Location Access Error</DialogTitle>
            <DialogDescription>
              {error === "User denied geolocation" 
                ? "Location access was denied. Please enable location access in your browser settings."
                : "Error getting location. Please try again later."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={requestLocation}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Getting Location..." : "Try Again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent
          isLoaded={isLoaded}
          map={map}
          setMap={setMap}
          directionsRendered={directionsRendered}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="cursor-pointer bg-slate-300" variant="outline">
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

            <WeatherReportForm />
          </div>
          <RecentReportsTable />
        </div>
      </div>
    </div>
  );
};

export default App;