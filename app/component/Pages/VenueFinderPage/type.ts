export interface Venue {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  capacity: number;
  price: number;
  image: string;
  amenities: string[];
  status: 'available' | 'booked' | 'unavailable';
  latitude: number;
  longitude: number;
}

export interface Filters {
  location: string;
  distance: number;
  date: string;
  capacity: number | undefined;
  categories: string[];
  ratings: string[];
  amenities: string[];
}

export type VenueStatus = 'available' | 'booked' | 'unavailable';