import { Suspense } from "react";

import BookingRequestChatPage from "@/app/component/shared/BookingRequestChatPage";

export default function EventPlannerBookingRequestChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading chat...</div>}>
      <BookingRequestChatPage
        dashboardName="event planner"
        emptyStateDescription="Use chat to keep approvals, timing, and event requirements clear."
        searchPlaceholder="Search by client or booking..."
        sendButtonLabel="Reply"
        composerPlaceholder="Write a helpful reply for your client..."
      />
    </Suspense>
  );
}
