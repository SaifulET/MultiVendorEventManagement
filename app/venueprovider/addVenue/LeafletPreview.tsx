'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number;
  lng: number;
}

/**
 * Properly extend Leaflet's Icon type
 * instead of using `any`
 */
interface LeafletIconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

const DefaultIcon = L.Icon.Default.prototype as LeafletIconPrototype;

// Remove internal method safely
if (DefaultIcon._getIconUrl) {
  delete DefaultIcon._getIconUrl;
}

// Configure marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LeafletPreview({ lat, lng }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
