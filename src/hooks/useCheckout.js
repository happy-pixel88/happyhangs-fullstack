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

  useEffect(() => {
    async function initShippingOptions() {
      if (!cart?.id) return
      try {
        setLoadingShipping(true)
        const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
          cart_id: cart.id,
        })

        const options = shipping_options || []
        setShippingOptions(options)

        if (options.length > 0) {
          const defaultOptionId = options[0].id
          setSelectedShippingOption(defaultOptionId)

          if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
            const { cart: updatedCart } = await medusaClient.store.cart.addShippingMethod(cart.id, {
              option_id: defaultOptionId,
            })
            setCart(updatedCart)
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic shipping options:', err)
      } finally {
        setLoadingShipping(false)
      }
    }

    initShippingOptions()
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
        promo_codes: [code],
      })
      setCart(updatedCart)
      return { success: true }
    } catch (err) {
      return { success: false, message: err?.message || 'Invalid promotion code' }
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

      let targetShippingOptionId = selectedShippingOption

      if (!targetShippingOptionId) {
        const { shipping_options } = await medusaClient.store.fulfillment.listCartOptions({
          cart_id: updatedCart.id,
        })
        if (shipping_options?.length > 0) {
          targetShippingOptionId = shipping_options[0].id
        }
      }

      if (!targetShippingOptionId) {
        throw new Error('No valid shipping methods available for the provided address in Medusa Admin.')
      }

      if (!updatedCart.shipping_methods || updatedCart.shipping_methods.length === 0) {
        const { cart: cartWithShipping } = await medusaClient.store.cart.addShippingMethod(updatedCart.id, {
          option_id: targetShippingOptionId,
        })
        updatedCart = cartWithShipping
        setCart(updatedCart)
      }

      try {
        await medusaClient.store.payment.initiatePaymentSession(updatedCart, {
          provider_id: 'pp_system_default',
        })
      } catch (payErr) {
        console.warn('Payment session bypassed or default accepted:', payErr)
      }

      // Format payload directly using Medusa's computed cart totals
      const orderItems = updatedCart.items || []
      const itemSummary = orderItems
        .map((item) => {
          const selectedScents = item.metadata?.selected_scents || item.metadata?.all_bundle_scents
          const scentDetails = selectedScents ? ` [Scents: ${selectedScents}]` : ''
          return `${item.title}${scentDetails} (x${item.quantity})`
        })
        .join(' | ')

      const subtotalVal = updatedCart.subtotal ?? 0
      const discountVal = updatedCart.discount_total ?? 0
      const shippingVal = updatedCart.shipping_total ?? 0
      const totalVal = updatedCart.total ?? (subtotalVal + shippingVal - discountVal)

      const makePayload = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: cleanEmail,
        customer_phone: cleanPhone,
        address: `${formData.address}, ${formData.city}`,
        items: itemSummary,
        subtotal: `PKR ${Math.round(subtotalVal)}`,
        discount: `PKR ${Math.round(discountVal)}`,
        shipping_fee: shippingVal === 0 ? 'FREE' : `PKR ${Math.round(shippingVal)}`,
        total_price: `PKR ${Math.round(totalVal)}`,
      }

      await medusaClient.store.cart.update(updatedCart.id, {
        metadata: {
          ...updatedCart.metadata,
          make_payload: makePayload,
          subtotal: makePayload.subtotal,
          discount: makePayload.discount,
          shipping_fee: makePayload.shipping_fee,
          total_price: makePayload.total_price,
        },
      })

      const response = await medusaClient.store.cart.complete(updatedCart.id)

      if (response?.type === 'order' && response?.order) {
        const order = response.order

        try {
          const webhookUrl =
            import.meta.env.VITE_MAKE_WEBHOOK_URL ||
            'https://hook.eu1.make.com/6gf7i0sw663t5nt615wqj72ac7lx29jx'

          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: order.display_id || order.id,
              ...makePayload,
            }),
          })
        } catch (webhookErr) {
          console.error('Make.com Webhook Failed silently:', webhookErr)
        }

        localStorage.removeItem('medusa_cart_id')
        await createFreshCart()

        navigate(`/order/confirmed/${order.id}`, {
          state: { order, makePayload },
        })
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