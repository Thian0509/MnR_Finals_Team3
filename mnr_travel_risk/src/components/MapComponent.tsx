'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import mapStyles from '@/lib/mapStyles.json';
import { createRoot } from 'react-dom/client';
import { Badge } from '@/components/ui/badge';
import { getRiskFromWeather, getWeatherAtLocation } from '@/actions/actions';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

interface LatLng {
  lat: number;
  lng: number;
}

interface RiskMarker {
  position: LatLng;
  risk: number;
}

// Generate `count` random positions within `radiusKm` of `center`
const generateRandomPositions = (
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
    });
  }
  return positions;
};

const MapComponent: React.FC<{
  isLoaded: boolean;
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  directionsRendered?: boolean;
}> = ({ isLoaded, map, setMap, directionsRendered }) => {
  const [isClient, setIsClient] = useState(false);
  const [center, setCenter] = useState<LatLng>({ lat: -25.853952, lng: 28.19358 });
  const [markers, setMarkers] = useState<RiskMarker[]>([]);

  // Markers fetch function
  const loadMarkers = useCallback(
    async (ctr: LatLng) => {
      const positions = [ctr, ...generateRandomPositions(15, ctr, 40)];
      const results: RiskMarker[] = [];

      for (const pos of positions) {
        try {
          const weather = await getWeatherAtLocation(pos.lat, pos.lng);
          const riskValue = await getRiskFromWeather(weather);
          results.push({ position: pos, risk: riskValue });
        } catch (error) {
          console.error('Failed to fetch risk for', pos, error);
          results.push({ position: pos, risk: 0 });
        }
      }

      setMarkers(results);
    },
    []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapInstance.setOptions({
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
    });
    setMap(mapInstance);
    // Initial marker load
    loadMarkers(center);
  }, [loadMarkers, center]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    if (map) {
      const newCenter = map.getCenter()?.toJSON();
      if (newCenter) {
        setCenter(newCenter);
        loadMarkers(newCenter);
      }
    }
  };

  // Render markers when they change
  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;

    const markerElements: google.maps.marker.AdvancedMarkerElement[] = [];

    markers.forEach(({ position, risk }) => {
      const container = document.createElement('div');
      const root = createRoot(container);
      if (risk <= 88.5){
        root.render(<Badge className="bg-emerald-900  " variant="destructive">{risk.toPrecision(4)}</Badge>);
      } else if (risk <= 90) {
        root.render(<Badge className="bg-amber-400" variant="destructive">{risk.toPrecision(4)}</Badge>);
      } else {
        root.render(<Badge className="bg-orange-800" variant="destructive">{risk.toPrecision(4)}</Badge>);
      }

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: container,
      });
      markerElements.push(marker);
    });

    return () => markerElements.forEach(m => (m.map = null));
  }, [map, markers]);

  // Handle directions rendered
  useEffect(() => {
    if (directionsRendered && map) {
      // Force a map refresh or update when directions are rendered
      // This ensures the map properly displays the directions
      map.setZoom(map.getZoom() || 10);
    }
  }, [directionsRendered, map]);

  if (!isClient || !isLoaded) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
        Loading Map...
      </div>
    );
  }

  return isLoaded ? (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Button
        onClick={handleRefresh}
        variant="outline"
        className="absolute top-4 left-4 z-10"
      >
        <RefreshCcw className="h-4 w-4" />
        Refresh Risks
      </Button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ mapId: 'DEMO_MAP_ID', styles: mapStyles }}
      />
    </div>
  ) : (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);
