import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' // Import Link from react-router-dom

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = [
    'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web9.jpeg',
    'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/home12.jpeg',
  ]

  const marqueeItems = [
    '100% HIGH-QUALITY SCENT OILS',
    'UP TO 50+ DAYS OF CONTINUOUS FRAGRANCE',
    'SPECIAL BUNDLE DISCOUNTS AVAILABLE',
    'ELEVATE YOUR DAILY DRIVE',
    'PREMIUM SCENTS IN LUXURY PACKAGING',
    'FREE SHIPPING ON BUNDLE ORDERS',
  ]

  // Automatically cycle hero images every 6 seconds (6000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="text-white relative overflow-hidden">
      {/* 1. Full-Width Landscape Hero Banner with Dual Image Slider */}
      <div className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Images with Crossfade Transition */}
        {images.map((imgSrc, index) => (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={`HappyHangs Atmosphere ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          />
        ))}

        {/* Subtle dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20 z-0" />

        {/* Text Overlay Positioned on the Left Side */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="max-w-lg text-center md:text-left drop-shadow-md">
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              Redefining Your Atmosphere
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-100 font-light leading-relaxed">
              Discover an accessible lifestyle brand that transforms vehicle interiors and indoor space through sensory design and high quality, long-lasting fragrances.
            </p>

            {/* Updated CTA to route to /catalog */}
            <Link
              to="/catalog"
              className="mt-8 inline-block bg-black text-white text-sm font-medium px-8 py-3.5 rounded-xl hover:bg-neutral-800 transition-colors duration-200 shadow-md"
            >
              Shop now
            </Link>
          </div>
        </div>

        {/* Slider Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Infinite Marquee Carousel Banner */}
      <div className="bg-[#e8cb97] text-black py-3 border-y border-[#d9ba84] overflow-hidden whitespace-nowrap flex select-none">
        <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-8">
          {marqueeItems.concat(marqueeItems).map((text, idx) => (
            <React.Fragment key={idx}>
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
                {text}
              </span>
              <span className="text-xs opacity-60">|</span>
            </React.Fragment>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-8"
        >
          {marqueeItems.concat(marqueeItems).map((text, idx) => (
            <React.Fragment key={`clone-${idx}`}>
              <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
                {text}
              </span>
              <span className="text-xs opacity-60">|</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}