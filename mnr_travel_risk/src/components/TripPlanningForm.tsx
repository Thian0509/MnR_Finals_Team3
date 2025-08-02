"use client"

import React, { useState } from "react";
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

interface TripPlanningFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const TripPlanningForm: React.FC<TripPlanningFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  trigger 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState({ lat: 0, lng: 0 });
  const [toCoordinates, setToCoordinates] = useState({ lat: 0, lng: 0 });
  
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
      // Here you would typically make an API call to plan the trip
      console.log("Planning trip:", {
        from: fromCoordinates,
        to: toCoordinates,
        date: travelDate,
        time: travelTime
      });

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="z-10 cursor-pointer" variant="outline">
            Plan Your Trip
          </Button>
        )}
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
                <PlaceAutocomplete value={fromLocation} setValue={setFromLocation} coordinates={fromCoordinates} setCoordinates={setFromCoordinates} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="to">To</Label>
                <PlaceAutocomplete value={toLocation} setValue={setToLocation} coordinates={toCoordinates} setCoordinates={setToCoordinates} />
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
  );
};

export default TripPlanningForm; 