import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#fdbc71] text-[#1c2a2b] pt-16 pb-10 px-6 lg:px-20 border-t border-[#e2d7c9]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
        
        {/* Left Column: Logo, Description & Social Icons */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <h2 className="text-3xl font-serif tracking-widest font-bold uppercase text-[#1c2a2b]">
              HAPPYHANGS
            </h2>
            <p className="text-[10px] tracking-[0.3em] font-light text-[#5c6869] uppercase mt-1">
              PREMIUM CAR SCENTS & DIFFUSERS
            </p>
          </div>

          <p className="text-sm font-serif leading-relaxed text-[#4a5758] max-w-md">
            At HappyHangs, every scent holds a story. We bring you handcrafted, long-lasting fragrances designed to transform your drive into an extraordinary sensory experience.
          </p>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-3 pt-2">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/19GTfn2tN9/?mibextid=wwXIfr" // REPLACE WITH YOUR FACEBOOK LINK
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#1c2a2b] text-[#f2ece4] flex items-center justify-center hover:bg-amber-800 transition-colors duration-200"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/happyhangs_?igsi=MWZrczh3cDNibTU1dA%3D%3D&utm_source=qr" // REPLACE WITH YOUR INSTAGRAM LINK
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#1c2a2b] text-[#f2ece4] flex items-center justify-center hover:bg-amber-800 transition-colors duration-200"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Center Column: Navigation Links */}
        <div className="md:col-span-3 space-y-3">
          <ul className="space-y-3 text-sm font-serif text-[#1c2a2b]">
            <li>
              <Link to="/" className="hover:underline underline-offset-4 transition">Home</Link>
            </li>
            
            
            <li>
              <Link to="/contact" className="hover:underline underline-offset-4 transition">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Right Column: Policies */}
      {/* Right Column: Policies */}
<div className="md:col-span-3 space-y-3">
  <ul className="space-y-3 text-sm font-serif text-[#1c2a2b]">
    <li>
      <Link to="/policies/privacy" className="hover:underline underline-offset-4 transition">
        Privacy Policy
      </Link>
    </li>
    <li>
      <Link to="/policies/refund" className="hover:underline underline-offset-4 transition">
        Refund & Return Policy
      </Link>
    </li>
    <li>
      <Link to="/policies/terms" className="hover:underline underline-offset-4 transition">
        Terms of Service
      </Link>
      
    </li>
    <li><Link to="/policies/shipping" className="hover:underline underline-offset-4 transition">
        Shipping
      </Link></li>
      <li><Link to="/policies/contactinformation" className="hover:underline underline-offset-4 transition">
        Contact Information
      </Link></li>
      <li><Link to="/policies/legal" className="hover:underline underline-offset-4 transition">
        Legal
      </Link></li>
    <li className="pt-2 text-xs font-serif text-[#5c6869]">
      — HappyHangs
    </li>
  </ul>
</div>
      </div>

      {/* Bottom Bar & Scroll to Top Button */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#dfd3c3] flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-[#5c6869] gap-4">
        <div>
          Copyright © 2026 HappyHangs. All rights reserved.
        </div>

        {/* Scroll To Top Circle Button */}
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full border border-[#1c2a2b] flex items-center justify-center text-[#1c2a2b] hover:bg-[#1c2a2b] hover:text-[#f2ece4] transition-all duration-200"
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>
      </div>
    </footer>
  )
}