// src/hooks/useCheckout.js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { medusaClient } from '../config/apiConfig'

export function useCheckout() {
  const { cart, setCart, createFreshCart } = useCart()
  const navigate = useNavigate()

  const [shippingOptions, setShippingOptions] = useState([])
  const [selectedShippingOption, setSelectedShippingOption] = useState(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  /// src/hooks/useCheckout.js

// 1. Force sync cart with full line-item metadata relations
// src/hooks/useCheckout.js

  // src/hooks/useCheckout.js

  useEffect(() => {
    async function bruteForceCheckoutState() {
      if (!cart?.id) return

      try {
        setLoadingShipping(true)

        // 1. Always grab the absolute truth from the server first
        const { cart: serverCart } = await medusaClient.store.cart.retrieve(cart.id, {
          fields: '*items,*promotions,*shipping_methods,subtotal,shipping_total,discount_total,total',
        })

        // 2. DETECT THE EXACT CURSED EDGE CASE
        // 2 items total, exactly 1 quantity each (Single Diffuser + Single Refill/Resin)
        const isCursedMixedCart = serverCart.items?.length === 2 && 
                                  serverCart.items[0].quantity === 1 && 
                                  serverCart.items[1].quantity === 1

        if (isCursedMixedCart) {
          console.warn('Mixed 1x1 cart detected. Forcing Medusa double-calculation bypass...')
          
          const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
            cart_id: serverCart.id,
          })
          
          if (shipping_options && shipping_options.length > 0) {
            const targetId = shipping_options[0].id
            
            // STRIKE 1: Medusa might drop the discount here because of collection isolation
            await medusaClient.store.cart.addShippingMethod(serverCart.id, {
              option_id: targetId,
            })
            
            // STRIKE 2: The Double-Tap. Force Medusa to re-evaluate the promo engine 
            // now that the shipping method is actively bound to the cart context.
            const { cart: finalForcedCart } = await medusaClient.store.cart.addShippingMethod(serverCart.id, {
              option_id: targetId,
            })
            
            setSelectedShippingOption(targetId)
            setCart(finalForcedCart)
            return // Abort the rest of the standard logic
          }
        }

        // --- 3. STANDARD LOGIC FOR EVERYTHING ELSE (Bundles, Packs, >3 Items, etc.) ---
        
        if (serverCart.shipping_methods && serverCart.shipping_methods.length > 0) {
          const activeMethodId = serverCart.shipping_methods[0].shipping_option_id || serverCart.shipping_methods[0].id
          setSelectedShippingOption(activeMethodId)
          setCart(serverCart) 
          return 
        }

        const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
          cart_id: serverCart.id,
        })

        const options = shipping_options || []
        setShippingOptions(options)

        if (options.length > 0) {
          const defaultOptionId = options[0].id
          setSelectedShippingOption(defaultOptionId)

          const { cart: updatedCart } = await medusaClient.store.cart.addShippingMethod(serverCart.id, {
            option_id: defaultOptionId,
          })
          setCart(updatedCart)
        } else {
          setCart(serverCart)
        }

      } catch (err) {
        console.error('Error initializing checkout state:', err)
      } finally {
        setLoadingShipping(false)
      }
    }

    bruteForceCheckoutState()
  }, [cart?.id])
  const selectShippingMethod = async (optionId) => {
    if (!cart?.id || !optionId) return
    try {
      setSelectedShippingOption(optionId)
      const { cart: updatedCart } = await medusaClient.store.cart.addShippingMethod(cart.id, {
        option_id: optionId,
      })
      setCart(updatedCart)
    } catch (err) {
      console.error('Error selecting shipping method:', err)
    }
  }

  const applyPromotionalCode = async (code) => {
    if (!cart?.id) return { success: false, message: 'No active cart found' }
    try {
      const { cart: updatedCart } = await medusaClient.store.cart.update(cart.id, {
        promo_codes: [code.trim()],
      })
      setCart(updatedCart)
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        message: err?.response?.data?.message || err?.message || 'Invalid promo code for this item combination.' 
      }
    }
  }

  const completeOrder = async (formData) => {
    if (!cart?.id) {
      setCheckoutError('No active cart found. Please try again.')
      return
    }

    setSubmitting(true)
    setCheckoutError(null)

    try {
      const cleanEmail = (formData.email || '').trim().toLowerCase()
      const cleanPhone = (formData.phone || '').trim()

      // 1. Update customer address details FIRST
      let { cart: updatedCart } = await medusaClient.store.cart.update(cart.id, {
        email: cleanEmail,
        shipping_address: {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          address_1: formData.address.trim(),
          city: formData.city.trim(),
          country_code: 'pk',
          phone: cleanPhone,
        },
        billing_address: {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          address_1: formData.address.trim(),
          city: formData.city.trim(),
          country_code: 'pk',
          phone: cleanPhone,
        },
      })

      // 2. Ensure shipping is attached
      let targetShippingOptionId = selectedShippingOption
      if (!targetShippingOptionId) {
        try {
          const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
            cart_id: updatedCart.id,
          })
          if (shipping_options?.length > 0) {
            targetShippingOptionId = shipping_options[0].id
          }
        } catch (err) {
          console.warn('Shipping options lookup failed:', err)
        }
      }

      if (targetShippingOptionId && (!updatedCart.shipping_methods || updatedCart.shipping_methods.length === 0)) {
        const { cart: cartWithShipping } = await medusaClient.store.cart.addShippingMethod(updatedCart.id, {
          option_id: targetShippingOptionId,
        })
        updatedCart = cartWithShipping
        setCart(updatedCart)
      }

      // 3. Build & Save Metadata BEFORE Payment Session
      const orderItems = updatedCart.items || []
      const trueSubtotal = orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
      const shippingVal = updatedCart.shipping_total ?? 0
      const discountVal = updatedCart.discount_total ?? 0
      const totalVal = updatedCart.total ?? (trueSubtotal + shippingVal - discountVal)

      const itemSummary = orderItems.map((item) => {
        const selectedScents = item.metadata?.selected_scents || item.metadata?.all_bundle_scents
        const scentDetails = selectedScents ? ` [Scents: ${selectedScents}]` : ''
        return `${item.title}${scentDetails} (x${item.quantity})`
      }).join(' | ')

      const makePayload = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        address: `${formData.address}, ${formData.city}`,
        items: itemSummary,
        subtotal: `PKR ${Math.round(trueSubtotal)}`,
        discount: `PKR ${Math.round(discountVal)}`,
        shipping_fee: shippingVal === 0 ? 'FREE' : `PKR ${Math.round(shippingVal)}`,
        total_price: `PKR ${Math.round(totalVal)}`,
      }

      const { cart: finalCart } = await medusaClient.store.cart.update(updatedCart.id, {
        metadata: {
          ...updatedCart.metadata,
          make_payload: makePayload,
          subtotal: makePayload.subtotal,
          discount: makePayload.discount,
          shipping_fee: makePayload.shipping_fee,
          total_price: makePayload.total_price,
        },
      })
      updatedCart = finalCart

      // 4. Initiate Payment Session NOW (Cart is fully locked)
      try {
        const paymentRes = await medusaClient.store.payment.initiatePaymentSession(
          updatedCart,
          { provider_id: 'pp_system_default' }
        )
        if (paymentRes?.cart) {
          updatedCart = paymentRes.cart
        }
      } catch (payErr) {
        console.warn('Direct payment session init failed, attempting collection creation:', payErr)
        try {
          const { cart: paymentCart } = await medusaClient.store.cart.update(updatedCart.id, {
            payment_collection: { providers: ['pp_system_default'] },
          })
          updatedCart = paymentCart
        } catch (fallbackErr) {
          console.error('Payment collection fallback failed:', fallbackErr)
        }
      }

      // 5. Complete Order
      const response = await medusaClient.store.cart.complete(updatedCart.id)

      if (response?.type === 'order' && response?.order) {
        const order = response.order
        try {
          const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL || 'https://hook.eu1.make.com/6gf7i0sw663t5nt615wqj72ac7lx29jx'
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: order.display_id || order.id, ...makePayload }),
          })
        } catch (webhookErr) {
          console.error('Make.com Webhook Failed silently:', webhookErr)
        }

        localStorage.removeItem('medusa_cart_id')
        await createFreshCart()
        navigate(`/order/confirmed/${order.id}`, { state: { order, makePayload } })
      } else {
        throw new Error(response?.error?.message || 'Cart completion failed.')
      }
    } catch (err) {
      console.error('Checkout Completion Error:', err)
      setCheckoutError(err?.message || 'Failed to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    shippingOptions,
    selectedShippingOption,
    selectShippingMethod,
    applyPromotionalCode,
    completeOrder,
    loadingShipping,
    submitting,
    checkoutError,
  }
}