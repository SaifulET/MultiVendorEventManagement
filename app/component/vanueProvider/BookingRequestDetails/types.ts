export type PageType = 'booking-details' | 'notifications' | 'chat' | 'profile';

export interface BookingDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    venue: string;
    address: string;
  };
  client: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  guests: number;
  pricing: {
    subtotal: number;
    tax: number;
    taxRate: number;
    total: number;
  };
  specialRequests: string;
  payment: {
    depositRequired: boolean;
    depositAmount: number;
    depositPercentage: number;
    status: 'pending' | 'paid' | 'overdue';
  };
  status: 'pending' | 'approved' | 'rejected';
  timeline: {
    submitted: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  isOwn: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  company: string;
  phone: string;
  joined: string;
}