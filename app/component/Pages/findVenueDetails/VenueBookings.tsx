'use client';

import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import img from "@/public/bookingsummary.svg";
import { useRouter } from 'next/navigation';
interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalendarDay {
  date: Date | null;
  day?: number;
  available?: boolean;
  booked?: boolean;
}

const VenueBooking: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 2, 15));
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [eventType, setEventType] = useState('Corporate Meeting');
  const [guests, setGuests] = useState(50);
  const [duration, setDuration] = useState(4);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const timeSlots: TimeSlot[] = [
    { time: '9:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ];

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: CalendarDay[] = [];

    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null });
    }

    // Add actual days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        available: day === 10,
        booked: day === 21 || day === 22,
      });
    }

    return days;
  };

  const isSameDay = (a: Date | null, b: Date | null): boolean => {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add space every 4 digits
    setCardNumber(formatted.slice(0, 19)); // Limit to 16 digits + 3 spaces
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value.slice(0, 4));
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setGuests(value);
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      setDuration(value);
    }
  };
const router = useRouter();
  const handleConfirmBooking = () => {
    if (!agreeTerms) return;
    
   router.push('/pages/venueBookingconfirmation/confirmed-booking-slug');
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="min-h-screen  px-[32px] md:px-[104px] py-[38px]">
      <div className="">
        <h1 className="font-inter font-bold text-[24px] leading-[32px] tracking-normal mb-[20px]">Venue Booking</h1>

        {/* MASTER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[32px]">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* DATE & TIME */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>

              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                
                {/* CALENDAR */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Date</span>
                    <span className="font-medium">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-sm text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={!day.date || day.booked}
                        onClick={() => day.date && setSelectedDate(day.date)}
                        className={`
                          aspect-square rounded text-sm font-medium transition-colors text-gray-900
                          ${!day.date ? 'invisible' : ''}
                          ${day.booked ? 'bg-red-100  cursor-not-allowed' : ''}
                          ${day.available ? 'bg-[#3CCF911A] ' : ''}
                          ${isSameDay(day.date, selectedDate) && !day.available && !day.booked 
                            ? 'bg-[#3CCF91] ' 
                            : 'hover:bg-gray-100'
                          }
                          ${!day.available && !day.booked && !isSameDay(day.date, selectedDate) 
                            ? 'bg-[#3CCF911A] ' 
                            : ''
                          }
                        `}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIME SLOTS */}
                <div>
                  <p className="font-medium mb-3">Time Slots</p>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot: TimeSlot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`
                          py-3 rounded font-medium transition-colors text-gray-900
                          ${slot.available && selectedTime === slot.time 
                            ? 'bg-[#3CCF91] text-white ring-2 ring-[#3CCF91] ring-offset-1' 
                            : ''
                          }
                          ${slot.available && selectedTime !== slot.time 
                            ? 'bg-white  hover:bg-green-200' 
                            : ''
                          }
                          ${!slot.available 
                            ? 'bg-[#FEF2F2] text-red-400 cursor-not-allowed border border-red-100 border-1 ' 
                            : ''
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* EVENT DETAILS */}
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Event Details</h2>
                <button 
                  type="button"
                  className="bg-[#B74140] text-white px-[15px] py-[2px] rounded-lg hover:bg-[#9a3635] transition-colors flex"
                >
                  <Bell/> Notify Me
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                    value={eventType} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEventType(e.target.value)}
                  >
                    <option value="Corporate Meeting">Corporate Meeting</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Conference">Conference</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Networking Event">Networking Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                    type="number" 
                    min="1"
                    value={guests} 
                    onChange={handleGuestsChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 h-[120px] focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none resize-none"
                    value={specialInstructions} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requirements for your event..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                    type="number" 
                    min="1"
                    value={duration} 
                    onChange={handleDurationChange}
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none"
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CONFIRM */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreeTerms} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#B74140] focus:ring-[#B74140]"
                />
                <span className="text-gray-700">
                  I agree to the <a href="/pages/termsAndConditions" className="text-[#B74140] hover:underline">Terms of Service</a>
                </span>
              </label>

              <button 
                type="button"
                disabled={!agreeTerms}
                onClick={handleConfirmBooking}
                className={`
                  w-full py-4 rounded-lg text-lg font-semibold transition-all
                  ${agreeTerms 
                    ? 'bg-[#B74140] text-white hover:bg-[#9a3635] active:scale-[0.99]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Confirm Booking
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN - SUMMARY */}
          <div className="sticky top-6 h-fit">
            <div className="bg-white rounded-lg border border-[#E5E7EB]  p-[25px]">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              <img
                src={img.src}
                alt="Venue preview"
                className="rounded-lg mb-4 h-[180px] w-full object-cover"
              />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Event Type</span>
                  <span className="font-medium">{eventType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{guests} people</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{duration} hours</span>
                </div>
                <div className="flex justify-between py-3 pt-4 text-lg font-bold border-t border-gray-200">
                  <span>Total</span>
                  <span>$1,701</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VenueBooking;