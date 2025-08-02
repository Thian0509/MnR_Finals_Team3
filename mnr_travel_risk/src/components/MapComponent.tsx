'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import mapStyles from '@/lib/mapStyles.json';
import { getRiskFromWeather, getWeatherAtLocation } from '@/actions/actions';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import useLocation from '@/hooks/useLocation';
import prisma from '@/lib/prisma';
import { RiskReport } from '@/generated/prisma';
type Report = {
  coordinates: {
    lat: number, 
    lng: number 
  }
    
createdAt: Date,
id: string
riskDescription: string | null
riskLevel: number
updatedAt: Date
}
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
  const [closeReports, setCloseReports] = useState<(Report & { distance: number })[]>([]);
  const { location, isLoading } = useLocation();

  useEffect(() => {
    if (location && !isLoading) {
      setCenter({ lat: location.coords.latitude, lng: location.coords.longitude, weight: 0 });
    }
  }, [location, isLoading]);
  
  const heatmapLayerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const reportLayerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

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

  const loadReports = useCallback(
    async (ctr: LatLng) => {
      try {
        const resp = await fetch('/api/report')
        if (!resp.ok) {
          console.error('Failed to fetch reports:', resp.status);
          return;
        }
        const data = await resp.json();
        const reports: Report[] = data.reports || [];
        console.log('Loaded reports:', reports.length);
        
        const distReports = reports.map((report) => {
          const toRad = (value: number) => (value * Math.PI) / 180;
          const R = 6371; // Earth radius in km
          const dLat = toRad(report.coordinates.lat - ctr.lat);
          const dLng = toRad(report.coordinates.lng - ctr.lng);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(ctr.lat)) *
          Math.cos(toRad(report.coordinates.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          return {distance, ...report};
        });
        const closeReports = distReports.filter((value) => value.distance < 1000000);
        console.log('Close reports:', closeReports.length);
        setCloseReports(closeReports);
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    },
    []
  )

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
    loadReports(center);
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(mapInstance);
    trafficLayerRef.current = trafficLayer;
  }, [loadMarkers, loadReports, center]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleRefresh = () => {
    if (map) {
      const newCenter = map.getCenter()?.toJSON();
      if (newCenter) {
        setCenter({ ...newCenter, weight: 0 });
        loadMarkers({ ...newCenter, weight: 0 });
        loadReports({ ...newCenter, weight: 0 });
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
        {location && (
          <Marker 
            position={{ lat: location.coords.latitude, lng: location.coords.longitude }} 
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
            }}
            title="Your Location"
          />
        )}
        {closeReports.map((report) => (
          <Marker
            key={report.id}
            position={{ lat: report.coordinates.lat, lng: report.coordinates.lng }}
            title={`Risk Level: ${report.riskLevel} - ${report.riskDescription || 'No description'}`}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="${report.riskLevel > 7 ? '#ef4444' : report.riskLevel > 4 ? '#f59e0b' : '#10b981'}" stroke="white" stroke-width="3"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${report.riskLevel}</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
            }}
          />
        ))}
      </GoogleMap>
    </div>
  ) : (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);
