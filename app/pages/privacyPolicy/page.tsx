import AboutUs from '@/app/component/Pages/AboutUs/Aboutus'
import Footer from '@/app/component/Pages/LeandingPage/Footer'
import Navbar from '@/app/component/Pages/LeandingPage/Navbar'
import PrivacyPolicy from '@/app/component/Pages/PrivacyPolicy/PrivacyPolicy'
import React from 'react'

function page() {
  return (
    <div><Navbar/><PrivacyPolicy/><Footer/></div>
  )
}

export default page