// src/pages/CartPage.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cart, updateQuantity, removeItem, loading } = useCart()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <div className="text-lg font-bold animate-pulse">Loading your cart...</div>
      </div>
    )
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black">Your Cart is Empty</h1>
        <p className="mt-2 text-gray-600 font-medium">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-black text-white font-bold py-3 px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 transition-all uppercase text-sm tracking-wider"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const subtotal = cart.subtotal ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const unitPrice = item.unit_price || 0
            const itemTotal = unitPrice * item.quantity

            return (
              <div
                key={item.id}
                className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.thumbnail || item.variant?.product?.thumbnail || '/images/placeholder.jpeg'}
                    alt={item.title}
                    className="w-20 h-20 object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-black uppercase">{item.title}</h3>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      Variant: {item.variant?.title}
                    </p>

                    {item.metadata?.selected_scents && (
                      <p className="text-xs font-bold text-black mt-1 bg-yellow-100 p-1 border border-black inline-block">
                        Scents: {item.metadata.selected_scents}
                      </p>
                    )}

                    <p className="text-xs font-bold text-black mt-1">
                      PKR {Math.round(unitPrice).toLocaleString('en-PK')}.00 each
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                  {/* Quantity Controller */}
                  <div className="flex items-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-0.5 font-bold text-base hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-0.5 font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-0.5 font-bold text-base hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm text-black">
                      PKR {Math.round(itemTotal).toLocaleString('en-PK')}.00
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-bold text-red-600 underline mt-1 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Side Card */}
        <div className="lg:col-span-4">
          <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 sticky top-6">
            <h2 className="text-lg font-black uppercase border-b-2 border-black pb-2 text-black">
              Order Summary
            </h2>

            <div className="flex justify-between items-center text-sm font-bold text-black">
              <span>Subtotal</span>
              <span>PKR {Math.round(subtotal).toLocaleString('en-PK')}.00</span>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Shipping, taxes, and promotional discount codes will be applied at checkout.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white font-black py-4 px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 transition-all text-sm uppercase tracking-wider"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="block text-center text-xs font-bold text-black underline uppercase tracking-wider hover:text-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}