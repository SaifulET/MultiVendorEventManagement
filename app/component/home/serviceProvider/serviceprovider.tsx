import React, { FC, ElementType } from 'react';
import { Star, MapPin, Building2, Award, Briefcase, Zap, Users, Mail } from 'lucide-react';

interface Venue {
  name: string;
  location: string;
  capacity: number;
  rating: number;
  price: string;
  image: string;
}

interface Review {
  name: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

interface StatCardProps {
  icon: ElementType;
  value: string;
  label: string;
  bgColor: string;
  iconColor: string;
}

const StatCard: FC<StatCardProps> = ({ icon: Icon, value, label, bgColor, iconColor }) => (
  <div className="bg-white rounded-lg p-[32px] border border-[#E5E7EB] ">
    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const VenueProviderPage: FC = () => {
  const venues: Venue[] = [
    {
      name: "Royal Grand Banquet Hall",
      location: "Gulshan, Dhaka",
      capacity: 500,
      rating: 4.9,
      price: "$85,000",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop"
    },
    {
      name: "Elite Conference Center",
      location: "Banani, Dhaka",
      capacity: 300,
      rating: 4.7,
      price: "$65,000",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop"
    },
    {
      name: "Garden Paradise Event Space",
      location: "Uttara, Dhaka",
      capacity: 400,
      rating: 4.8,
      price: "$75,000",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop"
    },
    {
      name: "Skyline Rooftop Venue",
      location: "Dhanmondi, Dhaka",
      capacity: 200,
      rating: 4.9,
      price: "$55,000",
      image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop"
    },
    {
      name: "Heritage Banquet Hall",
      location: "Mirpur, Dhaka",
      capacity: 350,
      rating: 4.6,
      price: "$60,000",
      image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop"
    },
    {
      name: "Celebration Lounge",
      location: "Bashundhara, Dhaka",
      capacity: 150,
      rating: 4.8,
      price: "$40,000",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"
    }
  ];

  const reviews: Review[] = [
    {
      name: "Sarah Johnson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Absolutely stunning venue! The staff was incredibly helpful and the space exceeded our expectations. Our wedding was perfect thanks to their attention to detail.",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Michael Chen",
      rating: 4,
      date: "1 month ago",
      comment: "Great venue for corporate events. The AV equipment was top-notch and the catering was excellent. Would definitely book again for future events.",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      name: "Emily Rodriguez",
      rating: 5,
      date: "3 weeks ago",
      comment: "Beautiful space with amazing city views. The event coordination team made everything seamless. Highly recommend for any special occasion.",
      avatar: "https://i.pravatar.cc/150?img=5"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-F59E0B text-F59E0B' : 'text-gray-300'
            }`}
            style={{ fill: star <= rating ? '#F59E0B' : 'none', color: star <= rating ? '#F59E0B' : '#D1D5DB' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen px-[104px] py-[32px]">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-[32px] mb-[45px]">
        <div className="">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=150&h=150&fit=crop"
                alt="Premium Venues Bangladesh"
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Premium Venues Bangladesh
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Dhaka, Bangladesh</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-F59E0B" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    <span className="font-semibold text-gray-900">4.8</span>
                    <span className="text-sm text-gray-600">Overall Rating</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
                  Leading venue provider specializing in corporate events, weddings, and social gatherings across Dhaka metropolitan area.
                </p>
              </div>
            </div>
            <button className="px-[12px] py-[12px] text-white rounded-lg font-inter font-medium text-[14px] leading-[14px] tracking-[0] text-center sm:self-auto hover:opacity-90 transition-opacity flex gap-1" style={{ backgroundColor: '#B74140' }}>
              <Mail className='w-[14px] h-[14px]'/> Message
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className=" mb-[45px] ">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
          <StatCard
            icon={Building2}
            value="24"
            label="Total Venues Listed"
            bgColor="bg-blue-50"
            iconColor="text-[#2B7FFF]"
            
          />
          <StatCard
            icon={Award}
            value="4.8"
            label="Average Rating"
            bgColor="bg-amber-50"
            iconColor="text-[#F59E0B]"
          />
          <StatCard
            icon={Briefcase}
            value="8+"
            label="Years of Experience"
            bgColor="bg-emerald-50"
            iconColor="text-[#3CCF91]"
          />
          <StatCard
            icon={Zap}
            value="2 hrs"
            label="Avg Response Time"
            bgColor="bg-purple-50"
            iconColor="text-[#9333EA]"
          />
        </div>
      </div>

      {/* About Section */}
      <div className="mb-[45px]">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-[32px] ">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Provider</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Premium Venues Bangladesh is a trusted name in the event venue industry, serving clients across Dhaka for over 8 years. We specialize in providing top-tier venues for corporate events, weddings, conferences, and social gatherings. Our portfolio includes a diverse range of spaces from intimate banquet halls to large convention centers, all equipped with modern amenities and professional management.
            </p>
            <p>
              With a commitment to excellence, we ensure every venue meets the highest standards of quality, safety, and service. Our experienced team works closely with clients to understand their needs and deliver seamless event experiences. We pride ourselves on transparent pricing, timely communication, and professional venue management.
            </p>
          </div>
        </div>
      </div>

      {/* Venues Section */}
      <div className="mb-[45px] p-[12px] border border-[#E5E7EB] rounded-lg bg-white">
        <h2 className="font-inter font-bold text-[24px] leading-[32px] tracking-[0] text-gray-900 mb-6">Venues by This Provider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue: Venue, index: number) => (
            <div key={index} className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden  transition-shadow">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{venue.name}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{venue.location}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-F59E0B" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                    <span className="font-semibold text-gray-900">{venue.rating}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Starting from</div>
                    <div className="text-xl font-bold text-gray-900">{venue.price}</div>
                  </div>
                  <button className="px-5 py-2 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: '#B74140' }}>
                    View Venue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="p-[32px] border border-[#E5E7EB] rounded-lg bg-white ">
        <h2 className="font-inter font-semibold text-[20px] leading-[28px] tracking-[0] text-gray-900 ">Reviews & Ratings</h2>
        <div className="space-y-4">
          {reviews.map((review: Review, index: number) => (
            <div key={index} className="bg-white border-b border-[#E5E7EB] p-6">
              <div className="flex items-start gap-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{review.name}</h3>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VenueProviderPage;