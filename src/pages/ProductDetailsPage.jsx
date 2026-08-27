// src/pages/ProductDetailsPage.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { medusaClient } from '../config/apiConfig'
import { useMedusaProducts } from '../hooks/useMedusaProducts'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/shop/ProductCard'
import ScentBundleSelector from '../components/shop/ScentBundleSelector'

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="grid grid-cols-2 gap-4 auto-rows-max">
          <div className="border-2 border-black bg-gray-200 aspect-square shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="border-2 border-black bg-gray-200 aspect-square shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 border-2 border-black w-3/4"></div>
            <div className="h-6 bg-gray-200 border-2 border-black w-1/3"></div>
          </div>

          <hr className="border-t-2 border-black my-1" />

          <div className="space-y-3">
            <div className="h-4 bg-gray-200 w-1/4"></div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 border-2 border-black"></div>
              <div className="h-12 bg-gray-200 border-2 border-black"></div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-4 bg-gray-200 w-1/5"></div>
            <div className="h-10 bg-gray-200 border-2 border-black"></div>
          </div>

          <div className="flex gap-4 pt-2">
            <div className="w-24 h-12 bg-gray-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
            <div className="flex-1 h-12 bg-gray-200 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
          </div>
          <div className="w-full h-12 bg-gray-200 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>
      </div>
    </div>
  )
}

const fetchRegion = async () => {
  const { regions } = await medusaClient.store.region.list()
  const pkrRegion = regions?.find((r) => r.currency_code?.toLowerCase() === 'pkr')
  return pkrRegion?.id || regions?.[0]?.id || null
}

