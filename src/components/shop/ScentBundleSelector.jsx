import React, { useState, useEffect } from 'react'
import { BUNDLE_CONFIGS } from '../../config/bundleConfig' // Adjust path if needed

export default function ScentBundleSelector({ product, allProducts = [], onBundleChange }) {
  const [packCount, setPackCount] = useState(1)

  const titleLower = product?.title?.toLowerCase() || ''
  const handleLower = product?.handle?.toLowerCase() || ''
  const collectionHandle = product?.collection?.handle?.toLowerCase() || ''
  const collectionTitle = product?.collection?.title?.toLowerCase() || ''

  // 1. Dynamic Check: Item belongs to Bundles collection
  const isBundleCollection =
    collectionHandle === 'bundles' ||
    collectionTitle.includes('bundle') ||
    handleLower.includes('buy-more-save-more') ||
    handleLower.includes('bachat') ||
    titleLower.includes('bundle')

  // Load custom bundle slot configuration if present
  const activeBundleConfig = BUNDLE_CONFIGS?.[product?.handle]

  // Parse scent count dynamically from product title (e.g. "Bundle of 4" -> 4) or fall back to config slot length
  const extractedCount = titleLower.match(/\d+/)
  const bundleScentCount =
    activeBundleConfig?.slots?.length || (extractedCount ? parseInt(extractedCount[0], 10) : 4)

  const isStandardDiffuser =
    (titleLower.includes('diffuser') || product?.type?.toLowerCase()?.includes('diffuser')) &&
    !isBundleCollection

  // 2. Filter ALL eligible products for bundle selection
  const selectableProducts = (allProducts || []).filter((p) => {
    const pTitle = p?.title?.toLowerCase() || ''
    const pHandle = p?.handle?.toLowerCase() || ''
    const pType = p?.type?.toLowerCase() || ''
    const pCollection = p?.collection?.handle?.toLowerCase() || ''

    const isBundleProduct =
      pHandle.includes('bundle') ||
      pTitle.includes('bundle') ||
      pCollection === 'bundles'

    // If strictly checking standard diffuser options, ensure only diffuser products are picked
    if (isStandardDiffuser) {
      const isDiffuser = pTitle.includes('diffuser') || pType.includes('diffuser')
      return !isBundleProduct && isDiffuser
    }

    return !isBundleProduct
  })

  // Helper function: Filter products by collection ID if specified in bundle config slot
  const getProductsForSlot = (targetCollectionId) => {
    if (!targetCollectionId) return selectableProducts

    const filtered = selectableProducts.filter(
      (p) => p.collection_id === targetCollectionId || p.collection?.id === targetCollectionId
    )

    return filtered.length > 0 ? filtered : selectableProducts
  }

  // 3. Fallback default item selection
  const defaultItemTitle = selectableProducts[0]?.title || ''

  const [selectedScents, setSelectedScents] = useState({
    'Scent 1': defaultItemTitle,
    'Scent 2': defaultItemTitle,
    'Scent 3': defaultItemTitle,
    'Scent 4': defaultItemTitle,
    'Scent 5': defaultItemTitle,
  })

  // 4. Initialize/sync selected options when single products finish loading
  useEffect(() => {
    if (selectableProducts.length > 0) {
      setSelectedScents((prev) => {
        const updated = { ...prev }
        for (let i = 1; i <= 5; i++) {
          const key = `Scent ${i}`
          const slotConfig = activeBundleConfig?.slots?.[i - 1]
          const availableForSlot = getProductsForSlot(slotConfig?.collectionId)
          const firstValidTitle = availableForSlot[0]?.title || defaultItemTitle

          if (!updated[key] || updated[key].toLowerCase().includes('bundle')) {
            updated[key] = firstValidTitle
          }
        }
        return updated
      })
    }
  }, [allProducts, product?.handle])

  const getProductPrice = (prod) => {
    if (!prod) return 0
    const variant = prod.variants?.[0]
    const priceAmount =
      variant?.calculated_price?.calculated_amount ??
      variant?.prices?.[0]?.amount ??
      prod.price ??
      0
    return Number(priceAmount)
  }

  const basePrice = getProductPrice(product)
  const price2Pack = Math.round(basePrice * 2 * 0.9)
  const compare2Pack = basePrice * 2
  const price3Pack = Math.round(basePrice * 3 * 0.85)
  const compare3Pack = basePrice * 3

  useEffect(() => {
    if (!onBundleChange) return

    if (isBundleCollection) {
      const activeScents = {}
      const scentList = []

      for (let i = 1; i <= bundleScentCount; i++) {
        const slotConfig = activeBundleConfig?.slots?.[i - 1]
        const availableForSlot = getProductsForSlot(slotConfig?.collectionId)
        const scentVal = selectedScents[`Scent ${i}`] || availableForSlot[0]?.title || ''

        activeScents[`Scent ${i}`] = scentVal
        if (scentVal) scentList.push(scentVal)
      }

      onBundleChange({
        packCount: bundleScentCount,
        scents: activeScents,
        formattedString: scentList.join(', '),
        totalPrice: basePrice,
        bundleType: 'fixed',
      })
    } else if (isStandardDiffuser) {
      const activeScents = {}
      const scentList = [product?.title || '']

      activeScents['Scent 1'] = product?.title || ''

      for (let i = 2; i <= packCount; i++) {
        const scentVal = selectedScents[`Scent ${i}`] || product?.title || ''
        activeScents[`Scent ${i}`] = scentVal
        if (scentVal) scentList.push(scentVal)
      }

      const price = packCount === 1 ? basePrice : packCount === 2 ? price2Pack : price3Pack

      onBundleChange({
        packCount,
        scents: activeScents,
        formattedString: scentList.join(', '),
        totalPrice: price,
        bundleType: 'split',
      })
    }
  }, [
    packCount,
    selectedScents,
    product,
    isBundleCollection,
    bundleScentCount,
    isStandardDiffuser,
    basePrice,
    price2Pack,
    price3Pack,
  ])

  const handleScentChange = (key, value) => {
    setSelectedScents((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // FIXED BUNDLE VIEW
  if (isBundleCollection) {
    return (
      <div className="my-6 space-y-4">
        {Array.from({ length: bundleScentCount }).map((_, idx) => {
          const num = idx + 1
          const scentKey = `Scent ${num}`

          const slotConfig = activeBundleConfig?.slots?.[idx]
          const labelText = slotConfig?.label || `Select Item ${num}`
          const availableItems = getProductsForSlot(slotConfig?.collectionId)

          return (
            <div key={scentKey} className="flex flex-col">
              <label className="text-sm font-medium mb-1">
                {labelText} <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedScents[scentKey] || ''}
                onChange={(e) => handleScentChange(scentKey, e.target.value)}
                className="w-full p-3 border border-black rounded-sm bg-white text-sm outline-none cursor-pointer focus:ring-1 focus:ring-black"
              >
                {availableItems.map((item) => (
                  <option key={item.id || item.handle || item.title} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    )
  }

  // STANDARD SINGLE DIFFUSER OFFER PACK VIEW (Pack of 2 / Pack of 3)
  if (isStandardDiffuser) {
    return (
      <div className="my-6">
        <div className="text-xs font-bold uppercase tracking-wider mb-2">Select Offer Pack</div>
        <div className="flex flex-col gap-2.5 mb-4">
          <div
            onClick={() => setPackCount(1)}
            className={`border rounded-md p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              packCount === 1 ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input type="radio" name="bundle_selection" checked={packCount === 1} readOnly className="accent-black" />
              <span className="text-sm font-semibold">1 Pack (Standard)</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold">PKR {basePrice.toLocaleString()}</span>
            </div>
          </div>

          <div
            onClick={() => setPackCount(2)}
            className={`border rounded-md p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              packCount === 2 ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input type="radio" name="bundle_selection" checked={packCount === 2} readOnly className="accent-black" />
              <span className="text-sm font-semibold">Pack of 2</span>
              <span className="bg-black text-white text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">10% OFF</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 line-through mr-1">PKR {compare2Pack.toLocaleString()}</span>
              <span className="text-sm font-bold">PKR {price2Pack.toLocaleString()}</span>
            </div>
          </div>

          <div
            onClick={() => setPackCount(3)}
            className={`border rounded-md p-3.5 flex items-center justify-between cursor-pointer transition-all ${
              packCount === 3 ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input type="radio" name="bundle_selection" checked={packCount === 3} readOnly className="accent-black" />
              <span className="text-sm font-semibold">Pack of 3</span>
              <span className="bg-black text-white text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">15% OFF</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 line-through mr-1">PKR {compare3Pack.toLocaleString()}</span>
              <span className="text-sm font-bold">PKR {price3Pack.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {packCount >= 2 && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Scent 1</label>
              <select disabled className="w-full p-2.5 text-xs border border-gray-300 rounded bg-gray-100 cursor-not-allowed">
                <option>{product?.title} (Current)</option>
              </select>
            </div>

            {Array.from({ length: packCount - 1 }).map((_, idx) => {
              const num = idx + 2
              const scentKey = `Scent ${num}`
              return (
                <div key={scentKey} className="flex flex-col">
                  <label className="text-xs font-medium mb-1">Choose Scent {num}</label>
                  <select
                    value={selectedScents[scentKey] || product?.title || ''}
                    onChange={(e) => handleScentChange(scentKey, e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-300 rounded bg-white outline-none"
                  >
                    {selectableProducts.map((scent) => (
                      <option key={scent.id || scent.handle || scent.title} value={scent.title}>
                        {scent.title}
                      </option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return null
}