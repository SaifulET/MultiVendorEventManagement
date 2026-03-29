'use client';

import { X } from 'lucide-react';
import dynamic from 'next/dynamic';

const LeafletPreview = dynamic(() => import('./LeafletPreview'), {
  ssr: false,
});

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapPreviewProps {
  selectedLocation: Location;
  setSelectedLocation: (location: null) => void;
}

export default function DynamicMapPreview({
  selectedLocation,
  setSelectedLocation,
}: MapPreviewProps) {
  return (
    <div className="relative h-full group">
      <div className="absolute inset-0 z-10 overflow-hidden rounded-lg pointer-events-none">
        <LeafletPreview lat={selectedLocation.lat} lng={selectedLocation.lng} />
      </div>

      <div className="absolute top-3 left-3 rounded bg-emerald-600 px-2 py-1 text-xs text-white pointer-events-none">
        Location Set
      </div>

      <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm pointer-events-none">
        <p className="truncate text-xs font-medium text-gray-900">
          {selectedLocation.address}
        </p>
        <p className="text-xs text-gray-600">
          Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
          {selectedLocation.lng.toFixed(6)}
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          setSelectedLocation(null);
        }}
        className="absolute top-3 right-3 z-20 rounded-full bg-white p-1 shadow-sm transition-colors hover:bg-gray-100"
      >
        <X className="h-4 w-4 text-gray-700" />
      </button>
    </div>
  );
}
