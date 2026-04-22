import { Suspense } from "react";

import BookingRequestChatPage from "@/app/component/shared/BookingRequestChatPage";

export default function VenueProviderBookingRequestChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading chat...</div>}>
      <BookingRequestChatPage
        dashboardName="venue provider"
        emptyStateDescription="Use chat to confirm venue details, schedules, and next steps quickly."
        searchPlaceholder="Search by client or booking..."
        sendButtonLabel="Reply"
        composerPlaceholder="Write a helpful reply for your client..."
      />
    </Suspense>
  );
}
