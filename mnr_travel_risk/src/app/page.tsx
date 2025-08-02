"use client"

import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
import TripPlanningForm from "@/components/TripPlanningForm";

const LandingPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-end h-screen p-5 box-border bg-gray-50 overflow-hidden font-sans">
      <TripPlanningForm 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <div className="w-screen h-screen absolute top-0 left-0 z-0">
        <MapComponent />
      </div>
    </div>
  );
};

export default LandingPage;