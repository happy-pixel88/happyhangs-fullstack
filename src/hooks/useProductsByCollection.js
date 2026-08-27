//useProductsByCollection.js
import useSWR from 'swr'
import { medusaClient } from '../config/apiConfig'

const fetchRegion = async () => {
  const { regions } = await medusaClient.store.region.list()
  const pkrRegion = regions?.find((r) => r.currency_code?.toLowerCase() === 'pkr')
  return pkrRegion?.id || regions?.[0]?.id || null
}
const fetchCollections = async () => {
  const { collections } = await medusaClient.store.collection.list({
    fields: 'id,title',
  })
  return collections || []
}

// Updated product fetcher to handle 'all'
const fetchProducts = async (resolvedId, regionId, limit, isAll) => {
  const params = {
    limit,
    fields: '*variants,*variants.calculated_price,*images',
  }

  // Only attach collection filter if not requesting 'all'
  if (!isAll && resolvedId) {
    params.collection_id = [resolvedId]
  }

  if (regionId) {
    params.region_id = regionId
  }

  const { products } = await medusaClient.store.product.list(params)
  return products || []
}

export function useProductsByCollection(collectionIdentifier, limit = 8) {
  const isAll = collectionIdentifier?.toLowerCase() === 'all'

  // A. Fetch & Cache Default Region
  const { data: regionId } = useSWR('medusa-default-region', fetchRegion, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  })

  // B. Fetch Collections List (skip if requesting 'all' or direct ID)
  const isDirectId =
    collectionIdentifier?.startsWith('pcol_') ||
    collectionIdentifier?.startsWith('col_')

  const shouldFetchCollections = !isAll && !isDirectId

  const {
    data: collections,
    error: collectionsError,
    isLoading: loadingCollections,
  } = useSWR(
    shouldFetchCollections ? 'medusa-collections-list' : null,
    fetchCollections,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000,
    }
  )

  // C. Resolve Collection ID locally
  let resolvedId = null
  if (isAll) {
    resolvedId = 'ALL_PRODUCTS'
  } else if (isDirectId) {
    resolvedId = collectionIdentifier
  } else if (collections && collectionIdentifier) {
    const target = collectionIdentifier.trim().toLowerCase()

    let matchingCol = collections.find(
      (col) => col.title.trim().toLowerCase() === target
    )

    if (!matchingCol) {
      matchingCol = collections.find((col) => {
        const title = col.title.trim().toLowerCase()
        return title.includes(target) || target.includes(title)
      })
    }

    if (matchingCol) {
      resolvedId = matchingCol.id
    } else {
      console.warn(`No collection matched identifier: "${collectionIdentifier}"`)
    }
  }

  // D. Fetch Products
  const shouldFetchProducts = Boolean(resolvedId)
  const {
    data: products,
    error: productsError,
    isLoading: loadingProducts,
  } = useSWR(
    shouldFetchProducts
      ? `collection-products-${resolvedId}-${regionId}-${limit}`
      : null,
    () => fetchProducts(resolvedId, regionId, limit, isAll),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  )

  const loading =
    !collectionIdentifier ||
    (shouldFetchCollections && loadingCollections) ||
    (shouldFetchProducts && loadingProducts)

  const error = collectionsError || productsError

  return {
    products: products || [],
    loading,
    error,
  }
}