'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Badge } from "@/components/ui/badge"
import { getRiskFromWeather, getWeatherAtLocation } from '@/actions/actions';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: -34.397,
  lng: 150.644
};

const MapComponent: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
    libraries: ['marker'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    if (typeof window !== 'undefined' && window.google) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      setMap(map);
    }
  }, []);
  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);
  const markerContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (map && markerContentRef.current) {
      // Create the marker with the actual DOM element
      const elem = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: center,
        content: markerContentRef.current
      });

      // Cleanup function to remove marker when component unmounts
      return () => {
        elem.map = null;
      };
    }
  }, [map, center]);
  const [risk, setRisk] = useState<number | null>(null)
  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const weather = await getWeatherAtLocation(center.lat, center.lng);
        const riskValue = await getRiskFromWeather(weather);
        setRisk(riskValue);
      } catch (error) {
        console.error('Failed to fetch risk data:', error);
        setRisk(0); // Fallback value
      }
    };

    fetchRisk();
  }, [center.lat, center.lng]);
  // Don't render anything on server side
  if (!isClient) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666'
      }}>
        Loading Map...
      </div>
    );
  }
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ mapId: 'DEMO_MAP_ID' }}
    >
      <div ref={markerContentRef}>
        <Badge variant={'destructive'}>{risk ? risk.toPrecision(4) : 0}</Badge>
      </div>
    </GoogleMap>
  ) : (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      color: '#666'
    }}>
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);