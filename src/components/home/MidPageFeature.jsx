// CHANGE THIS:
// import { Star, CheckCircle, MessageSquarePlus, ChevronDown, X } from 'lucide-react'

// TO THIS:
import React, { useRef, useState, useEffect } from 'react'
import CollectionSection from '../shop/CollectionSection'
import { homepageSections } from '../../config/sectionsConfig'

// Safe Inline Icon Components (Avoids lucide-react bundler resolution crashes)
const Star = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const CheckCircle = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
)

const ChevronDown = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

const MessageSquarePlus = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
)

const X = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)
const philosophyItems = [
  { title: 'Quality', description: 'Crafted with premium materials for a refined glow.' },
  { title: 'Elegance', description: 'Airy and sophisticated designs that elevate your space.' },
  { title: 'Well-being', description: 'Scents designed to create a soothing, calm environment.' },
  { title: 'Simplicity', description: 'Golden minimalism that complements any interior effortlessly.' },
]
const DEMO_REVIEWS = [
  { id: 1, name: 'Hamza Malik', rating: 5, date: 'Aug 24, 2026', verified: true, title: 'Outstanding Quality!', comment: 'The Ocean Breeze fragrance is incredible. Lasts easily over 3 weeks in my car under extreme heat. Worth every rupee.' },
  { id: 2, name: 'Ayesha Khan', rating: 5, date: 'Aug 22, 2026', verified: true, title: 'Subtle and Elegant', comment: 'Loved the White Peach diffuser. It looks super aesthetic hanging on my rear-view mirror and gives a gentle aroma.' },
  { id: 3, name: 'Bilal Ahmed', rating: 5, date: 'Aug 20, 2026', verified: true, title: 'Best car scent in Pakistan', comment: 'Finally found a brand that doesn’t give me a headache. The wooden cap diffuser mechanism actually works smoothly.' },
  { id: 4, name: 'Laiba Zain', rating: 5, date: 'Aug 19, 2026', verified: true, title: 'Great Refill Value', comment: 'Ordered the bundle refill set. Really cost-effective and packaging was top notch. Fast delivery to Lahore!' },
  { id: 5, name: 'Usman Chaudhry', rating: 4, date: 'Aug 18, 2026', verified: true, title: 'Very Good Product', comment: 'Smell is super fresh. Took 3 days to arrive in Islamabad, but the product quality makes up for it.' },
  { id: 6, name: 'Zainab Ahsan', rating: 5, date: 'Aug 16, 2026', verified: true, title: 'Aesthetic & Fragrant', comment: 'Bought this for my husband’s Civic. He absolutely loved the Bluebell scent! Will reorder soon.' },
   { id: 6, name: 'Ali Bashir', rating: 5, date: 'Aug 26, 2026', verified: true, title: 'Cool Product', comment: 'My wife loved it.' },
]
const faqItems = [
  {
    question: 'How long does a single diffuser bottle last?',
    answer: 'Our oil diffusers are formulated with high-concentration fragrance oils designed to provide up to 50+ days of continuous scent.',
  },
  {
    question: 'How do I activate and set up the diffuser?',
    answer: 'Unscrew the wooden cap, remove the internal plastic stopper, screw the wooden cap back on, and invert the bottle for 3–5 seconds to saturate the cap.',
  },
  {
    question: 'Do you offer Cash on Delivery (COD) across Pakistan?',
    answer: 'Yes, we offer nationwide Cash on Delivery (COD).',
  },
  {
    question: 'What should I do if the fragrance oil spills?',
    answer: 'Because we use premium concentrated oils, immediately wipe off any accidental spills on plastic or painted vehicle surfaces to avoid finish damage.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard delivery typically takes 4–6 business days depending on your city.',
  },
]

