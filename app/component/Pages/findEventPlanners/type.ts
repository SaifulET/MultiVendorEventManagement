export interface serviceProvider {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  categories:string;
  price: number;
  image: string;
  
  status: 'available' | 'booked' | 'unavailable';
 
}

export interface Filters {
  location: string;
  distance: number;
  date: string;
  categories: string[];
  ratings: string[];
  
}

export type VenueStatus = 'available' | 'booked' | 'unavailable';