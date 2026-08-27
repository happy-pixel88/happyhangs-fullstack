// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { medusaClient } from '../config/apiConfig'

const CartContext = createContext()

const SALES_CHANNEL_ID = import.meta.env.VITE_MEDUSA_SALES_CHANNEL_ID

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Helper to fetch valid region ID
  const getRegionId = async () => {
    try {
      const { regions } = await medusaClient.store.region.list()
      const pkrRegion = regions?.find((r) => r.currency_code?.toLowerCase() === 'pkr')
      return pkrRegion?.id || regions?.[0]?.id || null
    } catch (err) {
      console.error('Error fetching regions:', err)
      return null
    }
  }

  // Create fresh cart (Medusa v2 compliant body)
  const createFreshCart = async () => {
    const regionId = await getRegionId()

    const payload = {
      ...(regionId && { region_id: regionId }),
      ...(SALES_CHANNEL_ID && { sales_channel_id: SALES_CHANNEL_ID }),
    }

    const { cart: newCart } = await medusaClient.store.cart.create(payload)
    localStorage.setItem('medusa_cart_id', newCart.id)
    setCart(newCart)
    return newCart
  }

  // Restore existing cart or create a new one
  useEffect(() => {
    async function initCart() {
      const existingCartId = localStorage.getItem('medusa_cart_id')

      if (existingCartId) {
        try {
          const { cart: retrievedCart } = await medusaClient.store.cart.retrieve(existingCartId, {
            fields: 'id,completed_at,subtotal,tax_total,shipping_total,discount_total,total,+items.*,+items.variant.*',
          })
          if (retrievedCart && !retrievedCart.completed_at) {
            setCart(retrievedCart)
            setLoading(false)
            return
          }
        } catch (err) {
          console.warn('Invalid or expired cart, recreating...', err)
          localStorage.removeItem('medusa_cart_id')
        }
      }

      try {
        await createFreshCart()
      } catch (err) {
        console.error('Error creating Medusa cart:', err)
      } finally {
        setLoading(false)
      }
    }

    initCart()
  }, [])

  // Add a single line item to Medusa v2 cart with custom metadata
  const addToCart = async ({ variantId, quantity = 1, metadata = {} }) => {
 let activeCartId = cart?.id

  if (!activeCartId) {
    const freshCart = await createFreshCart()
    activeCartId = freshCart.id
  }

  // Ensure scents are cleanly extracted regardless of how the product page passed them
  const rawScents = 
    metadata?.selected_scents || 
    metadata?.all_bundle_scents || 
    metadata?.scents || 
    (Array.isArray(metadata) ? metadata : null)

  const formattedScents = Array.isArray(rawScents)
    ? rawScents.filter(Boolean).join(', ')
    : typeof rawScents === 'string'
    ? rawScents
    : ''

  // Medusa Admin explicitly looks for string values in key-value pairs
  const lineItemMetadata = {
    ...(metadata || {}),
    selected_scents: formattedScents,
    all_bundle_scents: formattedScents,
    pack_type: metadata?.pack_type || 'BUNDLE',
    added_at: new Date().toISOString(),
  }

  try {
    setLoading(true)

    // Medusa Store API line item creation
    const { cart: updatedCart } = await medusaClient.store.cart.createLineItem(activeCartId, {
      variant_id: variantId,
      quantity: Number(quantity),
      metadata: lineItemMetadata,
    })

    setCart(updatedCart)
    setIsDrawerOpen(true)
    return updatedCart
  } catch (err) {
    if (err?.status === 404 || err?.message?.includes('not found')) {
      localStorage.removeItem('medusa_cart_id')
      const freshCart = await createFreshCart()

      const { cart: updatedCart } = await medusaClient.store.cart.createLineItem(freshCart.id, {
        variant_id: variantId,
        quantity: Number(quantity),
        metadata: lineItemMetadata,
      })
      setCart(updatedCart)
      setIsDrawerOpen(true)
      return updatedCart
    } else {
      console.error('Failed to add item to cart:', err)
      alert(err?.message || 'Could not add item to cart.')
      throw err
    }
  } finally {
    setLoading(false)
  }
  }

  // Add several line items (e.g. a multi-scent bundle) as one atomic-feeling
  // operation. This is the piece addToCart alone can't safely do: addToCart
  // reads/writes the `cart` *React state* on every call, so calling it back
  // to back in a loop races itself — each call may still be closing over the
  // cart snapshot from before the previous call's setCart landed, and if the
  // caller navigates away between calls, some may never even fire.
  //
  // Here we resolve the cart ID once, thread the updated cart through plain
  // local variables for every Medusa API call, and only touch React state
  // (setCart, setIsDrawerOpen) a single time at the very end — so partial
  // failures can't leave the UI half-updated, and nothing depends on render
  // timing.
  const addItemsBatch = async (items) => {
    if (!items || items.length === 0) return cart

    let activeCartId = cart?.id
    if (!activeCartId) {
      const freshCart = await createFreshCart()
      activeCartId = freshCart.id
    }

    setLoading(true)
    try {
      let latestCart = null

      for (const { variantId, quantity = 1, metadata = {} } of items) {
        try {
          const { cart: updatedCart } = await medusaClient.store.cart.createLineItem(activeCartId, {
            variant_id: variantId,
            quantity: Number(quantity),
            metadata: {
              ...metadata,
              added_at: new Date().toISOString(),
            },
          })
          latestCart = updatedCart
        } catch (err) {
          if (err?.status === 404 || err?.message?.includes('not found')) {
            // Cart expired mid-batch — recreate once and keep going with the new id.
            localStorage.removeItem('medusa_cart_id')
            const freshCart = await createFreshCart()
            activeCartId = freshCart.id

            const { cart: updatedCart } = await medusaClient.store.cart.createLineItem(activeCartId, {
              variant_id: variantId,
              quantity: Number(quantity),
              metadata: {
                ...metadata,
                added_at: new Date().toISOString(),
              },
            })
            latestCart = updatedCart
          } else {
            throw err
          }
        }
      }

      // Single React state update, after every item has landed in Medusa.
      setCart(latestCart)
      setIsDrawerOpen(true)
      return latestCart
    } catch (err) {
      console.error('Failed to add bundle items to cart:', err)
      alert(err?.message || 'Could not add all bundle items to cart.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const buyNow = async ({ variantId, quantity = 1, metadata = {} }) => {
    await addToCart({ variantId, quantity, metadata })
    setIsDrawerOpen(false)
    navigate('/checkout')
  }

  const updateQuantity = async (lineItemId, quantity) => {
    if (!cart?.id) return
    try {
      setLoading(true)
      if (quantity <= 0) {
        const { cart: updatedCart } = await medusaClient.store.cart.deleteLineItem(cart.id, lineItemId)
        setCart(updatedCart)
      } else {
        const { cart: updatedCart } = await medusaClient.store.cart.updateLineItem(cart.id, lineItemId, {
          quantity: Number(quantity),
        })
        setCart(updatedCart)
      }
    } catch (err) {
      console.error('Error updating line item:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (lineItemId) => {
    await updateQuantity(lineItemId, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        isDrawerOpen,
        setIsDrawerOpen,
        addToCart,
        addItemsBatch,
        buyNow,
        updateQuantity,
        removeItem,
        createFreshCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)