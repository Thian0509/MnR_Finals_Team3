import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface PlaceAutocompleteProps {
  value: string;
  setValue: (value: string) => void;
  coordinates: { lat: number, lng: number };
  setCoordinates: (coordinates: { lat: number, lng: number }) => void;
}

export default function PlaceAutocomplete({ value, setValue, coordinates }: PlaceAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Create the Autocomplete instance
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "za" },
    });

    // Set the fields we want to retrieve
    autocompleteRef.current.setFields(["address_components", "formatted_address", "geometry"]);

    // Add the place_changed listener
    autocompleteRef.current.addListener("place_changed", () => {
      if (autocompleteRef.current) {
        const place = autocompleteRef.current.getPlace();
        setValue(place.formatted_address || "");
        console.log(place)
        coordinates.lat = place.geometry?.location?.lat() || 0;
        coordinates.lng = place.geometry?.location?.lng() || 0;
      }
    });

    // Cleanup function
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, setValue]);

  // Handle input events to prevent dialog closing
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputFocus = (e: React.FocusEvent) => {
    e.stopPropagation();
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    e.stopPropagation();
  };

  if (loadError) return <p>Error loading maps</p>;
  if (!isLoaded) return <p>Loading...</p>;

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Enter a place"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClick={handleInputClick}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
      className="border p-2 w-full"
    />
  );
}
