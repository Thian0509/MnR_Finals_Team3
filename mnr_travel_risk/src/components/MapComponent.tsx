'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import mapStyles from '@/lib/mapStyles.json';
import { getRiskFromWeather, getWeatherAtLocation } from '@/actions/actions';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import useLocation from '@/hooks/useLocation';

const containerStyle = {
  width: '100%',
  height: '100%',
};

interface LatLng {
  lat: number;
  lng: number;
  weight: number;
}

interface RiskMarker {
  position: LatLng;
  risk: number;
}

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
      weight: Math.random() * 100
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
  const [center, setCenter] = useState<LatLng>({ lat: -25.853952, lng: 28.19358, weight: 0 });
  const [markers, setMarkers] = useState<RiskMarker[]>([]);
  const { location, isLoading } = useLocation();

  useEffect(() => {
    if (location && !isLoading) {
      setCenter({ lat: location.coords.latitude, lng: location.coords.longitude, weight: 0 });
    }
  }, [location, isLoading]);
  
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  
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
    loadMarkers(center);
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(mapInstance);
    trafficLayerRef.current = trafficLayer;
  }, [loadMarkers, center]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleRefresh = () => {
    if (map) {
      const newCenter = map.getCenter()?.toJSON();
      if (newCenter) {
        setCenter({ ...newCenter, weight: 0 });
        loadMarkers({ ...newCenter, weight: 0 });
      }
    }
  };

  useEffect(() => {
    if (!map || !window.google?.maps?.visualization || markers.length === 0) return;

    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
    }

    const heatmapData = markers.map(({ position, risk }) => ({
      location: new google.maps.LatLng(position.lat, position.lng),
      weight: risk
    }));

    const heatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
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

    heatmapLayerRef.current = heatmapLayer;

    return () => {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
    };
  }, [map, markers]);

  useEffect(() => {
    if (directionsRendered && map) {
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
      >
        {location && <Marker position={{ lat: location.coords.latitude, lng: location.coords.longitude }} />}
      </GoogleMap>
    </div>
  ) : (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);
