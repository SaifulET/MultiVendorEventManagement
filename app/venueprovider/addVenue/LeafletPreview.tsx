'use client';

interface Props {
  lat: number;
  lng: number;
}

const getBoundingBox = (lat: number, lng: number) => {
  const offset = 0.008;

  return {
    left: lng - offset,
    bottom: lat - offset,
    right: lng + offset,
    top: lat + offset,
  };
};

export default function LeafletPreview({ lat, lng }: Props) {
  const { left, bottom, right, top } = getBoundingBox(lat, lng);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <iframe
      title="Selected venue location preview"
      src={src}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
