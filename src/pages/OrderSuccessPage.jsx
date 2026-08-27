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
        const { order: fetchedOrder } = await medusaClient.store.order.retrieve(id, {
          fields: '*items,*items.metadata,*shipping_address,*summary,*shipping_methods,metadata',
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

  const orderItems = order?.items ?? []

  // Extract totals directly from Medusa summary object or fallback to item sum
  const summary = order?.summary || {}
  
  const computedSubtotal = orderItems.reduce((acc, item) => {
    const price = item.total ?? item.subtotal ?? (item.unit_price * item.quantity) ?? 0
    return acc + price
  }, 0)

  const subtotal = summary.subtotal ?? order?.subtotal ?? computedSubtotal
  const shippingTotal = summary.shipping_total ?? order?.shipping_total ?? 0
  const discountTotal = summary.discount_total ?? order?.discount_total ?? 0
  const grandTotal = summary.current_order_total ?? summary.total ?? order?.total ?? (subtotal + shippingTotal - discountTotal)

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans">
      <div className="border-2 border-black p-6 sm:p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="border-b-2 border-black pb-4">
          <span className="bg-black text-white text-xs font-black uppercase px-3 py-1">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight mt-3 text-black">
            Thank You For Your Order!
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Order Reference: <span className="text-black font-mono">{id}</span>
          </p>
        </div>

        {error ? (
          <p className="text-sm font-bold text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-black">
              We have received your order and are processing it for dispatch. You will pay cash upon delivery.
            </p>

            {order?.shipping_address && (
              <div className="border-2 border-black p-4 bg-gray-50">
                <h3 className="text-xs font-black uppercase border-b border-black pb-1 mb-2">
                  Shipping Details
                </h3>
                <p className="text-xs font-bold">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p className="text-xs font-medium text-gray-700">{order.shipping_address.address_1}</p>
                <p className="text-xs font-medium text-gray-700">
                  {order.shipping_address.city}, Pakistan
                </p>
                <p className="text-xs font-bold text-black mt-1">
                  Phone: {order.shipping_address.phone}
                </p>
              </div>
            )}

            {orderItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1">
                  Ordered Items
                </h3>
                {orderItems.map((item) => {
                  const lineTotal = item.total ?? item.subtotal ?? (item.unit_price * item.quantity) ?? 0
                  const scentList = item.metadata?.selected_scents || item.metadata?.all_bundle_scents

                  return (
                    <div key={item.id} className="flex justify-between items-start text-xs font-bold border-b border-gray-200 pb-3">
                      <div>
                        <p className="text-black text-sm">{item.title}</p>
                        
                        {item.metadata?.pack_type && (
                          <span className="text-[10px] font-black uppercase bg-yellow-200 text-black px-1.5 py-0.5 border border-black inline-block mt-1">
                            {item.metadata.pack_type}
                          </span>
                        )}

                        {scentList && (
                          <p className="text-black font-medium text-[11px] mt-1 bg-yellow-50 p-1 border border-black">
                            <span className="font-bold underline">Scents:</span> {scentList}
                          </p>
                        )}

                        <p className="text-gray-500 font-normal mt-1">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-black">PKR {Math.round(lineTotal).toLocaleString('en-PK')}</span>
                    </div>
                  )
                })}

                <div className="pt-2 space-y-1 text-xs font-bold border-t-2 border-black">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>PKR {Math.round(subtotal).toLocaleString('en-PK')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{shippingTotal === 0 ? 'FREE' : `PKR ${Math.round(shippingTotal).toLocaleString('en-PK')}`}</span>
                  </div>

                  {discountTotal > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount:</span>
                      <span>- PKR {Math.round(discountTotal).toLocaleString('en-PK')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black border-t border-black pt-2 text-black">
                    <span>Total Amount:</span>
                    <span>PKR {Math.round(grandTotal).toLocaleString('en-PK')}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t-2 border-black flex justify-end">
          <Link
            to="/"
            className="bg-black text-white font-black py-3 px-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase text-xs tracking-wider hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}