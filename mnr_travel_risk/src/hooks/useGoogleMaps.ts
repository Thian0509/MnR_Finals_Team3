import { useLoadScript } from "@react-google-maps/api";

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  return { isLoaded, loadError };
};