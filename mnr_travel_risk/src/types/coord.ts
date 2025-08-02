export interface Coord {
  lat: number;
  lng: number;
}

export interface LatLng {
  lat: number;
  lng: number;
  weight: number;
}

export interface RiskMarker {
  position: LatLng;
  risk: number;
}