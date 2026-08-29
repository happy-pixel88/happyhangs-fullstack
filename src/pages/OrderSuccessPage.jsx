import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { medusaClient } from '../config/apiConfig'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return
      try {
        setLoading(true)
        // FIX: Explicitly request subtotal, discount_total, shipping_total, and total
        const { order: fetchedOrder } = await medusaClient.store.order.retrieve(id, {
          fields: 'id,display_id,email,created_at,subtotal,shipping_total,discount_total,total,*items,*items.metadata,*shipping_address,*shipping_methods,metadata',
        })
        setOrder(fetchedOrder)
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError('Could not retrieve order details. Rest assured, your order has been placed!')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">
          Loading Order Summary...
        </h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans font-bold text-red-600">
        {error}
      </div>
    )
  }

  const orderItems = order?.items ?? []

  // 1. Compute baseline item subtotal as a fallback
  const computedSubtotal = orderItems.reduce((acc, item) => {
    return acc + (item.unit_price * item.quantity)
  }, 0)

  // 2. Extract Medusa's native calculation fields directly
  const subtotal = order?.subtotal ?? computedSubtotal
  const shippingTotal = order?.shipping_total ?? 0
  const discountTotal = order?.discount_total ?? 0
  const grandTotal = order?.total ?? (subtotal + shippingTotal - discountTotal)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans">
      <div className="border-2 border-black p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Order Confirmed!</h1>
        <p className="font-bold text-gray-700 mb-8 border-b-2 border-black pb-4">
          Order #{order?.display_id || order?.id?.slice(-6)}
        </p>

        {/* Order Items */}
        <div className="space-y-4 mb-8">
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm font-bold">
              <div className="flex items-center gap-3">
                <span>{item.quantity}x</span>
                <span>{item.title}</span>
              </div>
              <span>PKR {Math.round(item.unit_price * item.quantity).toLocaleString('en-PK')}</span>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="space-y-2 border-t-2 border-black pt-4 text-sm font-bold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>PKR {Math.round(subtotal).toLocaleString('en-PK')}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingTotal === 0 ? 'FREE' : `PKR ${Math.round(shippingTotal).toLocaleString('en-PK')}`}</span>
          </div>

          {discountTotal > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount</span>
              <span>- PKR {Math.round(discountTotal).toLocaleString('en-PK')}</span>
            </div>
          )}

          <div className="flex justify-between border-t-2 border-black pt-3 text-lg font-black uppercase">
            <span>Total</span>
            <span>PKR {Math.round(grandTotal).toLocaleString('en-PK')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}