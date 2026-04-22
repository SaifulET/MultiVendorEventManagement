import { Suspense } from "react";

import BookingRequestChatPage from "@/app/component/shared/BookingRequestChatPage";

export default function ServiceProviderBookingRequestChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading chat...</div>}>
      <BookingRequestChatPage
        dashboardName="service provider"
        emptyStateDescription="Use chat to confirm service details, timing, and any booking updates with less back-and-forth."
        searchPlaceholder="Search by client or booking..."
        sendButtonLabel="Reply"
        composerPlaceholder="Write a helpful reply for your client..."
      />
    </Suspense>
  );
}
