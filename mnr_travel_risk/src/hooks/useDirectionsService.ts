let directionsRenderer: google.maps.DirectionsRenderer | null = null;

export const useDirectionsService = () => {

  // Lazily initialize once
  if (!directionsRenderer) {
    directionsRenderer = new window.google.maps.DirectionsRenderer();
  }

  const getDirections = async (origin: google.maps.LatLng, destination: google.maps.LatLng, travelMode: google.maps.TravelMode) => {
    const directionsService = new window.google.maps.DirectionsService();
    const response = await directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: travelMode,
    });
    return response;
  };

  const renderDirections = (response: google.maps.DirectionsResult, map: google.maps.Map | null) => {
    if (!map) return;

    directionsRenderer!.setMap(null);

    directionsRenderer!.setMap(map);
    directionsRenderer!.setOptions({
      polylineOptions: {
        strokeColor: "#0000FF",
        strokeWeight: 5,
      },
    });
    directionsRenderer!.setDirections(response);
  };

  return { getDirections, renderDirections };
};