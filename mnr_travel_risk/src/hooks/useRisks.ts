import { useState, useEffect } from 'react';
import { LatLng, RiskMarker } from '@/types/coord';

// Types for API responses
interface Risk {
  id: string;
  coordinates: { lat: number; lng: number };
  riskLevel: number;
  riskDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export const useRisks = () => {
  const [risks, setRisks] = useState<RiskMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/risk`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch risks: ${response.statusText}`);
      }

      const data: Risk[] = await response.json();

      const transformedRisks: RiskMarker[] = data.map(risk => ({
        position: {
          lat: risk.coordinates.lat,
          lng: risk.coordinates.lng,
          weight: risk.riskLevel
        },
        risk: risk.riskLevel
      }));

      setRisks(transformedRisks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch risks');
      console.error('Error fetching risks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  return {
    risks,
    loading,
    error,
  };
};

// Keep the existing random position generator for testing/fallback
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