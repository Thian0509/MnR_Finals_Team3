import React from 'react';
import MapComponent from '@/components/MapComponent';
import { Button } from "@/components/ui/button"

const LandingPage: React.FC = () => {
  return (
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
        <MapComponent />
      </div>

      <div style={{
        marginTop: '20px',
      }}>
        <Button>Plan Trip</Button>
      </div>
    </div>
  );
};

export default LandingPage;