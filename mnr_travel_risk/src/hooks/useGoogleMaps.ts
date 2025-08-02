import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places" | "marker")[] = ["places", "marker"];

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries,
  });

  return { isLoaded, loadError };
};