import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/shop/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useMedusaProducts } from '../hooks/useMedusaProducts'
import { homepageSections } from '../config/sectionsConfig'

export default function CatalogPage() {
  const [selectedSort, setSelectedSort] = useState('created_at')

  // 1. Read both URL Params (:handle) and Query Params (?collection=...)
  const { handle } = useParams()
  const [searchParams] = useSearchParams()

  // 2. Resolve collection ID from sectionsConfig handle or direct query param
  let collectionId = searchParams.get('collection')

  if (!collectionId && handle) {
    const matchedSection = homepageSections.find((s) => {
      const sectionHandle = s?.handle || s?.title?.toLowerCase().replace(/\s+/g, '-')
      return sectionHandle === handle
    })
    collectionId = matchedSection?.collectionId || matchedSection?.filter?.collection_id
  }

  // 3. Fetch products using the resolved collection ID
  const { products, loading, error } = useMedusaProducts({
    limit: 200,
    currency_code: 'pkr',
    ...(collectionId && collectionId !== 'all' ? { collection_id: [collectionId] } : {}),
  })

  const sortedProducts = [...(products || [])].sort((a, b) => {
    if (selectedSort === 'price_asc') {
      const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      return priceA - priceB
    }
    if (selectedSort === 'price_desc') {
      const priceA = a.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      const priceB = b.variants?.[0]?.calculated_price?.calculated_amount ?? 0
      return priceB - priceA
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="border-4 border-black bg-[#F9CD97] p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-black mb-2">
          Catalog & Shop
        </h1>
        <p className="text-black font-medium">
          Explore our full range of portable repellent devices, refills, and scented bundles.
        </p>
      </div>

      {/* Toolbar / Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-bold uppercase text-sm">
          Showing {sortedProducts.length} Products
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="font-bold text-sm uppercase">
            Sort By:
          </label>
          <select
            id="sort"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="border-2 border-black p-2 font-bold bg-white cursor-pointer focus:outline-none"
          >
            <option value="created_at">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="border-4 border-black bg-red-100 p-6 text-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Failed to load products. Please refresh or try again later.
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="border-4 border-black bg-white p-12 text-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          No products available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}