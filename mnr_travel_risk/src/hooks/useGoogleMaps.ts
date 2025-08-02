import { useLoadScript } from "@react-google-maps/api";
import { useState } from "react";

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: ['places', 'visualization', 'geometry', 'marker'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  return { isLoaded, loadError, map, setMap };
};