export default function ProductDetailsPage() {
  const { handle } = useParams()
  const navigate = useNavigate()
  // Bundles must go through addItemsBatch (single atomic-feeling call).
  // addToCart is still used for plain, non-bundle products.
  const { addToCart, addItemsBatch } = useCart()

  const [currentProduct, setCurrentProduct] = useState(null)
  const [bundleData, setBundleData] = useState(null)
  const [productLoading, setProductLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: regionId } = useSWR('medusa-default-region', fetchRegion, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  })

  useEffect(() => {
    let isMounted = true

    if (!currentProduct) {
      setProductLoading(true)
    }

    async function fetchSingleProduct() {
      if (!regionId) return

      try {
        const { products } = await medusaClient.store.product.list({
          handle: handle,
          region_id: regionId,
          fields: 'id,title,handle,description,thumbnail,*images,*variants',
        })
        if (isMounted) {
          if (products && products.length > 0) {
            setCurrentProduct(products[0])
          } else {
            setCurrentProduct(null)
          }
          setProductLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching product by handle:', err)
          setProductLoading(false)
        }
      }
    }

    if (handle && regionId) {
      fetchSingleProduct()
    }

    return () => {
      isMounted = false
    }
  }, [handle, regionId])

  const { products: allProducts } = useMedusaProducts({ limit: 100 })

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setSelectedVariantIndex(0)
    setQuantity(1)
    setValidationError('')
  }, [handle])

  const activeVariant = currentProduct?.variants?.[selectedVariantIndex] || currentProduct?.variants?.[0]

  const basePrice =
    activeVariant?.calculated_price?.calculated_amount ??
    activeVariant?.prices?.find((p) => p.currency_code?.toLowerCase() === 'pkr')?.amount ??
    activeVariant?.prices?.[0]?.amount ??
    0

  const currencyCode = activeVariant?.calculated_price?.currency_code?.toUpperCase() || 'PKR'
  const originalPrice = basePrice ? Math.round(basePrice * 1.15) : null

  const requiredScentCount = useMemo(() => {
    if (!activeVariant && !currentProduct) return 1

    const titleToCheck = `${currentProduct?.title || ''} ${activeVariant?.title || ''}`.toLowerCase()

    if (titleToCheck.includes('bundle of 5') || titleToCheck.includes('pack of 5')) return 5
    if (titleToCheck.includes('bundle of 4') || titleToCheck.includes('pack of 4')) return 4
    if (titleToCheck.includes('pack of 3') || titleToCheck.includes('3 pack')) return 3
    if (titleToCheck.includes('pack of 2') || titleToCheck.includes('2 pack')) return 2

    return 1
  }, [activeVariant, currentProduct])

  const isBundleProduct = useMemo(() => {
    const activeScentCount = bundleData?.scents ? Object.keys(bundleData.scents).length : 0
    const packCount = bundleData?.packCount || 1

    return (
      requiredScentCount > 1 ||
      activeScentCount > 1 ||
      packCount > 1
    )
  }, [requiredScentCount, bundleData])

  // Resolve a scent's display title to its own product + purchasable variant.
  const resolveVariantForScent = (scentTitle) => {
    if (!scentTitle) return null

    if (scentTitle === currentProduct?.title) {
      return activeVariant
    }

    const matchedProduct = (allProducts || []).find((p) => p.title === scentTitle)
    return matchedProduct?.variants?.[0] || null
  }

  const handleAction = async (redirectPath) => {
    setIsSubmitting(true)
  setValidationError('')

  try {
    const selectedScentsObj = bundleData?.scents || {}
    const activeScents = Object.values(selectedScentsObj).filter(Boolean)

    if (isBundleProduct) {
      if (activeScents.length < requiredScentCount) {
        setValidationError(`Please select all ${requiredScentCount} scents before proceeding.`)
        return
      }

      // Check if this product is a fixed-price bundle (e.g., Bundle of 4, Bundle of 5, or anything in the Bundles collection)
      const isFixedBundleProduct =
        bundleData?.bundleType === 'fixed' ||
        currentProduct?.collection?.handle?.toLowerCase() === 'bundles' ||
        currentProduct?.collection?.title?.toLowerCase()?.includes('bundle') ||
        currentProduct?.handle?.toLowerCase()?.includes('bundle') ||
        currentProduct?.title?.toLowerCase()?.includes('bundle')

      if (isFixedBundleProduct) {
        // ---------------------------------------------------------------------
        // FIXED BUNDLE FLOW
        // Add as ONE line item using the main product's Medusa variant & fixed price.
        // Scents are attached as fulfillment metadata.
        // ---------------------------------------------------------------------
        await addToCart({
          variantId: activeVariant.id,
          quantity: 1,
          metadata: {
            pack_type: `Bundle of ${activeScents.length}`,
            selected_scents: activeScents.join(', '),
            bundle_price: activeVariant?.calculated_price?.calculated_amount || activeVariant?.prices?.[0]?.amount || currentProduct?.price || 0,
          },
        })
      } else {
        // ---------------------------------------------------------------------
        // DYNAMIC PACK FLOW (Pack of 2 / Pack of 3)
        // Resolves every scent to a real variant BEFORE touching the cart at all.
        // ---------------------------------------------------------------------
        const bundleGroupId = `bundle_${currentProduct.id}_${Date.now()}`
        const packLabel = `Pack of ${activeScents.length}`

        const itemsToAdd = activeScents.map((scentTitle) => {
          const matchedVariant = resolveVariantForScent(scentTitle)
          if (!matchedVariant) {
            throw new Error(`Could not find a purchasable variant for "${scentTitle}".`)
          }
          return {
            variantId: matchedVariant.id,
            quantity: 1,
            metadata: {
              bundle_group: bundleGroupId,
              pack_type: packLabel,
            },
          }
        })

        await addItemsBatch(itemsToAdd)
      }
    } else {
      // ---------------------------------------------------------------------
      // STANDARD SINGLE ITEM FLOW
      // ---------------------------------------------------------------------
      await addToCart({
        variantId: activeVariant.id,
        quantity,
        metadata: {
          product_title: currentProduct.title,
          variant_title: activeVariant.title,
        },
      })
    }

    if (redirectPath) {
      navigate(redirectPath)
    }
  } catch (err) {
    console.error('Error executing action:', err)
    setValidationError(err?.message || 'Failed to update cart. Please try again.')
  } finally {
    setIsSubmitting(false)
  }
  }

  const recommendedProducts = useMemo(() => {
    if (!currentProduct || !allProducts) return []

    const currentTitle = currentProduct.title.toLowerCase()
    const otherProducts = allProducts.filter((p) => p.id !== currentProduct.id)

    const isScentProduct = currentTitle.includes('scent') || currentTitle.includes('diffuser')
    const scentKeyWord = currentTitle
      .replace(/scent|oil|diffuser|premium|air|freshener|pack|bundle|\d+/gi, '')
      .trim()

    let matchedRefill = null

    if (isScentProduct && scentKeyWord.length > 2) {
      matchedRefill = otherProducts.find((p) => {
        const title = p.title.toLowerCase()
        return title.includes(scentKeyWord) && title.includes('refill')
      })
    }

    let recommendations = []

    if (matchedRefill) {
      recommendations.push(matchedRefill)
      const remaining = otherProducts.filter((p) => p.id !== matchedRefill.id)
      if (remaining.length > 0) recommendations.push(remaining[0])
    } else {
      recommendations = otherProducts.slice(0, 2)
    }

    return recommendations.slice(0, 2)
  }, [currentProduct, allProducts])

  if (productLoading && !currentProduct) {
    return <ProductSkeleton />
  }

  if (!currentProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link to="/" className="mt-4 inline-block underline font-bold">
          &larr; Back to Home
        </Link>
      </div>
    )
  }

  const images = currentProduct.images?.length
    ? currentProduct.images.map((img) => img.url)
    : [currentProduct.thumbnail || '/images/placeholder.jpeg']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="grid grid-cols-2 gap-4 auto-rows-max">
          {images.map((imgSrc, idx) => (
            <div
              key={idx}
              className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] aspect-square overflow-hidden"
            >
              <img
                src={imgSrc}
                alt={`${currentProduct.title} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
              {currentProduct.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xl font-black text-black">
                {currencyCode} {Math.round(basePrice).toLocaleString('en-PK')}.00
              </span>
              {originalPrice && (
                <span className="text-sm line-through text-gray-500 font-semibold">
                  {currencyCode} {Math.round(originalPrice).toLocaleString('en-PK')}.00
                </span>
              )}
            </div>
          </div>

          <hr className="border-t-2 border-black my-1" />

          {currentProduct.variants?.length > 1 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-black block">
                Select Offer Pack
              </label>
              <div className="space-y-2">
                {currentProduct.variants.map((variant, idx) => {
                  const vPrice =
                    variant?.calculated_price?.calculated_amount ??
                    variant?.prices?.[0]?.amount ??
                    basePrice

                  return (
                    <label
                      key={variant.id}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`flex items-center justify-between p-3 border-2 border-black cursor-pointer transition-all ${
                        selectedVariantIndex === idx
                          ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product-variant"
                          checked={selectedVariantIndex === idx}
                          onChange={() => setSelectedVariantIndex(idx)}
                          className="accent-black"
                        />
                        <span className="font-bold text-sm">{variant.title}</span>
                      </div>
                      <span className="font-bold text-sm">
                        {currencyCode} {Math.round(vPrice).toLocaleString('en-PK')}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {validationError && (
            <p className="text-xs font-bold text-red-600 bg-red-50 p-2 border border-red-600">
              {validationError}
            </p>
          )}

          <ScentBundleSelector
            product={currentProduct}
            allProducts={allProducts}
            onBundleChange={(data) => setBundleData(data)}
          />

          <div className="flex items-center gap-4 pt-2">
            {!isBundleProduct && (
              <div className="flex items-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 font-bold text-lg hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  -
                </button>
                <span className="px-4 py-1 font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 font-bold text-lg hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={() => handleAction('/cart')}
              disabled={isSubmitting}
              className="flex-1 bg-white text-black font-bold py-3 px-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          <button
            onClick={() => handleAction('/checkout')}
            disabled={isSubmitting}
            className="w-full bg-black text-white font-bold py-3 px-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-all text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Buy it now'}
          </button>

          {currentProduct.description && (
            <div className="pt-4 border-t-2 border-black text-sm text-black leading-relaxed font-medium">
              <p>{currentProduct.description}</p>
            </div>
          )}
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-12 pt-6 border-t-2 border-black max-w-xl mx-auto">
          <h2 className="text-base font-bold uppercase tracking-tight mb-4 text-center">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="w-full flex flex-col [&>div]:h-full [&>div]:flex [&>div]:flex-col [&>div]:justify-between">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}