import React, { useState, useEffect } from 'react'

const ANNOUNCEMENTS = [
  "DELIVERING ACROSS PAKISTAN",
  "WELCOME TO HAPPYHANGS!",
  "FREE SHIPPING ON BUNDLE ORDERS",
  "PREMIUM FRAGRANCES THAT LAST"
]

export default function PromoBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#f5c28b] text-black font-semibold text-xs tracking-wider py-2 text-center transition-all duration-500">
      {ANNOUNCEMENTS[index]}
    </div>
  )
}