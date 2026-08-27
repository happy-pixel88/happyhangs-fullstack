import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header({ categories = [], cartCount = 0 }) {
  const [isHomeHovered, setIsHomeHovered] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="relative bg-[#fffdfa] border-b border-gray-100 px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between text-sm z-40">
      
      {/* Mobile Hamburger Icon (Visible on small screens) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden text-neutral-800 p-1 focus:outline-none"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-6">
        {/* Home Hover Dropdown */}
        <div
          className="relative py-2"
          onMouseEnter={() => setIsHomeHovered(true)}
          onMouseLeave={() => setIsHomeHovered(false)}
        >
          <Link to="/" className="font-medium text-gray-800 hover:text-amber-700 transition">
            Home
          </Link>

          {isHomeHovered && categories && categories.length > 0 && (
            <div className="absolute top-full left-0 bg-white shadow-lg rounded-md py-3 w-52 border border-gray-100 flex flex-col space-y-2 px-4 z-50">
              {categories.map((cat, idx) => {
                const label = cat?.name || cat?.title || 'Collection'
                const targetPath = cat?.path || (cat?.handle ? `/catalog?collection=${cat.handle}` : '/catalog')

                return (
                  <Link
                    key={cat?.id || idx}
                    to={targetPath}
                    className="text-gray-700 hover:text-black hover:font-medium transition text-xs tracking-wide"
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <Link to="/catalog" className="font-medium text-gray-800 hover:text-amber-700 transition">
          Catalog
        </Link>
        <Link to="/contact" className="font-medium text-gray-800 hover:text-amber-700 transition">
          Contact
        </Link>
      </nav>

      {/* Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
        <Link to="/">HappyHangs</Link>
      </div>

      {/* Cart Button */}
      <div className="flex items-center space-x-4">
        <Link
          to="/cart"
          className="group flex items-center gap-2 bg-neutral-900 text-white px-3.5 py-1.5 rounded-full hover:bg-amber-700 transition-all duration-200 shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-4 h-4 transition-transform group-hover:scale-110"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.25 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M12 10.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"
            />
          </svg>
          <span className="text-xs font-semibold tracking-wide">Cart</span>
          {cartCount > 0 && (
            <span className="bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative bg-[#fffdfa] w-4/5 max-w-xs h-full shadow-xl p-6 flex flex-col justify-between z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="font-bold text-lg text-neutral-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-600 p-1"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="mt-6 flex flex-col space-y-4 font-medium text-gray-800">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">
                  Home
                </Link>

                {/* Render categories directly in mobile menu */}
                {categories && categories.length > 0 && (
                  <div className="pl-3 flex flex-col space-y-2 border-l border-amber-200">
                    {categories.map((cat, idx) => {
                      const label = cat?.name || cat?.title || 'Collection'
                      const targetPath = cat?.path || (cat?.handle ? `/catalog?collection=${cat.handle}` : '/catalog')

                      return (
                        <Link
                          key={cat?.id || idx}
                          to={targetPath}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-xs text-gray-600 hover:text-amber-700"
                        >
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                )}

                <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">
                  Catalog
                </Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-700">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}