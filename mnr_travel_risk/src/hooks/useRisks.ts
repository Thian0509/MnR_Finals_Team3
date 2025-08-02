import { LatLng } from "@/types/coord";

export const generateRandomPositions = (
  count: number,
  center: LatLng,
  radiusKm: number
): LatLng[] => {
  const earthRadius = 6371; // km
  const positions: LatLng[] = [];
  const lat1 = (center.lat * Math.PI) / 180;
  const lon1 = (center.lng * Math.PI) / 180;

  for (let i = 0; i < count; i++) {
    const distance = Math.sqrt(Math.random()) * radiusKm;
    const bearing = Math.random() * 2 * Math.PI;
    const angularDistance = distance / earthRadius;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
        Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      );

    positions.push({
      lat: (lat2 * 180) / Math.PI,
      lng: (lon2 * 180) / Math.PI,
      weight: Math.random() * 100
    });
  }
  return positions;
};