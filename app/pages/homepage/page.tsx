import EventBookingHub from "@/app/component/Pages/LeandingPage/eventBookingHub";
import FAQPage from "@/app/component/Pages/LeandingPage/Faq";
import FeaturedVenuesPage from "@/app/component/Pages/LeandingPage/FeaturedVanue/FeaturedVanue";
import Footer from "@/app/component/Pages/LeandingPage/Footer";
import GrowBusinessSection from "@/app/component/Pages/LeandingPage/GrowBusiness";
import Navbar from "@/app/component/Pages/LeandingPage/Navbar";
import HeroSlider from "@/app/component/Pages/LeandingPage/slider";
import TrustedEventPlannerPage from "@/app/component/Pages/LeandingPage/TrustedEventPlanner";
import TrustedServiceProviderPage from "@/app/component/Pages/LeandingPage/TrustedServiceProvider";
import WhyChooseEvenit from "@/app/component/Pages/LeandingPage/whyChooseUs";
import React from "react";

function page() {
  return (
    <div>
      <Navbar />
      <HeroSlider />
      <EventBookingHub />
      <FeaturedVenuesPage />
      <GrowBusinessSection />
      <TrustedServiceProviderPage />
      <WhyChooseEvenit />
      <TrustedEventPlannerPage/>
      <FAQPage />
      <Footer/>
    </div>
  );
}

export default page;
