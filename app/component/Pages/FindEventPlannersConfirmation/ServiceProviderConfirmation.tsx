'use client';

import { Bell } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

const ServiceProviderConfirmation: React.FC = () => {
  // Get current date for the month
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(now.getFullYear(), now.getMonth(), 15));
  const [selectedTime, setSelectedTime] = useState('2:00 PM');
  const [duration, setDuration] = useState(4);
  const [location, setLocation] = useState('Farmgate, Dhaka');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [durationError, setDurationError] = useState('');

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

  // Validate duration to prevent crossing booked hours
  const validateDuration = (newDuration: number) => {
    if (selectedTime === '5:00 PM' && newDuration > 1) {
      setDurationError('Cannot exceed available hours. Last slot ends at 6:00 PM.');
      return false;
    }
    
    if (selectedTime === '4:00 PM' && newDuration > 2) {
      setDurationError('Cannot exceed available hours. Last slot ends at 6:00 PM.');
      return false;
    }
    
    if (selectedTime === '3:00 PM' && newDuration > 3) {
      setDurationError('Cannot exceed available hours. Last slot ends at 6:00 PM.');
      return false;
    }
    
    // For other times, check if end time goes beyond 6:00 PM
    const timeParts = selectedTime.split(' ');
    const time = timeParts[0];
    const period = timeParts[1];
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    
    const endHour = totalHours + newDuration;
    
    if (endHour > 18) { // 6:00 PM is 18:00
      setDurationError('Cannot exceed available hours. Last slot ends at 6:00 PM.');
      return false;
    }
    
    setDurationError('');
    return true;
  };

  // Calculate end time based on selected time and duration
  const calculateEndTime = () => {
    if (!selectedTime) return '';
    
    const timeParts = selectedTime.split(' ');
    const time = timeParts[0];
    const period = timeParts[1];
    const [hours, minutes] = time.split(':').map(Number);
    
    let totalHours = hours;
    if (period === 'PM' && hours !== 12) totalHours += 12;
    if (period === 'AM' && hours === 12) totalHours = 0;
    
    const endHour = totalHours + duration;
    let displayHour = endHour % 12;
    if (displayHour === 0) displayHour = 12;
    
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${endPeriod}`;
  };

  // Calculate total price with tax
  const calculateTotalPrice = () => {
    const basePrice = 1500; // Base price for the service
    const hourlyRate = 50; // Additional rate per hour beyond base duration
    const baseDuration = 4; // Base duration included in base price
    
    let total = basePrice;
    if (duration > baseDuration) {
      total += (duration - baseDuration) * hourlyRate;
    }
    
    const tax = total * 0.10; // 10% tax
    return {
      base: total,
      tax: tax,
      total: total + tax
    };
  };

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

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      if (validateDuration(value)) {
        setDuration(value);
      }
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleSpecialInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSpecialInstructions(e.target.value);
  };

  // Update duration validation when selected time changes
  useEffect(() => {
    validateDuration(duration);
  }, [selectedTime]);

  const router = useRouter();
  const handleConfirmBooking = () => {
    if (!agreeTerms) return;
    if (durationError) return; // Don't proceed if there's a duration error
    
    // Prepare booking data
    const bookingData = {
      date: formatDate(selectedDate),
      time: selectedTime,
      endTime: calculateEndTime(),
      duration,
      location,
      specialInstructions,
      price: calculateTotalPrice(),
      cardLastFour: cardNumber.slice(-4),
      provider: 'Marvin McKinney'
    };
    
    // Store booking data in localStorage for the confirmation page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    router.push('/pages/reviewEventPlanner/confirmed-booking-slug');
  };

  const calendarDays = getCalendarDays();
  const endTime = calculateEndTime();
  const priceDetails = calculateTotalPrice();

  return (
    <div className="min-h-screen  px-[32px] md:px-[104px] py-[38px]">
      <div className="">
        <h1 className="font-inter font-bold text-[24px] leading-[32px] tracking-normal mb-[20px]">Complete Your Booking</h1>

        {/* MASTER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[32px]">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* DATE & TIME */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
              <div className='flex items-center justify-between'> 
                <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>
                <div className="w-[198px] flex flex-col justify-center items-center gap-2">
                  <button 
                    type="button"
                    className="bg-[#B74140] text-white px-[15px] py-[2px] rounded-lg hover:bg-[#9a3635] transition-colors flex"
                  >
                    <Bell/> Notify Me
                  </button>
                  <p className='font-inter font-normal text-[10px] leading-[1] tracking-normal text-center'>If you keep the Notify Me button active, you will receive an email as soon as this venue becomes available. Thank you!</p>
                </div>
              </div>
              
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
                          ${day.booked ? 'bg-red-100 cursor-not-allowed' : ''}
                          ${day.available ? 'bg-[#3CCF911A]' : ''}
                          ${isSameDay(day.date, selectedDate) && !day.available && !day.booked 
                            ? 'bg-[#3CCF91]' 
                            : 'hover:bg-gray-100'
                          }
                          ${!day.available && !day.booked && !isSameDay(day.date, selectedDate) 
                            ? 'bg-[#3CCF911A]' 
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
                            ? 'bg-white hover:bg-green-200' 
                            : ''
                          }
                          ${!slot.available 
                            ? 'bg-[#FEF2F2] text-red-400 cursor-not-allowed border border-red-100 border-1' 
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

              {/* ADDITIONAL FIELDS */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration (hours) */}
                <div className="relative">
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={handleDurationChange}
                    min="1"
                    max="8"
                    placeholder="Enter duration in hours"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none transition-colors ${
                      durationError ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {durationError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {durationError}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Enter venue location"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none transition-colors"
                  />
                </div>

                {/* Special Instructions - Full width */}
                <div className="md:col-span-2">
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={handleSpecialInstructionsChange}
                    rows={4}
                    placeholder="Any special requirements or instructions for your booking..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B74140] focus:border-transparent outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="bg-white rounded-lg  border border-[#E5E7EB] p-6">
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
            <div className="bg-white rounded-lg  border border-[#E5E7EB] p-6 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreeTerms} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#B74140] focus:ring-[#B74140]"
                />
                <span className="text-gray-700">
                  I agree to the <a href="#" className="text-[#B74140] hover:underline">Terms of Service</a>
                </span>
              </label>

              <button 
                type="button"
                disabled={!agreeTerms || !!durationError}
                onClick={handleConfirmBooking}
                className={`
                  w-full py-4 rounded-lg text-lg font-semibold transition-all
                  ${agreeTerms && !durationError
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
            <div className="bg-white rounded-lg  border border-[#E5E7EB] p-6">
              <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>

              {/* Provider Info */}
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={img.src}
                  alt="Provider"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-base">Marvin McKinney</h3>
                  <p className="text-sm text-gray-600">Premium Wedding & Event Planner</p>
                </div>
              </div>

              {/* Contact Button */}
              <button onClick={()=>{router.push("/home/dashboard/chat")}} className="w-full border border-gray-300 rounded-lg py-3 mb-6 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
                <span className="font-medium">Contact Provider</span>
              </button>

              {/* Booking Details */}
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime} - {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Duration:</span>
                  <span className="font-medium">{duration}hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${priceDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-lg">${priceDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ServiceProviderConfirmation;