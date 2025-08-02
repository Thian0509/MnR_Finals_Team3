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
import { WeatherReportForm } from "@/components/report-form"
import { RecentReportsDrawer } from "@/components/recent-reports-table"
import { Coord } from "@/types/coord";
import { signOut } from "@/lib/auth-client";
import { ArrowRight, LogOut, MapPin, Sparkles, Sun, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { truncate } from "@/lib/trunc";
import { useRisks } from "@/hooks/useRisks";
import RoutineDialog from "@/components/RoutineDialog";
import { toast, Toaster } from "sonner";

type Coordinates = {
  address: string;
};

type Routine = {
  id: string;
  userId: string;
  name: string;
  startLocation: string;
  startCoordinates: Coordinates;
  endLocation: string;
  endCoordinates: Coordinates;
  startTime: string; // format: "HH:mm"
  repeatDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
};


function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directionsRendered, setDirectionsRendered] = useState(false);
  const { isLoaded, loadError, map, setMap } = useGoogleMaps();
  const { location, error, isLoading, requestLocation, permissionStatus } = useLocation();
  const router = useRouter();
  const [fromLocation, setFromLocation] = useState<string>("");
  const [aiDescription, setAiDescription] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const [fromCoordinates, setFromCoordinates] = useState<Coord>({ lat: 0, lng: 0 });
  const [toCoordinates, setToCoordinates] = useState<Coord>({ lat: 0, lng: 0 });
  const [showPlanning, setShowPlanning] = useState(false);
  const { risks } = useRisks();
  const [heatmapLayer, setHeatmapLayer] = useState<any | null>(null);
  const [averageRisk, setAverageRisk] = useState(0);

  // Schedule checker for routine notifications
  useEffect(() => {
    const checkRoutines = async () => {
      const resp = await fetch("/api/routine")
      const routines: Routine[] = (await resp.json()).routines
      console.log("🚀 ~ checkRoutines ~ routines:", routines)
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dayArr = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
      const currentDay = dayArr[now.getDay()];

      routines.forEach((routine: Routine) => {
        if (routine.startTime === currentTime && routine.repeatDays.includes(currentDay)) {
          // Show toast notification
          if ('Notification' in window && Notification.permission === 'granted') {
            toast(`Routine Reminder: ${routine.name || "Travel"}`, {
              description: `It's time to travel from ${routine.startLocation} to ${routine.endLocation}.`,
              action: {
                label: "Got it!",
                onClick: () => console.log("Routine reminder acknowledged"),
              },
            })
            new Notification('Travel Routine Reminder', {
              body: `Time to travel from ${routine.startLocation} to ${routine.endLocation}`,
              icon: '/favicon.ico'
            });
          } else {
            // Fallback to console or custom toast
            console.log(`Routine reminder: ${routine.startLocation} → ${routine.endLocation}`);
          }
        }
      });
    };
    checkRoutines()
    const interval = setInterval(checkRoutines, 50000);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!map) return;
    if (!google.maps.visualization.HeatmapLayer) return;

    console.log(risks);

    const heatmapData = risks.map(({ position, risk }) => ({
      location: new google.maps.LatLng(position.lat, position.lng),
      weight: risk
    }));

    const heatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 20,
      opacity: 0.6,
      gradient: [
        'rgba(0, 255, 0, 0)',
        'rgba(0, 255, 0, 1)',
        'rgba(128, 255, 0, 1)',
        'rgba(255, 255, 0, 1)',
        'rgba(255, 191, 0, 1)',
        'rgba(255, 127, 0, 1)',
        'rgba(255, 63, 0, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });

    setHeatmapLayer(heatmapLayer);
    setAverageRisk(risks.reduce((acc, r) => acc + r.risk, 0) / risks.length);
  }, [map, risks]);

  const handleDirectionsRendered = () => {
    setDirectionsRendered(true);
    setTimeout(() => setDirectionsRendered(false), 100);
  };

  function handleLogOut() {
    signOut();
    router.push("/");
  }

  if (loadError) {
    return (
      <div className="text-red-500 text-center justify-center items-center h-screen">
        <p>Error loading Google Maps. Please try again later.</p>
      </div>
    );
  }

  if (!isLoaded || isLoading) {
    return <Loading />;
  }

  if (location === null && permissionStatus === 'prompt') {
    return (
      <Dialog open={true} onOpenChange={() => { }}>
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
      <Toaster />
      <Dialog open={error !== null} onOpenChange={() => { }}>
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

      <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 bg-black/10 backdrop-blur-sm p-2 rounded-md">
        <h1 className="text-xl font-bold text-white">SafetyBuddy</h1>
      </div>

      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent
          isLoaded={isLoaded}
          map={map}
          setMap={setMap}
          directionsRendered={directionsRendered}
          heatmapLayer={heatmapLayer}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 flex items-center justify-center">
        <div className="flex flex-col gap-4">
          {showPlanning && <Card className="relative">
            <Button variant="outline" className="absolute top-1 right-1 rounded-full h-5 w-5" size="sm" onClick={() => setShowPlanning(false)}>
              <X className="h-4 w-4" />
            </Button>
            <CardContent>
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{truncate(fromLocation, 20)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{truncate(toLocation, 20)}</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-500" /> {aiDescription}
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center justify-end flex-col px-2">
                    <Sun className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="flex items-center justify-end flex-col">
                    <h1 className="text-3xl font-bold text-red-500">{averageRisk ? averageRisk.toFixed(1) : 0}%</h1>
                    <p className="text-xs">Travel Risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>}
          <div className="flex gap-3">
            <TripPlanningForm
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              map={map}
              heatmapLayer={heatmapLayer}
              setHeatmapLayer={setHeatmapLayer}
              onDirectionsRendered={handleDirectionsRendered}
              fromLocation={fromLocation}
              toLocation={toLocation}
              fromCoordinates={fromCoordinates}
              toCoordinates={toCoordinates}
              setFromLocation={setFromLocation}
              setToLocation={setToLocation}
              setFromCoordinates={setFromCoordinates}
              setToCoordinates={setToCoordinates}
              setShowPlanning={setShowPlanning}
              averageRisk={averageRisk}
              setAverageRisk={setAverageRisk}
              setAiDescription={setAiDescription}
            />
            <RoutineDialog />
            <WeatherReportForm currentLocation={location ? { lat: location.coords.latitude, lng: location.coords.longitude } : undefined} />
            <RecentReportsDrawer />
            <Button onClick={handleLogOut} variant="outline">
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;