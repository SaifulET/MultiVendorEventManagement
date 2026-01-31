'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR
const MapPicker = dynamic(
  () => import('./StreetMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapContainerProps {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition?: Coordinates;
  initialAddress?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  onClose, 
  onLocationSelect,
  initialPosition,
  initialAddress 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(initialPosition || null);

  const handleMapSelect = (coords: Coordinates) => {
    setSelectedCoords(coords);
    if (!searchQuery.trim()) {
      setSearchQuery(`Location at ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
    }
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      const address = searchQuery.trim() || `Location at ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`;
      onLocationSelect(selectedCoords.lat, selectedCoords.lng, address);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Location on Map</h2>
            <p className="text-gray-600 mt-1">
              {initialPosition ? 'Click anywhere to change the marker' : 'Click on the map to place a marker'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Map Container */}
          <div className="flex-1 p-4">
            <div className="h-full rounded-lg overflow-hidden border border-gray-200">
              <MapPicker onSelect={handleMapSelect} initialPosition={initialPosition} />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {initialPosition ? '✏️ Click anywhere to change marker' : '📍 Click to place marker'}
              </div>
              <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🔍 Scroll to zoom, drag to move
              </div>
            </div>
          </div>

          {/* Location Details Sidebar */}
          <div className="lg:w-96 border-l p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCoords ? 'Selected Location' : 'No location selected'}
            </h3>
            
            <div className="space-y-4 flex-1">
              {selectedCoords ? (
                <>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">
                        {initialPosition && initialPosition.lat === selectedCoords.lat && initialPosition.lng === selectedCoords.lng 
                          ? 'Current marker' 
                          : 'New location selected'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {searchQuery || `Lat: ${selectedCoords.lat.toFixed(6)}, Lng: ${selectedCoords.lng.toFixed(6)}`}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900 font-mono">{selectedCoords.lat.toFixed(6)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-gray-900 font-mono">{selectedCoords.lng.toFixed(6)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter address or location name"
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No location selected</h4>
                  <p className="text-gray-600">
                    Click on the map to select a location
                  </p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="pt-6 border-t">
              <button
                onClick={handleConfirm}
                disabled={!selectedCoords}
                className={`w-full py-3 rounded-lg font-semibold transition-colors mb-2 ${
                  selectedCoords
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {initialPosition ? 'Update Location' : 'Confirm Location'}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;