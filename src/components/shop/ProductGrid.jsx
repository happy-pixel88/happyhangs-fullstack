import React from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products = [], className }) {
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-12 text-center text-gray-600">
        <p className="text-sm md:text-base">No products available in this collection yet.</p>
      </div>
    )
  }

  return (
    <div className={className || "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full"}>
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  )
}