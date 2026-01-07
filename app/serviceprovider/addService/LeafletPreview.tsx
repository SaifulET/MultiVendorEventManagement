'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletPreviewProps {
  lat: number;
  lng: number;
}

/** Proper typing instead of `any` */
interface LeafletIconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

const DefaultIcon = L.Icon.Default.prototype as LeafletIconPrototype;

if (DefaultIcon._getIconUrl) {
  delete DefaultIcon._getIconUrl;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LeafletPreview({ lat, lng }: LeafletPreviewProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
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
