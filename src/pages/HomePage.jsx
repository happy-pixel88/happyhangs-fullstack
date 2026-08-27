import React from 'react'
import HeroSection from '../components/home/HeroSection'
import MidPageFeature from '../components/home/MidPageFeature'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero section or primary store banner */}
     
      {/* Hero Section Banner & Philosophy */}
      <HeroSection />

      {/* Interactive Mid-Page Feature Block */}
      <MidPageFeature r2ImageUrl="https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web6.jpeg" />
    
    </div>
  )
}