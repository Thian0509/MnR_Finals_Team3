'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import mapStyles from '@/lib/mapStyles.json';

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

  const { isLoaded } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    if (typeof window !== 'undefined' && window.google) {
      const bounds = new window.google.maps.LatLngBounds(center);
      map.fitBounds(bounds);
      setMap(map);
      // turn off all the controls
      map.setOptions({
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        styles: mapStyles,
      });
    }
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
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
    >
    </GoogleMap>
  ) : (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 text-gray-600">
      Loading Map...
    </div>
  );
};

export default React.memo(MapComponent);