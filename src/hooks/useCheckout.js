// src/hooks/useCheckout.js
import { useState, useEffect, useRef } from 'react'
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

  // Track field state hashes to avoid redundant API hits during re-editing
  const lastSyncedHash = useRef('')

  // 1. Track InitiateCheckout when hook mounts
  useEffect(() => {
    if (cart?.id && cart?.items?.length > 0 && window.fbq) {
      window.fbq(
        'track',
        'InitiateCheckout',
        {
          num_items: cart.items.reduce((sum, item) => sum + item.quantity, 0),
          value: (cart.total ?? 0) / 100,
          currency: 'PKR',
          content_ids: cart.items.map((item) => item.variant_id || item.id),
          content_type: 'product',
        },
        { eventID: cart.id }
      )
    }
  }, [cart?.id])

  // 2. Initialize checkout state & handle promotion calculations
  useEffect(() => {
    async function bruteForceCheckoutState() {
      if (!cart?.id) return

      try {
        setLoadingShipping(true)

        // Grab absolute truth from server
        const { cart: serverCart } = await medusaClient.store.cart.retrieve(cart.id, {
          fields: '*items,*promotions,*shipping_methods,subtotal,shipping_total,discount_total,total',
        })

        // DETECT CURSED EDGE CASE (Single Diffuser + Single Refill/Resin)
        const isCursedMixedCart =
          serverCart.items?.length === 2 &&
          serverCart.items[0].quantity === 1 &&
          serverCart.items[1].quantity === 1

        if (isCursedMixedCart) {
          console.warn('Mixed 1x1 cart detected. Forcing Medusa double-calculation bypass...')

          const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
            cart_id: serverCart.id,
          })

          if (shipping_options && shipping_options.length > 0) {
            const targetId = shipping_options[0].id

            await medusaClient.store.cart.addShippingMethod(serverCart.id, {
              option_id: targetId,
            })

            const { cart: finalForcedCart } = await medusaClient.store.cart.addShippingMethod(
              serverCart.id,
              { option_id: targetId }
            )

            setSelectedShippingOption(targetId)
            setCart(finalForcedCart)
            return
          }
        }

        // STANDARD LOGIC FOR ALL OTHER CARTS
        if (serverCart.shipping_methods && serverCart.shipping_methods.length > 0) {
          const activeMethodId =
            serverCart.shipping_methods[0].shipping_option_id || serverCart.shipping_methods[0].id
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

          const { cart: updatedCart } = await medusaClient.store.cart.addShippingMethod(
            serverCart.id,
            { option_id: defaultOptionId }
          )
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
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Invalid promo code for this item combination.',
      }
    }
  }

  /**
   * BACKGROUND SYNC HANDLER (Call on input onBlur or step changes)
   * Handles both initial entries and subsequent re-edits seamlessly.
   */
  const syncCustomerInfo = async (formData) => {
    if (!cart?.id) return

    const cleanEmail = (formData.email || '').trim().toLowerCase()
    const cleanPhone = (formData.phone || '').trim()
    const firstName = (formData.firstName || '').trim()
    const lastName = (formData.lastName || '').trim()
    const address = (formData.address || '').trim()
    const city = (formData.city || '').trim()

    // Minimum check: only sync if at least email or first name + address are provided
    if (!cleanEmail && !firstName) return

    // Create a fingerprint hash to prevent duplicate server round-trips if nothing changed
    const currentHash = `${cleanEmail}|${cleanPhone}|${firstName}|${lastName}|${address}|${city}`
    if (currentHash === lastSyncedHash.current) return

    try {
      lastSyncedHash.current = currentHash

      const { cart: updatedCart } = await medusaClient.store.cart.update(cart.id, {
        email: cleanEmail || undefined,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city: city,
          country_code: 'pk',
          phone: cleanPhone,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city: city,
          country_code: 'pk',
          phone: cleanPhone,
        },
      })

      setCart(updatedCart)
    } catch (err) {
      console.warn('Background address sync warning:', err)
    }
  }

  /**
   * FAST ORDER COMPLETION (< 2 Seconds Execution)
   */
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
      const firstName = (formData.firstName || '').trim()
      const lastName = (formData.lastName || '').trim()
      const address = (formData.address || '').trim()
      const city = (formData.city || '').trim()

      // Build summary metadata
      const orderItems = cart.items || []
      const trueSubtotal = orderItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0
      )
      const shippingVal = cart.shipping_total ?? 0
      const discountVal = cart.discount_total ?? 0
      const totalVal = cart.total ?? trueSubtotal + shippingVal - discountVal

      const itemSummary = orderItems
        .map((item) => {
          const selectedScents =
            item.metadata?.selected_scents || item.metadata?.all_bundle_scents
          const scentDetails = selectedScents ? ` [Scents: ${selectedScents}]` : ''
          return `${item.title}${scentDetails} (x${item.quantity})`
        })
        .join(' | ')

      const makePayload = {
        customer_name: `${firstName} ${lastName}`,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        address: `${address}, ${city}`,
        items: itemSummary,
        subtotal: `PKR ${Math.round(trueSubtotal)}`,
        discount: `PKR ${Math.round(discountVal)}`,
        shipping_fee: shippingVal === 0 ? 'FREE' : `PKR ${Math.round(shippingVal)}`,
        total_price: `PKR ${Math.round(totalVal)}`,
      }

      // 1. Single final payload update ensuring latest values (catering to last-second re-edits)
      let { cart: updatedCart } = await medusaClient.store.cart.update(cart.id, {
        email: cleanEmail,
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city: city,
          country_code: 'pk',
          phone: cleanPhone,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          city: city,
          country_code: 'pk',
          phone: cleanPhone,
        },
        metadata: {
          ...cart.metadata,
          make_payload: makePayload,
          subtotal: makePayload.subtotal,
          discount: makePayload.discount,
          shipping_fee: makePayload.shipping_fee,
          total_price: makePayload.total_price,
        },
      })

      // 2. Fast Payment Session check
      try {
        const paymentRes = await medusaClient.store.payment.initiatePaymentSession(
          updatedCart,
          { provider_id: 'pp_system_default' }
        )
        if (paymentRes?.cart) {
          updatedCart = paymentRes.cart
        }
      } catch (payErr) {
        // Payment session already active or fallback created
      }

      // 3. Complete Cart Transaction
      const response = await medusaClient.store.cart.complete(updatedCart.id)

      if (response?.type === 'order' && response?.order) {
        const order = response.order

        // Track Meta Pixel Purchase event with eventID deduplication
        if (window.fbq) {
          window.fbq(
            'track',
            'Purchase',
            {
              value: (order.total ?? totalVal) / 100,
              currency: 'PKR',
              content_type: 'product',
              contents: order.items?.map((item) => ({
                id: item.variant_id || item.id,
                quantity: item.quantity,
              })),
            },
            { eventID: order.id }
          )
        }

        // 4. NON-BLOCKING Webhook — fire asynchronously without awaiting
        const webhookUrl =
          import.meta.env.VITE_MAKE_WEBHOOK_URL ||
          'https://hook.eu1.make.com/6gf7i0sw663t5nt615wqj72ac7lx29jx'

        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: order.display_id || order.id, ...makePayload }),
        }).catch((webhookErr) => console.error('Make.com Webhook Failed silently:', webhookErr))

        // 5. Navigate immediately
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
    syncCustomerInfo,
    completeOrder,
    loadingShipping,
    submitting,
    checkoutError,
  }
}