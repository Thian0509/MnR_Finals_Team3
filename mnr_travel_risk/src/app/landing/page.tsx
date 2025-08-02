// src/app/landing/page.tsx

"use client"; // This component needs to be a client component

import React, { useEffect, useState } from 'react';
import MapComponent from '@/components/MapComponent';
import Head from 'next/head';
import { Button } from "@/components/ui/button"

const LandingPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This code runs only on the client side after component mounts
    if (typeof window !== 'undefined') {
      const storedLat = localStorage.getItem('userLat');
      const storedLng = localStorage.getItem('userLng');

      if (storedLat && storedLng) {
        setUserLocation({
          lat: parseFloat(storedLat),
          lng: parseFloat(storedLng),
        });
      }
    }
    setLoading(false);
  }, []); // The empty array ensures this effect runs only once

  const defaultCenter = {
    lat: -34.397,
    lng: 150.644,
  };

  const centerToUse = userLocation || defaultCenter;

  return (
    <>
      <Head>
        <title>Safety Buddy</title>
      </Head>

      <div
        style={{
          fontFamily: "Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
          boxSizing: "border-box",
          backgroundColor: "#f0f2f5",
          overflow: "hidden",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            color: "#333",
            margin: "0 0 20px 0",
          }}
        >
          Safety Buddy
        </h1>

        <div
          style={{
            width: "100%",
            flex: "1",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div>Loading Map...</div>
          ) : (
            <MapComponent center={centerToUse} />
          )}
        </div>

        <div style={{
          marginTop: '20px',
        }}>
          <Button>Plan Trip</Button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;