import React from 'react';
import { MapPin, Star, Building2, Award, Briefcase, Clock, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import img from "@/public/premiumvenue.png"
interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  rating: number;
  price: number;
  image: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  time: string;
  comment: string;
  avatar: string;
}

interface StarRatingProps {
  rating: number;
}

const VenueProviderPage: React.FC = () => {
  const venues: Venue[] = [
    {
      id: 1,
      name: "Royal Grand Banquet Hall",
      location: "Gulshan, Dhaka",
      capacity: 500,
      rating: 4.9,
      price: 85000,
      image: "https://images.unsplash.com/photo-1519167758481-83f29da8785a?w=800&q=80"
    },
    {
      id: 2,
      name: "Elite Conference Center",
      location: "Banani, Dhaka",
      capacity: 300,
      rating: 4.7,
      price: 65000,
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
    },
    {
      id: 3,
      name: "Garden Paradise Event Space",
      location: "Uttara, Dhaka",
      capacity: 400,
      rating: 4.8,
      price: 75000,
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80"
    },
    {
      id: 4,
      name: "Skyline Rooftop Venue",
      location: "Dhanmondi, Dhaka",
      capacity: 200,
      rating: 4.9,
      price: 55000,
      image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80"
    },
    {
      id: 5,
      name: "Heritage Banquet Hall",
      location: "Mirpur, Dhaka",
      capacity: 350,
      rating: 4.6,
      price: 60000,
      image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80"
    },
    {
      id: 6,
      name: "Celebration Lounge",
      location: "Bashundhara, Dhaka",
      capacity: 150,
      rating: 4.8,
      price: 40000,
      image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80"
    }
  ];

  const reviews: Review[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      time: "2 weeks ago",
      comment: "Absolutely stunning venue! The staff was incredibly helpful and the space exceeded our expectations. Our wedding was perfect thanks to their attention to detail.",
      avatar: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 4,
      time: "1 month ago",
      comment: "Great venue for corporate events. The AV equipment was top-notch and the catering was excellent. Would definitely book again for future events.",
      avatar: "MC"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      rating: 5,
      time: "3 weeks ago",
      comment: "Beautiful space with amazing city views. The event coordination team made everything seamless. Highly recommend for any special occasion.",
      avatar: "ER"
    }
  ];

  const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="px-[32px] md:px-[104px] py-[32px] md:py-[70px] ">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-[16px] md:p-[32px] mb-[24px] md:mb-[45px] border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[gradient-to-br from-amber-100 to-amber-200] rounded-lg flex items-center justify-center flex-shrink-0">
              <Image src={img} alt="img" width={96} height={96} />
            </div>
            
            <div className="flex-1 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Premium Venues Bangladesh</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span>Overall Rating</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Leading venue provider specializing in corporate events, weddings, and social gatherings across Dhaka metropolitan area.
              </p>
            </div>

            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-[#B74140] text-[#B74140] rounded-lg hover:bg-red-50 transition-colors">
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-[25px] md:mb-[45px]">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[25px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">24</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Venues Listed</div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[25px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">4.8</div>
            <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[25px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">8+</div>
            <div className="text-xs sm:text-sm text-gray-600">Years of Experience</div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] p-[25px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">2 hrs</div>
            <div className="text-xs sm:text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white  mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">About the Provider</h2>
          <div className="space-y-4 text-sm sm:text-base text-gray-600 leading-relaxed rounded-lg border border-[#E5E7EB] p-[32px]">
            <p>
              Premium Venues Bangladesh is a trusted name in the event venue industry, serving clients across Dhaka for over 8 years. We specialize in providing top-tier venues for corporate events, weddings, conferences, and social gatherings. Our portfolio includes a diverse range of spaces from intimate banquet halls to large convention centers, all equipped with modern amenities and professional management.
            </p>
            <p>
              With a commitment to excellence, we ensure every venue meets the highest standards of quality, safety, and service. Our experienced team works closely with clients to understand their needs and deliver seamless event experiences. We pride ourselves on transparent pricing, timely communication, and professional venue management.
            </p>
          </div>
        </div>

        {/* Venues Section */}
        <div className="bg-white rounded-lg  border border-[#E5E7EB] p-[12px] mb-[24px] md:mb-[45px]">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-[22px]">Venues by This Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {venues.map((venue: Venue) => (
              <div key={venue.id} className="border border-[#E5E7EB] rounded-lg overflow-hidden  ">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-[#B74140]" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <span>👥 Capacity: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs sm:text-sm font-semibold">{venue.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Starting from</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900">${venue.price.toLocaleString()}</div>
                    </div>
                    <button className="px-4 py-2 bg-[#B74140] text-white text-sm rounded-lg hover:bg-[#a53836] transition-colors">
                      View Venue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-[12px] mb-[32px]">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Reviews & Ratings</h2>
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review: Review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 sm:pb-6 last:pb-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col   gap-1 sm:gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{review.name}</h4>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs sm:text-sm text-gray-500">{review.time}</span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueProviderPage;