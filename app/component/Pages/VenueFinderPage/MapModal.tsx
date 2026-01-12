'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(
  () => import('./StreetMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="text-slate-500">Loading map...</div>
      </div>
    )
  }
);

interface Coordinates {
  lat: number;
  lng: number;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  initialPosition?: Coordinates;
}

const MapModal: React.FC<MapModalProps> = ({ 
  isOpen,
  onClose, 
  onLocationSelect,
  initialPosition
}) => {
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(initialPosition || null);

  const handleMapSelect = (coords: Coordinates) => {
    setSelectedCoords(coords);
  };

  const handleConfirm = () => {
    if (selectedCoords && onLocationSelect) {
      onLocationSelect(selectedCoords.lat, selectedCoords.lng);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95vw] max-w-6xl max-h-[90vh]">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Select Location on Map</h2>
              <p className="text-slate-300 text-sm mt-1">
                {initialPosition ? 'Click anywhere to change the marker' : 'Click on the map to place a marker'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Map Container */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex-1 rounded-lg overflow-hidden border-2 border-slate-200">
                <MapPicker onSelect={handleMapSelect} initialPosition={initialPosition} />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  📍 {initialPosition ? 'Click to change marker' : 'Click to place marker'}
                </div>
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  🔍 Scroll to zoom, drag to move
                </div>
              </div>
            </div>

            {/* Location Details Sidebar */}
            <div className="lg:w-80 border-l border-slate-200 p-6 flex flex-col bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {selectedCoords ? 'Selected Location' : 'No location selected'}
              </h3>
              
              <div className="space-y-4 flex-1">
                {selectedCoords ? (
                  <>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">
                          Location selected
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        Coordinates ready to use
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={selectedCoords.lat}
                          onChange={(e) => setSelectedCoords({ ...selectedCoords, lat: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg font-mono text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={selectedCoords.lng}
                          onChange={(e) => setSelectedCoords({ ...selectedCoords, lng: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg font-mono text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 mb-2">No location selected</h4>
                    <p className="text-slate-600">
                      Click on the map to select a location
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-300 space-y-3">
                <button
                  onClick={() => {
                    if (selectedCoords) {
                      navigator.clipboard.writeText(`${selectedCoords.lat}, ${selectedCoords.lng}`);
                    }
                  }}
                  disabled={!selectedCoords}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    selectedCoords
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Copy Coordinates
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedCoords}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    selectedCoords
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Use This Location
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapModal;