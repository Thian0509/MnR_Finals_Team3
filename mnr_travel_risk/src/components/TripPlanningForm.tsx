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
import { useDirectionsService } from "@/hooks/useDirectionsService";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { Coord } from "@/types/coord";
import buffer from "@turf/buffer";
import { lineString, point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { useRisks } from "@/hooks/useRisks";
import { useReports } from "@/hooks/useReports";


interface TripPlanningFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;

  // google maps stuff
  map: google.maps.Map | null;
  heatmapLayer: any | null;
  setHeatmapLayer: (layer: any | null) => void;
  onDirectionsRendered?: () => void;
  fromLocation: string;
  toLocation: string;
  fromCoordinates: Coord;
  toCoordinates: Coord;
  setFromLocation: (location: string) => void;
  setToLocation: (location: string) => void;
  setFromCoordinates: (coordinates: { lat: number, lng: number }) => void;
  setToCoordinates: (coordinates: { lat: number, lng: number }) => void;
  setShowPlanning: (show: boolean) => void;
  averageRisk: number;
  setAverageRisk: (risk: number) => void;
}

const TripPlanningForm: React.FC<TripPlanningFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  trigger,
  map,
  heatmapLayer,
  setHeatmapLayer,
  onDirectionsRendered,
  fromLocation,
  toLocation,
  fromCoordinates,
  toCoordinates,
  setFromLocation,
  setToLocation,
  setFromCoordinates,
  setToCoordinates,
  setShowPlanning,
  averageRisk,
  setAverageRisk,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveNow, setLeaveNow] = useState(true);
  const { getDirections, renderDirections } = useDirectionsService();
  const { risks, loading } = useRisks();
  const { allReports, loading: loadingReports } = useReports();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    let travelDate = formData.get("date") as string;
    let travelTime = formData.get("time") as string;

    // If "Leave now" is checked, use current date and time
    if (leaveNow) {
      const now = new Date();
      travelDate = now.toISOString().split('T')[0];
      travelTime = now.toTimeString().slice(0, 5);
    }

    // Validate form data
    if (!fromLocation || !toLocation || (!leaveNow && (!travelDate || !travelTime))) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      // calculate the directions
      const directions = await getDirections(new google.maps.LatLng(fromCoordinates.lat, fromCoordinates.lng), new google.maps.LatLng(toCoordinates.lat, toCoordinates.lng), google.maps.TravelMode.DRIVING);
      renderDirections(directions, map);

      const path = directions.routes[0].overview_path;

      // Convert to Turf LineString (LngLat order!)
      const turfLine = lineString(path.map(p => [p.lng(), p.lat()]));

      const buffered = buffer(turfLine, 25, { units: "kilometers" });

      console.log(buffered);
      console.log(risks);
      console.log(allReports);
      
      const allRiskMarkers = [...risks, ...allReports];

      console.log(allRiskMarkers);

      const riskMarkers = (loading || allReports.length === 0) ? [] : allRiskMarkers.filter(r => {
        if ('position' in r) {
          const turfPoint = point([r.position.lng, r.position.lat]);
          return booleanPointInPolygon(turfPoint, buffered as any);
        } 
        else if ('coordinates' in r) {
          const turfPoint = point([(r.coordinates as { lng: number }).lng, (r.coordinates as { lat: number }).lat]);
          return booleanPointInPolygon(turfPoint, buffered as any);
        }
        return false;
      });

      console.log(riskMarkers);

      const totalRisk = riskMarkers.reduce((acc, r) => {
        if ('risk' in r) {
          return acc + (r.risk * 100);
        }
        else {
          return acc + 75;
        }
      }, 0);

      const averageRiskValue = riskMarkers.length > 0 ? totalRisk / riskMarkers.length : 0;
      setAverageRisk(Number(averageRiskValue.toFixed(2)));

      if (heatmapLayer) {
        heatmapLayer.setMap(null);
      }

      const riskPolygon = new google.maps.visualization.HeatmapLayer({
        data: riskMarkers.map(r => ({
          location: new google.maps.LatLng(
            'position' in r ? r.position.lat : (r.coordinates as { lat: number }).lat, 
            'position' in r ? r.position.lng : (r.coordinates as { lng: number }).lng
          ),
          weight: 'risk' in r ? r.risk : 75
        })),
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
      setHeatmapLayer(riskPolygon as any);

      onDirectionsRendered?.();
      
      onOpenChange(false);
      setShowPlanning(true);
    } catch (err) {
      console.log(err);
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
            <MapPin className="h-4 w-4" />
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
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="leaveNow"
                checked={leaveNow}
                onCheckedChange={(checked) => setLeaveNow(checked === "indeterminate" ? false : checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="leaveNow" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Leave now
              </Label>
            </div>
            
            {!leaveNow && <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="date">Travel Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  required={!leaveNow}
                  disabled={leaveNow}
                  className={leaveNow ? "opacity-50 cursor-not-allowed" : ""}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="time">Travel Time</Label>
                <Input 
                  id="time" 
                  name="time" 
                  type="time"
                  step="60" 
                  required={!leaveNow}
                  disabled={leaveNow}
                  className={leaveNow ? "opacity-50 cursor-not-allowed" : ""}
                />
              </div>
            </div>}

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