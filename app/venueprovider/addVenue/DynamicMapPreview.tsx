'use client';

import { MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components
const LeafletMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapPreviewProps {
  selectedLocation: Location;
  setSelectedLocation: (location: null) => void;
}

export default function DynamicMapPreview({ selectedLocation, setSelectedLocation }: MapPreviewProps) {
  return (
    <div className="h-full relative group">
      <div className="absolute inset-0 z-10 pointer-events-none">
        <LeafletMap
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
        </LeafletMap>
      </div>
      
      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs px-2 py-1 rounded pointer-events-none">
        Location Set ✓
      </div>
      
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm pointer-events-none">
        <p className="text-xs font-medium text-gray-900 truncate">{selectedLocation.address}</p>
        <p className="text-xs text-gray-600">
          Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
        </p>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLocation(null);
        }}
        className="absolute top-3 right-3 p-1 bg-white hover:bg-gray-100 rounded-full shadow-sm transition-colors z-20"
      >
        <X className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
}