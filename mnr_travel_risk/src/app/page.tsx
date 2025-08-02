"use client"

import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
import TripPlanningForm from "@/components/TripPlanningForm";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [directionsRendered, setDirectionsRendered] = useState(false);
  const { isLoaded, loadError, map, setMap } = useGoogleMaps();

  const handleDirectionsRendered = () => {
    setDirectionsRendered(true);
    setTimeout(() => setDirectionsRendered(false), 100);
  };

  if (loadError) {
    return (
      <div className="text-red-500 text-center justify-center items-center h-screen">
        <p>Error loading Google Maps. Please try again later.</p>
      </div>
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

      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent
          isLoaded={isLoaded}
          map={map}
          setMap={setMap}
          directionsRendered={directionsRendered}
        />
      </div>
    </div>
  );
};

export default App;