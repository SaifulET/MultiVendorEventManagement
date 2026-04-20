import BookingRequestChatPage from "@/app/component/shared/BookingRequestChatPage";

export default function VenueProviderBookingRequestChatPage() {
  return (
    <BookingRequestChatPage
      dashboardName="venue provider"
      emptyStateDescription="Use chat to confirm venue details, schedules, and next steps quickly."
      searchPlaceholder="Search by client or booking..."
      sendButtonLabel="Reply"
      composerPlaceholder="Write a helpful reply for your client..."
    />
  );
}
