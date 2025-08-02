'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import mapStyles from '@/lib/mapStyles.json';
import useLocation from '@/hooks/useLocation';
import { LatLng, RiskMarker } from '@/types/coord';
import { useRisks } from '@/hooks/useRisks';
import { useReports } from '@/hooks/useReports';
import { capitalize, removeUnderscores } from '@/lib/underscore';

const containerStyle = {
  width: '100%',
  height: '100%',
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
          results.push({ position: pos, risk: pos.weight });
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
