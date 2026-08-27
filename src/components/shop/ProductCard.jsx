import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const primaryVariant = product.variants?.[0]

  const rawAmount =
    primaryVariant?.calculated_price?.calculated_amount ??
    primaryVariant?.prices?.find((p) => p.currency_code?.toLowerCase() === 'pkr')?.amount ??
    primaryVariant?.prices?.[0]?.amount ??
    null

  const currencyCode =
    primaryVariant?.calculated_price?.currency_code?.toUpperCase() || 'PKR'

  // Medusa v2 returns amounts as actual decimal currency values — no unit conversion needed
  const basePrice = rawAmount

  const originalPrice = basePrice
    ? Math.round(basePrice * 1.15)
    : null

  const imageSrc =
    product.thumbnail || product.images?.[0]?.url || '/images/placeholder.jpeg'

  return (
    <div className="group relative bg-white border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="aspect-square w-full overflow-hidden bg-[#F8F6F0] border border-black/10 mb-4 relative">
          <img
            src={imageSrc}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {basePrice && (
            <span className="absolute top-2 right-2 bg-[#F9CD97] text-black text-xs font-bold px-2 py-1 border border-black uppercase tracking-wider z-10">
              Sale
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1 truncate">
          <Link to={`/products/${product.handle}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.title}
          </Link>
        </h3>

        {product.subtitle && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
            {product.subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-sm md:text-base">
            {basePrice
              ? `${currencyCode} ${Math.round(basePrice).toLocaleString('en-PK')}`
              : 'PKR —'}
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              {currencyCode} {Math.round(originalPrice).toLocaleString('en-PK')}
            </span>
          )}
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 group-hover:underline">
          View &rarr;
        </span>
      </div>
    </div>
  )
}