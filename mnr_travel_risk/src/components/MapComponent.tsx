'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import mapStyles from '@/lib/mapStyles.json';
import { getRiskFromWeather, getWeatherAtLocation } from '@/actions/actions';
import useLocation from '@/hooks/useLocation';
import { LatLng, RiskMarker } from '@/types/coord';
import { useRisks } from '@/hooks/useRisks';
import { useReports } from '@/hooks/useReports';
import { riskIcons } from '@/lib/icons';
import { capitalize, removeUnderscores } from '@/lib/underscore';
import { RiskType } from '@/generated/prisma';
import { LucideIcon, Snowflake } from 'lucide-react';
import DynamicLucideIcon from './DynamicLucide';



const containerStyle = {
  width: '100%',
  height: '100%',
};

// Function to generate SVG for risk icons
const generateRiskIconSVG = (riskType: RiskType): string => {
  const iconPaths: Record<RiskType, string> = {
    SNOW: "M2 12h2l1-8 4 16 2-10 2 10 4-16 1 8h2", // Snowflake icon
    HAIL: "M16 4v16M7 4v16M4 8h4M4 16h4M12 8h4M12 16h4", // CloudHail icon
    RAIN: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", // CloudRain icon
    FOG: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 18h8M8 22h8", // CloudFog icon
    ICE: "M2 12h2l1-8 4 16 2-10 2 10 4-16 1 8h2", // CloudSnow icon (using snowflake)
    WIND: "M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2", // Wind icon
    SANDY: "M12 2v20M2 12h20", // Hourglass icon
    BAD_GRAVEL: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z", // Disc3 icon
    MUD: "M8 12h8M12 8v8", // EqualApproximately icon
    ROCK: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4", // Mountain icon
    DEBRIS: "M3 6h18v2H3V6zM3 10h18v2H3v-2zM3 14h18v2H3v-2z", // Trash icon
    POTHOLE: "M9 21h6M12 3v18M3 12h18", // TrafficCone icon
    ROADWORK: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", // Construction icon
    POLICE: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", // Shield icon
    CLOSED_ROAD: "M18 6 6 18M6 6l12 12", // XCircle icon
  };

  const path = iconPaths[riskType] || iconPaths.SNOW;
  
  return `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
      <path d="${path}" stroke="white" stroke-width="1.5" fill="none" transform="translate(8, 8) scale(0.8)"/>
    </svg>
  `;
};

const MapComponent: React.FC<{
  isLoaded: boolean;
  map: google.maps.Map | null;
  setMap: (map: google.maps.Map | null) => void;
  directionsRendered?: boolean;
  handleRefresh?: () => void;
  heatmapLayer?: google.maps.visualization.HeatmapLayer | null;
}> = ({ isLoaded, map, setMap, directionsRendered, handleRefresh, heatmapLayer }) => {
  const [isClient, setIsClient] = useState(false);
  const [center, setCenter] = useState<LatLng>({ lat: -25.853952, lng: 28.19358, weight: 0 });
  const [markers, setMarkers] = useState<RiskMarker[]>([]);
  const { location, isLoading } = useLocation();
  const { risks, loading } = useRisks();
  const { allReports, loadReports } = useReports();

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
      const positions = risks.map(r => r.position);
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
    }, [risks]);



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
    loadReports();
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(mapInstance);
    trafficLayerRef.current = trafficLayer;
  }, [loadMarkers, loadReports, center, setMap]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map || !window.google?.maps?.visualization || markers.length === 0) return;

    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setMap(null);
    }

    if (heatmapLayer) {
      heatmapLayer.setMap(map);
      heatmapLayerRef.current = heatmapLayer;
    }

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

  if (!isClient || !isLoaded || loading) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
        Loading Map...
      </div>
    );
  }

  return isLoaded ? (
    <div className="relative w-full h-full select-none">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ styles: mapStyles }} // mapId: 'DEMO_MAP_ID', 
      >
        {location && (
          <Marker 
            position={{ lat: location.coords.latitude, lng: location.coords.longitude }} 
            title="Your Location"
          />
        )}
        {allReports.map((report) => {
          return (
            <Marker
              key={report.id}
              position={{ lat: (report.coordinates as { lat: number }).lat, lng: (report.coordinates as { lng: number }).lng }}
              title={`${capitalize(removeUnderscores(report.riskType))} - ${report.riskDescription || 'No description'}`}
            />
          );
        })}
      </GoogleMap>
    </div>
  ) : (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);
