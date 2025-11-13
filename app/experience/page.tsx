'use client'

import React from 'react'
import HeroSection from './components/HeroSection'
import AboutFratVilla from './components/AboutFratVilla'
import TimelineSection from './components/TimelineSection'
import ImageGallery from './components/ImageGallery'
import TribeSection from './components/TribeSection'
import DepthSection from './components/DepthSection'
import Footer from '../website-navigation/components/Footer'
import { useIsMobile } from '../(quest)/quest/utils/use-mobile'
import Navigation from '../website-navigation/components/Navigation'
import PricingSection from './components/PricingSection'
import Pricing from './components/Pricing'

const page = () => {

  return (
    <div>
      <Navigation />
      {/* Hero Section - Critical path, load eagerly */}
      <HeroSection />
      <AboutFratVilla />
      <TimelineSection />
      <Pricing />
      {/* {!isMobile && <ImageGallery />} */}
      <TribeSection />
      <DepthSection />
      <Footer />
    </div>
  )
}

export default page