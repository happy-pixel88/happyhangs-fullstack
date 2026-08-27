// src/hooks/useMedusaProducts.js
import { useState, useEffect } from 'react'
import { medusaClient } from '../config/apiConfig'

export function useMedusaProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const serializedParams = JSON.stringify(params)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    async function fetchProducts() {
      try {
        const queryParams = JSON.parse(serializedParams)
        const { currency_code, region_id: paramRegionId, ...restParams } = queryParams

        let regionId = paramRegionId
        if (!regionId) {
          const { regions } = await medusaClient.store.region.list()
          const pkrRegion = regions?.find((r) => r.currency_code?.toLowerCase() === 'pkr')
          regionId = pkrRegion?.id || regions?.[0]?.id
        }

        const { products } = await medusaClient.store.product.list({
          region_id: regionId,
          fields: '*variants,*variants.calculated_price,*variants.prices,*images,*categories',
          ...restParams,
        })

        if (isMounted) {
          setProducts(products || [])
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching Medusa products:', err)
          setError(err)
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [serializedParams])

  return { products, loading, error }
}