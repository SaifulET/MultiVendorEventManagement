import BookingRequestChatPage from "@/app/component/shared/BookingRequestChatPage";

export default function EventPlannerBookingRequestChatPage() {
  return (
    <BookingRequestChatPage
      dashboardName="event planner"
      emptyStateDescription="Use chat to keep approvals, timing, and event requirements clear."
      searchPlaceholder="Search by client or booking..."
      sendButtonLabel="Reply"
      composerPlaceholder="Write a helpful reply for your client..."
    />
  );
}
