'use client';

import React, { useState } from 'react';
import { CreditCard, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaymentRecord {
  id: number;
  venueName: string;
  location: string;
  eventDate: string;
  amount: number;
  paymentMethod: 'Stripe' | 'Card' | 'Bank Transfer';
  status: 'Paid' | 'Pending';
  payoutDate: string | null;
}

export default function PaymentRecords() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const paymentRecords: PaymentRecord[] = [
    {
      id: 1,
      venueName: 'Grand Ballroom',
      location: 'Mumbai, Maharashtra',
      eventDate: 'Dec 28, 2024',
      amount: 45000,
      paymentMethod: 'Stripe',
      status: 'Paid',
      payoutDate: 'Dec 30, 2025'
    },
    {
      id: 2,
      venueName: 'Sky Terrace',
      location: 'Bangalore, Karnataka',
      eventDate: 'Dec 26, 2024',
      amount: 32500,
      paymentMethod: 'Card',
      status: 'Pending',
      payoutDate: null
    },
    {
      id: 3,
      venueName: 'Garden Plaza',
      location: 'Delhi, NCR',
      eventDate: 'Dec 24, 2024',
      amount: 58000,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      payoutDate: 'Dec 27, 2025'
    },
    {
      id: 4,
      venueName: 'Crystal Hall',
      location: 'Pune, Maharashtra',
      eventDate: 'Dec 22, 2024',
      amount: 28500,
      paymentMethod: 'Stripe',
      status: 'Paid',
      payoutDate: 'Dec 25, 2025'
    },
    {
      id: 5,
      venueName: 'Royal Banquet',
      location: 'Hyderabad, Telangana',
      eventDate: 'Dec 20, 2024',
      amount: 42000,
      paymentMethod: 'Card',
      status: 'Pending',
      payoutDate: null
    },
    {
      id: 6,
      venueName: 'Sunset Lounge',
      location: 'Goa',
      eventDate: 'Dec 18, 2024',
      amount: 65000,
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      payoutDate: 'Dec 21, 2025'
    },
    {
      id: 7,
      venueName: 'Heritage Mansion',
      location: 'Jaipur, Rajasthan',
      eventDate: 'Dec 16, 2024',
      amount: 52500,
      paymentMethod: 'Stripe',
      status: 'Paid',
      payoutDate: 'Dec 19, 2025'
    },
    {
      id: 8,
      venueName: 'Ocean View Resort',
      location: 'Chennai, Tamil Nadu',
      eventDate: 'Dec 15, 2024',
      amount: 38000,
      paymentMethod: 'Card',
      status: 'Pending',
      payoutDate: null
    }
  ];

  // Add more dummy data to reach 250 total records
  const allRecords = [...paymentRecords];
  const baseRecords = [...paymentRecords];
  
  for (let i = 0; i < 30; i++) {
    baseRecords.forEach((record, idx) => {
      allRecords.push({
        ...record,
        id: paymentRecords.length + (i * paymentRecords.length) + idx + 1,
        eventDate: `Dec ${15 - (i % 15)}, 2024`,
        payoutDate: record.payoutDate ? `Dec ${20 + (i % 10)}, 2025` : null
      });
    });
  }

  const totalRecords = 250;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const currentRecords = allRecords.slice(startIndex, endIndex);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Stripe':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-slate-700 text-sm">Stripe</span>
          </div>
        );
      case 'Card':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-700 text-sm">Card</span>
          </div>
        );
      case 'Bank Transfer':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-slate-700 text-sm">Bank Transfer</span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 7;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      buttons.push(1, 2, 3, 4);
      buttons.push('...');
      buttons.push(30, 60, 120);
    }

    return buttons;
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          {/* Header */}
          <div className=" p-[22px] border-b  border-[#E5E7EB]">
            <h1 className="font-inter font-semibold text-[18px] leading-[28px] tracking-[0] text-slate-900">Payment Records</h1>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Venue Name</th>
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Event Date</th>
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Amount</th>
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Payment Method</th>
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="p-[17px] text-left text-sm font-semibold text-slate-700">Payout Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
  {currentRecords.map((record) => (
    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
      
      <td className="pl-[17px] pr-4 py-4 text-left">
        <div>
          <div className="font-semibold text-slate-900 text-sm">{record.venueName}</div>
          <div className="text-slate-500 text-sm mt-0.5">{record.location}</div>
        </div>
      </td>

      <td className="pl-[17px] pr-4 py-4 text-slate-700 text-sm">{record.eventDate}</td>
      <td className="pl-[17px] pr-4 py-4 text-slate-900 font-bold text-sm">
        ${record.amount.toLocaleString()}
      </td>
      <td className="pl-[17px] pr-4 py-4">{getPaymentMethodIcon(record.paymentMethod)}</td>
      <td className="pl-[17px] pr-4 py-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
            record.status === 'Paid'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {record.status}
        </span>
      </td>
      <td className="pl-[17px] pr-4 py-4 text-slate-700 text-sm">
        {record.payoutDate || '—'}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {currentRecords.map((record) => (
              <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors duration-150">
                <div className="space-y-3">
                  {/* Venue Name */}
                  <div>
                    <div className="font-semibold text-slate-900 text-base">{record.venueName}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{record.location}</div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Event Date</div>
                      <div className="text-sm text-slate-700">{record.eventDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Amount</div>
                      <div className="text-sm font-bold text-slate-900">
                        ${record.amount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Payment Method</div>
                      <div>{getPaymentMethodIcon(record.paymentMethod)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Status</div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                          record.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-[amber-700]'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-slate-500 mb-1">Payout Date</div>
                      <div className="text-sm text-slate-700">{record.payoutDate || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t  border-[#E5E7EB] bg-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Records Info */}
              <div className="text-sm">
                <span className="text-[#B74140] font-semibold">
                  SHOWING {startIndex + 1}-{endIndex} OF {totalRecords}
                </span>
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {renderPaginationButtons().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-slate-400">
                          .....
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                          currentPage === page
                            ? 'bg-[#B74140] text-white'
                            : 'text-slate-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}