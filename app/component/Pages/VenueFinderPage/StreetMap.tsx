"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

// Fix Leaflet default marker icon
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type Coordinates = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  onSelect: (coords: Coordinates) => void;
  initialPosition?: Coordinates;
};

function LocationMarker({ onSelect, initialPosition }: MapPickerProps) {
  const [position, setPosition] = useState<Coordinates | null>(initialPosition || null);

  useMapEvents({
    click(event) {
      const coords: Coordinates = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      };

      setPosition(coords);
      onSelect(coords);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MapPicker({ onSelect, initialPosition }: MapPickerProps) {
  // Default to New York area
  const defaultCenter = { lat: 40.7489, lng: -73.9680 };
  const center = initialPosition || defaultCenter;
  
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker onSelect={onSelect} initialPosition={initialPosition} />
    </MapContainer>
  );
}