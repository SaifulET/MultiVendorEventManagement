'use client';

import { X } from 'lucide-react';
import React from 'react';

interface BookingPopupProps {
  actionLabel?: string;
  message: string;
  onClose: () => void;
  open: boolean;
  title: string;
}

const BookingPopup: React.FC<BookingPopupProps> = ({
  actionLabel = 'OK',
  message,
  onClose,
  open,
  title,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm leading-6 text-gray-600">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-[#B74140] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#9a3635]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default BookingPopup;
