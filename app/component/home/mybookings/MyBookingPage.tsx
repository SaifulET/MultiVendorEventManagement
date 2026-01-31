import React from 'react';
import img from "@/public/img.png"
import { useRouter } from 'next/navigation';
interface Booking {
  type: 'Venue' | 'Service';
  name: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

const MyBookingsPage = () => {
  const bookings: Booking[] = [
    {
      type: 'Venue',
      name: 'Grand Ballroom',
      date: 'Dec 25, 2024',
      time: '6:00 PM',
      status: 'Confirmed'
    },
    {
      type: 'Service',
      name: 'Elite Photography',
      date: 'Dec 20, 2024',
      time: '2:00 PM',
      status: 'Pending'
    },
    {
      type: 'Venue',
      name: 'Rooftop Garden',
      date: 'Dec 15, 2024',
      time: '7:00 PM',
      status: 'Completed'
    }
  ];

  const getTypeColor = (type: string) => {
    return type === 'Venue' ? 'text-[#B74140]' : 'text-[#FFB94F]';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-[#3CCF91] bg-[#3CCF91]/10';
      case 'Pending':
        return 'text-[#FFB94F] bg-[#FFB94F]/10';
      case 'Completed':
        return 'text-[#6B6B6B] bg-[#6B6B6B]/10';
      default:
        return '';
    }
  };
const router= useRouter()
  const getActionButton = (status: string) => {
    if (status === 'Pending') {
      return (
        <div className="flex gap-2">
          <button onClick={()=>{router.push("/home/mybookings/booking-details")}} className="text-[#B74140] hover:underline">View</button>
          <button className="text-[#FF5A5A] hover:underline">Cancel</button>
        </div>
      );
    } else if (status === 'Completed') {
      return (
        <div className="flex gap-2">
          <button onClick={()=>{router.push("/home/mybookings/booking-details")}} className="text-[#B74140] hover:underline">View</button>
          <button className="text-[#B74140] hover:underline">Review</button>
        </div>
      );
    } else {
      return (
        <div className="flex gap-2">
          <button onClick={()=>{router.push("/home/mybookings/booking-details")}} className="text-[#B74140] hover:underline">View</button>
          <button onClick={()=>{router.push("/home/dashboard/chat")}} className="text-[#B74140] hover:underline">Message</button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen  ">
      <div >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px]">
          {/* My Bookings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 ">
              <h1 className="text-2xl md:text-3xl font-bold p-[24px]">My Bookings</h1>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#FAFAFA]">
                      <th className="text-left py-4 px-2 text-gray-600 font-medium">Type</th>
                      <th className="text-left py-4 px-2 text-gray-600 font-medium">Name</th>
                      <th className="text-left py-4 px-2 text-gray-600 font-medium">Date & Time</th>
                      <th className="text-left py-4 px-2 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-4 px-2 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-6 px-2">
                          <span className={`font-medium ${getTypeColor(booking.type)}`}>
                            {booking.type}
                          </span>
                        </td>
                        <td className="py-6 px-2 font-medium text-gray-900">{booking.name}</td>
                        <td className="py-6 px-2 text-gray-700">
                          <div>{booking.date} •</div>
                          <div>{booking.time}</div>
                        </td>
                        <td className="py-6 px-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-6 px-2">
                          {getActionButton(booking.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {bookings.map((booking, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`text-sm font-medium ${getTypeColor(booking.type)}`}>
                          {booking.type}
                        </span>
                        <h3 className="font-bold text-lg mt-1">{booking.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm mb-3">
                      {booking.date} • {booking.time}
                    </div>
                    <div className="flex gap-3">
                      {getActionButton(booking.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Booking Section */}
          <div className="lg:col-span-1 w-[302px]">
            <div className="bg-[#FAFAFA] rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-4">Upcoming Booking</h2>
              
              <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
                <img 
                  src={img.src} 
                  alt="Grand Ballroom" 
                  className="w-full h-full object-fit"
                />
              </div>

              <h3 className="text-xl font-bold mb-2">Grand Ballroom</h3>
              <p className="text-gray-700 mb-1">Dec 25, 2024 • 6:00 PM</p>
              <p className="text-gray-600 mb-3">Downtown Convention Center</p>
              
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-[#3CCF91] bg-[#3CCF91]/10 mb-4">
                Confirmed
              </span>

              <button onClick={()=>{router.push("/home/mybookings/booking-details")}}   className="w-full bg-[#B74140] text-white py-3 rounded-lg font-medium hover:bg-[#A03736] transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;