const marqueeItems = [
  'PREMIUM SCENTS IN LUXURY PACKAGING',
  'UP TO 50+ DAYS OF CONTINUOUS FRAGRANCE',
  'ELEVATE YOUR DAILY DRIVE',
  '100% HIGH-QUALITY SCENT OILS',
]
const marqueeItems1 = [
  'FREE CASH ON DELIVERY ON ORDERS ABOVE PKR 2000',
  'HIGH QUALITY SCENTS',
  'MADE WITH NATURAL MATERIAL',
  'HIGH-QUALITY SCENTS',
]

function getSection(id) {
  return homepageSections.find((s) => s.id === id)
}

export default function MidPageFeature({ r2ImageUrl }) {
  const scrollRef = useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  // Double array for seamless infinite looping geometry
  const loopedSections = [...homepageSections, ...homepageSections]

  // Infinite scroll listener logic
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth } = scrollRef.current
    const halfWidth = scrollWidth / 2

    if (scrollLeft >= halfWidth) {
      scrollRef.current.scrollLeft = scrollLeft - halfWidth
    } else if (scrollLeft <= 0) {
      scrollRef.current.scrollLeft = scrollLeft + halfWidth
    }
  }

  // Corner arrow click controls
  const scrollBy = (direction) => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -350 : 350
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  // Mouse drag events
  const handleMouseDown = (e) => {
    setIsMouseDown(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown) return
    e.preventDefault()
    setHasDragged(true)
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // Set initial scroll offset
  useEffect(() => {
    if (scrollRef.current) {
      const halfWidth = scrollRef.current.scrollWidth / 2
      scrollRef.current.scrollLeft = halfWidth / 2
    }
  }, [])

  return (
    <div className="w-full bg-[#FFFFFF]">
      {/* 1. CIRCULAR INTERACTIVE CAROUSEL */}
      <section className="relative w-full bg-white py-12 px-6 md:px-12 border-b border-black/10 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Our Collections
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Explore our curated lines of premium fragrances and essential scents.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-black w-10 h-10 md:w-12 md:h-12 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:translate-x-0 transition-transform duration-150 flex items-center justify-center font-bold text-lg"
            aria-label="Scroll Left"
          >
            &#8592;
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollBy('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-black w-10 h-10 md:w-12 md:h-12 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:translate-x-0 transition-transform duration-150 flex items-center justify-center font-bold text-lg"
            aria-label="Scroll Right"
          >
            &#8594;
          </button>

          {/* Draggable Row */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
            className={`flex items-center gap-8 md:gap-12 overflow-x-auto py-4 px-2 ${
              isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loopedSections.map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={item.viewAllLink}
                onClick={(e) => {
                  if (hasDragged) e.preventDefault()
                }}
                className="group/item flex flex-col items-center shrink-0"
              >
                {/* Large Circular Avatar */}
                <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full border-2 border-black p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-transform duration-200 group-hover/item:scale-105 group-hover/item:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <img
                    src={item.image || 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web7.jpeg'}
                    alt={item.heading}
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                  />
                </div>
                {/* Title */}
                <span className="mt-4 text-sm sm:text-base font-bold text-gray-900 tracking-wide text-center group-hover/item:underline">
                  {item.heading}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Scent Oil Diffusers Section */}
      {(() => {
        const s = getSection('scent-oil-diffusers')
        return s && (
          <CollectionSection
            heading={s.heading}
            subheading={s.subheading}
            collectionName={s.collectionId}
            viewAllLink={s.viewAllLink}
          />
        )
      })()}
     

      {/* 3. "The Ritual" Section */}
      <section className="w-full bg-[#F9CD97] py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="md:col-span-5 relative w-full aspect-4/3 sm:aspect-square md:aspect-auto md:h-[520px] rounded-none overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web7.jpeg'}
              alt="Car Diffuser Instructions - The Ritual"
              className="w-full h-full object-contain md:object-cover object-center bg-[#F8F6F0]"
            />
          </div>
          <div className="md:col-span-7 space-y-6 text-gray-900">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-normal tracking-tight text-gray-900 mb-4">
                THE EXPREINCE
              </h2>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed max-w-2xl">
                Experience up to 50+ days of continuous, premium fragrance in your car, home, or office by following these simple setup steps for our oil diffusers.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900">Remove & Prepare</h3>
                <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
                  First, remove the wooden cap from the diffuser. Inside, you will find a plastic cork covering the bottle opening. Remove this plastic cork completely.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900">Invert to Absorb</h3>
                <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
                  Put the wooden cap back on securely. Invert the bottle upside down for 3-5 seconds to allow the scent oil to absorb into the wooden lid.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg text-gray-900">Hang & Enjoy</h3>
                <p className="text-xs md:text-sm text-gray-800 leading-relaxed">
                  Hang the diffuser onto your rearview mirror or anywhere else. Tip the bottle upside down once a day to ensure a continuous pleasant fragrance.
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm italic text-gray-800 pt-2 border-t border-black/10 leading-relaxed">
              <span className="font-semibold not-italic">Precaution:</span> We use high-quality scent oils. If the oil accidentally spills onto plastic or colorful surfaces, immediately clean the area to prevent damage. Keep out of the reach of children.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Premium Air Fresheners Section */}
      {(() => {
        const s = getSection('air-fresheners')
        return s && (
          <CollectionSection
            heading={s.heading}
            subheading={s.subheading}
            collectionName={s.collectionId}
            viewAllLink={s.viewAllLink}
            limit={4}
          />
        )
      })()}

      {/* 5. Bundles Section */}
      {(() => {
        const s = getSection('bundles')
        return s && (
          <CollectionSection
            heading={s.heading}
            subheading={s.subheading}
            collectionName={s.collectionId}
            viewAllLink={s.viewAllLink}
            limit={4}
          />
        )
      })()}

      {/* MARQUEE CAROUSEL BANNER */}
      <div className="w-full bg-[#E8C18C] py-3.5 border-y border-black/10 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {[...marqueeItems1, ...marqueeItems1].map((text, i) => (
            <div key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-gray-900 uppercase">
                {text}
              </span>
              <span className="text-xs text-gray-700">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Modern Aesthetic & Practical Purpose Section */}
      <section className="w-full bg-[#F3DEB3] py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="md:col-span-5 relative w-full aspect-4/3 sm:aspect-square md:aspect-auto md:h-full min-h-[300px] md:min-h-[520px] rounded-none overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web6.jpeg'}
              alt="HappyHangs Atmosphere"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:col-span-7 bg-[#F3DEB3] h-auto md:h-full p-6 sm:p-8 md:p-10 rounded-none flex flex-col justify-between">
            <div className="space-y-4 mb-6 md:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-snug">
                Modern Aesthetic, Practical Purpose
              </h2>
              <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                HappyHangs positions itself as an accessible lifestyle brand providing high-quality fragrance solutions that combine utility with a modern aesthetic, targeting car owners and home decorators seeking long-lasting scent experiences.
              </p>
              <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                Our products feature high-quality oils and aesthetic packaging designed to provide long-lasting fragrances and redefine the atmosphere of any personal space.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              {['Premium Quality', 'Atmospheric Enhancement', 'Longevity'].map((item, idx) => (
                <div
                  key={idx}
                  className="interactive-hover p-3 sm:p-4 bg-white border-2 border-black rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <p className="font-bold text-sm sm:text-base md:text-lg text-gray-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Balls Section (Mapped to ID 'Balls' from sectionsConfig) */}
      {(() => {
        const s = getSection('Balls')
        return s && (
          <CollectionSection
            heading={s.heading}
            subheading={s.subheading}
            collectionName={s.collectionId}
            viewAllLink={s.viewAllLink}
            limit={4}
          />
        )
      })()}

      {/* 8. Refills Section */}
      {(() => {
        const s = getSection('refills')
        return s && (
          <CollectionSection
            heading={s.heading}
            subheading={s.subheading}
            collectionName={s.collectionId}
            viewAllLink={s.viewAllLink}
            limit={4}
          />
        )
      })()}

      {/* 9. An Aura of Calm Section */}
      <section className="w-full bg-[#F3DEB3] py-16 md:py-20 px-6 md:px-12 border-t border-[#E8E0D0]">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs tracking-[0.25em] text-gray-400 uppercase font-medium">OUR PHILOSOPHY</span>
          <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mt-2 mb-4">An Aura of Calm</h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed">
            We bridge the gap between functional utility and aesthetic identity, bringing premium simplicity to your daily drive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {philosophyItems.map((item, index) => (
              <div
                key={index}
                className="bg-[#F8F6F0] p-8 rounded-2xl flex flex-col justify-center items-center text-center transition-all duration-300 ease-out transform hover:-translate-y-2 hover:shadow-xl hover:bg-[#F2EBDC] cursor-pointer group border border-amber-200/40 hover:border-amber-300/60"
              >
                <h3 className="text-xl font-serif text-gray-800 mb-3 group-hover:text-black transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Frequently Asked Questions Section */}
      <FaqSection />

      {/* 11. Customer Reviews Section */}
      <CustomerReviewsSection />
    </div>
  )
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState(null)
  return (
    <section className="w-full bg-[#FFFFFF] py-16 md:py-24 px-6 md:px-12 border-t border-black/10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.25em] text-gray-700 uppercase font-bold">
            GOT QUESTIONS?
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#112330] mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className="border-b border-black/15 transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
                >
                  <span className="text-lg md:text-xl font-bold text-[#112330] group-hover:text-amber-900 transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-2xl font-bold text-[#112330] ml-4 shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 text-sm md:text-base text-gray-800 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
  
export function CustomerReviewsSection() {
const [isModalOpen, setIsModalOpen] = useState(false)

  // Duplicating array for a seamless infinite loop
  const scrollReviews = [...DEMO_REVIEWS, ...DEMO_REVIEWS]

  return (
    <div className="w-full bg-[#ffe0ae] py-16 px-4 font-sans text-black overflow-hidden select-none">
      
      {/* SECTION HEADER & OVERALL STAR RATING */}
      <div className="max-w-4xl mx-auto text-center mb-12 space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Great Minds Think Alike
        </h2>
        
        {/* Main Star Rating Bar */}
        <div className="flex justify-center items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
          ))}
        </div>
        
       

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-black text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Write A Review
          </button>
        </div>
      </div>

      {/* INFINITE MARQUEE CAROUSEL */}
      <div className="relative w-full overflow-hidden group py-4">
        <div className="flex gap-20 animate-marquee hover:[animation-play-state:paused] w-max">
          {scrollReviews.map((review, idx) => (
            <div
              key={`${review.id}-${idx}`}
              className="w-[300px] sm:w-[320px] bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between text-center flex-shrink-0"
            >
              <div>
                {/* Star Rating Header */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < (review.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Headline */}
                <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1">
                  {review.title || review.headline}
                </h3>

                {/* Review Details */}
                <p className="text-gray-600 text-sm mb-6 min-h-[48px] leading-relaxed line-clamp-3 font-normal">
                  {review.comment || review.review}
                </p>

                {/* Author Info */}
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <p className="text-xs tracking-wider uppercase font-extrabold text-gray-400">
                    {review.name || review.author}
                  </p>
                </div>
              </div>

             
            </div>
          ))}
        </div>
      </div>

      {/* WRITE A REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black uppercase tracking-tight">Write a Customer Review</h3>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Share your experience with HappyHangs scent products.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Your Name</label>
                <input type="text" required placeholder="e.g. Ali Ahmed" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Rating</label>
                <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium bg-white focus:outline-none focus:border-black">
                  <option value="5">⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                  <option value="3">⭐⭐⭐ (3/5 Average)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Review Headline</label>
                <input type="text" required placeholder="e.g. Amazing long-lasting aroma!" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Review Details</label>
                <textarea rows="3" required placeholder="Tell us about the scent strength, packaging, delivery..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-black"></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white font-bold text-sm uppercase py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}