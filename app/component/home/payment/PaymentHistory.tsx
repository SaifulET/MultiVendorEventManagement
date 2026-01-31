'use client'
import React from 'react';
import { Check, CreditCard, Landmark, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: number;
  providerName: string;
  type: 'Venue' | 'Service';
  bookingDate: string;
  amount: number;
  paymentMethod: 'Card' | 'Stripe';
  status: 'Completed';
}

const PaymentHistory = () => {
  const payments: Payment[] = [
    {
      id: 1,
      providerName: 'Royal Convention Hall',
      type: 'Venue',
      bookingDate: '22 Aug 2025',
      amount: 45000,
      paymentMethod: 'Card',
      status: 'Completed'
    },
    {
      id: 2,
      providerName: 'Elite Photography Studio',
      type: 'Service',
      bookingDate: '18 Aug 2025',
      amount: 25500,
      paymentMethod: 'Stripe',
      status: 'Completed'
    },
    {
      id: 3,
      providerName: 'Grand Ballroom Dhaka',
      type: 'Venue',
      bookingDate: '15 Aug 2025',
      amount: 52000,
      paymentMethod: 'Card',
      status: 'Completed'
    },
    {
      id: 4,
      providerName: 'Deluxe Catering Services',
      type: 'Service',
      bookingDate: '12 Aug 2025',
      amount: 38750,
      paymentMethod: 'Stripe',
      status: 'Completed'
    },
    {
      id: 5,
      providerName: 'Skyview Rooftop Lounge',
      type: 'Venue',
      bookingDate: '08 Aug 2025',
      amount: 29500,
      paymentMethod: 'Card',
      status: 'Completed'
    },
    {
      id: 6,
      providerName: 'Premium DJ & Sound',
      type: 'Service',
      bookingDate: '05 Aug 2025',
      amount: 18000,
      paymentMethod: 'Card',
      status: 'Completed'
    }
  ];

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getTypeStyles = (type: string) => {
    if (type === 'Venue') {
      return 'bg-[#B741401A] bg-opacity-10 text-[#B74140]';
    }
    return 'bg-[#FFF4ED] bg-opacity-10 text-[#FF8A3D]';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'Venue') {
      return <Landmark size={16} color="#B74140" strokeWidth={1.25} />;
    }
    return <User size={16} color="#FF8A3D" strokeWidth={1.25} />;
  };
  const router = useRouter();
    const ViewDetails = () => {
        router.push('/home/dashboard/payment/payment-details');
     }

  return (
    <div className="min-h-screen py-[32px]">
      <div className="">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="font-inter font-bold text-[24px] leading-[32px] tracking-normal text-gray-900 mb-2">
            Payment History
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View all your completed bookings and payments
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#E5E7EB] border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Provider Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Booking Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {payment.providerName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-[8px] py-[4px] rounded-full font-inter font-medium text-[12px] leading-[1] tracking-normal ${getTypeStyles(payment.type)}`}>
                      <span>{getTypeIcon(payment.type)}</span>
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {payment.bookingDate}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {formatAmount(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <CreditCard className="w-4 h-4" />
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E9F9F1] bg-opacity-10 text-[#3CCF91]">
                      <span className="w-[12px] h-[12px]  rounded-full bg-[#3CCF91] text-[#E9F9F1] flex items-center justify-center "> <Check /></span>
                     {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={ViewDetails} className="px-5 py-2 bg-[#B74140] text-white rounded-md text-sm font-medium hover:bg-[#9a3635] transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {payment.providerName}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getTypeStyles(payment.type)}`}>
                    <span>{getTypeIcon(payment.type)}</span>
                    {payment.type}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E9F9F1] bg-opacity-10 text-[#3CCF91]">
                  <span className="w-[12px] h-[12px]  rounded-full bg-[#3CCF91] text-[#E9F9F1] flex items-center justify-center "> <Check /></span>
                  {payment.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="text-gray-900 font-medium">{payment.bookingDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-gray-900 font-semibold">{formatAmount(payment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="inline-flex items-center gap-1.5 text-gray-900">
                    <CreditCard className="w-4 h-4" />
                    {payment.paymentMethod}
                  </span>
                </div>
              </div>

              <button className="w-full px-5 py-2 bg-[#B74140] text-white rounded-md text-sm font-medium hover:bg-[#9a3635] transition-colors">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;