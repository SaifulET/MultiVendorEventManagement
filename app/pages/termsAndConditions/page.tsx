import AboutUs from '@/app/component/Pages/AboutUs/Aboutus'
import Footer from '@/app/component/Pages/LeandingPage/Footer'
import Navbar from '@/app/component/Pages/LeandingPage/Navbar'
import TermsAndConditions from '@/app/component/Pages/TermsAndCondition/TermsAndCondition'
import React from 'react'

function page() {
  return (
    <div><Navbar/><TermsAndConditions /><Footer/></div>
  )
}

export default page