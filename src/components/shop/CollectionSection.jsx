import React from 'react'
import { Link } from 'react-router-dom'
import { useProductsByCollection } from '../../hooks/useProductsByCollection'
import ProductGrid from './ProductGrid'

// Card skeleton matching the neobrutalist border & shadow design
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border-2 border-black/20 p-3 bg-gray-50/50 animate-pulse flex flex-col justify-between"
        >
          <div className="w-full aspect-square bg-gray-200/80 mb-3 rounded-none" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200/80 w-3/4 rounded-none" />
            <div className="h-3 bg-gray-200/60 w-1/2 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CollectionSection({ heading, subheading, collectionName, viewAllLink }) {
  const { products, loading, error } = useProductsByCollection(collectionName)

  // Display skeleton placeholders matching screen grid instead of generic spinner
  if (loading) {
    return (
      <section className="w-full py-8 md:py-16 px-4 md:px-12 bg-[#FFFFFF] border-b border-black/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-2">
            <div>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900">{heading}</h2>
              {subheading && <p className="text-xs md:text-base text-gray-700 mt-1">{subheading}</p>}
            </div>
          </div>
          <ProductGridSkeleton />
        </div>
      </section>
    )
  }

  // Render nothing if collection/products do not exist on Medusa yet
  if (error || !products || products.length === 0) return null

  // 1. Check if this section is for Scent Oil Diffusers
  const isDiffuserSection = heading?.toLowerCase().includes('diffuser')

  let processedProducts = [...products]

  if (isDiffuserSection) {
    const targetScents = ['oud', 'sakura', 'lavender', 'rose']

    // Filter to only include products matching Oud, Sakura, Lavender, or Rose
    const filtered = products.filter((p) => {
      const title = (p.title || p.name || '').toLowerCase()
      return targetScents.some((scent) => title.includes(scent))
    })

    // Sort to match exact sequence: Oud -> Sakura -> Lavender -> Rose
    filtered.sort((a, b) => {
      const aTitle = (a.title || a.name || '').toLowerCase()
      return targetScents.findIndex((s) => aTitle.includes(s)) - targetScents.findIndex((s) => (b.title || b.name || '').toLowerCase().includes(s))
    })

    processedProducts = filtered.slice(0, 4)
  } else {
    // Limit other sections to top 4 cards for a clean grid layout
    processedProducts = processedProducts.slice(0, 4)
  }

  // If filtering resulted in no matching items, hide section
  if (processedProducts.length === 0) return null

  return (
    <section className="w-full py-8 md:py-16 px-4 md:px-12 bg-[#FFFFFF] border-b border-black/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3">
          <div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900">{heading}</h2>
            {subheading && <p className="text-xs md:text-base text-gray-700 mt-1">{subheading}</p>}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-xs md:text-sm font-bold tracking-wider uppercase text-gray-900 hover:underline underline-offset-4 self-start md:self-auto"
            >
              View All &rarr;
            </Link>
          )}
        </div>

        <ProductGrid products={processedProducts} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full" />
      </div>
    </section>
  )
}