import { useEffect, useState } from "react";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type Marker = { lat: number; lng: number };

function offsetPoint(lat: number, lng: number, heading: number, distanceMeters: number): LatLngLiteral {
  const earthRadius = 6378137; // in meters
  const d = distanceMeters / earthRadius;
  const headingRad = (heading * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const newLat = Math.asin(Math.sin(latRad) * Math.cos(d) + Math.cos(latRad) * Math.sin(d) * Math.cos(headingRad));
  const newLng =
    lngRad +
    Math.atan2(
      Math.sin(headingRad) * Math.sin(d) * Math.cos(latRad),
      Math.cos(d) - Math.sin(latRad) * Math.sin(newLat)
    );

  return { lat: (newLat * 180) / Math.PI, lng: (newLng * 180) / Math.PI };
}

export function useBufferedRouteMarkers(
  directions: DirectionsResult | null,
  markers: Marker[],
  bufferMeters: number = 500
) {
  const [containedMarkers, setContainedMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    if (!directions || !google.maps.geometry) return;

    const path = directions.routes[0].overview_path;

    // Create left and right offset points
    const leftOffsets: LatLngLiteral[] = [];
    const rightOffsets: LatLngLiteral[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];
      const heading = google.maps.geometry.spherical.computeHeading(start, end);

      const left = offsetPoint(start.lat(), start.lng(), heading - 90, bufferMeters);
      const right = offsetPoint(start.lat(), start.lng(), heading + 90, bufferMeters);

      leftOffsets.push(left);
      rightOffsets.unshift(right); // reverse order for proper polygon
    }

    const corridorPolygon = new google.maps.Polygon({
      paths: [...leftOffsets, ...rightOffsets],
    });

    const insideMarkers = markers.filter((m) =>
      google.maps.geometry.poly.containsLocation(new google.maps.LatLng(m.lat, m.lng), corridorPolygon)
    );

    setContainedMarkers(insideMarkers);
  }, [directions, markers, bufferMeters]);

  return containedMarkers;
}
