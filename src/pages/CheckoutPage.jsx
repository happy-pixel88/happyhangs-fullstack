// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCheckout } from '../hooks/useCheckout'

export default function CheckoutPage() {
  const { cart } = useCart()
  const {
    shippingOptions,
    selectedShippingOption,
    selectShippingMethod,
    applyPromotionalCode,
    completeOrder,
    loadingShipping,
    submitting,
    checkoutError,
  } = useCheckout()

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: 'Lahore',
    phone: '',
  })

  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  const pkCities = [
    'Abbottabad', 'Alpuri', 'Attock', 'Badin', 'Bagh', 'Bahawalnagar', 'Bahawalpur', 'Bannu', 'Batkhela', 'Bhakkar',
    'Bhimber', 'Burewala', 'Chakwal', 'Chaman', 'Charsadda', 'Chilas', 'Chiniot', 'Chishtian', 'Chitral', 'Dadu',
    'Daggar', 'Daska', 'Dera Allah Yar', 'Dera Ghazi Khan', 'Dera Ismail Khan', 'Dera Murad Jamali', 'Faisalabad', 'Gharo', 'Ghotki', 'Gilgit',
    'Gojra', 'Gujranwala', 'Gujrat', 'Gwadar', 'Hafizabad', 'Hangu', 'Haripur', 'Haroonabad', 'Hub', 'Hunza (Karimabad)',
    'Hyderabad', 'Islamabad', 'Jacobabad', 'Jaranwala', 'Jhelum', 'Jhang', 'Kalat', 'Kamoke', 'Kandhkot', 'Karachi',
    'Karak', 'Kashmore', 'Kasur', 'Khairpur', 'Khanewal', 'Khanpur', 'Kharan', 'Khipro', 'Khuzdar', 'Kohat',
    'Kot Addu', 'Kotli', 'Kotri', 'Lahore', 'Lalamusa', 'Larkana', 'Layyah', 'Loralai', 'Mandi Bahauddin', 'Mansehra',
    'Mardan', 'Mastung', 'Matiari', 'Mianwali', 'Mingora (Swat)', 'Mirpur', 'Mirpur Khas', 'Multan', 'Muridke', 'Muzaffarabad',
    'Muzaffargarh', 'Nawabshah (Shaheed Benazirabad)', 'Nowshera', 'Nowshera Virkan', 'Nushki', 'Okara', 'Pakpattan', 'Parachinar', 'Pasrur', 'Pattoki',
    'Peshawar', 'Pishin', 'Quetta', 'Rahim Yar Khan', 'Rawalakot', 'Rawalpindi', 'Sahiwal', 'Samundri', 'Sanghar', 'Sargodha',
    'Shahdadkot', 'Sheikhupura', 'Shikarpur', 'Sialkot', 'Sibi', 'Skardu', 'Sukkur', 'Swabi', 'Tando Adam', 'Tando Allahyar',
    'Tank', 'Taxila', 'Thatta', 'Timergara', 'Toba Tek Singh', 'Turbat', 'Umerkot', 'Vihari', 'Wah Cantt', 'Wazirabad',
    'Zhob'
  ]

  useEffect(() => {
    if (shippingOptions?.length > 0 && !selectedShippingOption) {
      selectShippingMethod(shippingOptions[0].id)
    }
  }, [shippingOptions, selectedShippingOption, selectShippingMethod])

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s-]/g, '')
    return /^03\d{9}$/.test(cleanPhone)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: null })
    }
  }

  const handleApplyPromo = async (e) => {
    e.preventDefault()
    if (!promoCode.trim()) return
    const res = await applyPromotionalCode(promoCode.trim())
    if (res?.success) {
      setPromoMessage({ type: 'success', text: 'Discount applied successfully!' })
    } else {
      setPromoMessage({ type: 'error', text: res?.message || 'Invalid promotion code' })
    }
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()

    const errors = {}
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Please provide a valid email address.'
    }
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.'
    if (!formData.address.trim()) errors.address = 'Street address is required.'
    if (!validatePhone(formData.phone)) {
      errors.phone = 'Enter a valid 11-digit Pakistani mobile number starting with 03.'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    if (!selectedShippingOption && shippingOptions?.length > 0) {
      await selectShippingMethod(shippingOptions[0].id)
    }

    completeOrder(formData)
  }

  if (!cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-sans">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Loading Checkout...</h2>
        <p className="text-xs font-bold text-gray-600">Preparing order details...</p>
      </div>
    )
  }

  const cartItems = cart?.items ?? []
const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
const shippingTotal = cart?.shipping_total ?? 0
const discountTotal = cart?.discount_total ?? 0
const grandTotal = cart?.total ?? (subtotal + shippingTotal - discountTotal)
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-8">Checkout</h1>

      {checkoutError && (
        <div className="mb-6 p-4 bg-red-100 border-2 border-red-600 font-bold text-red-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {checkoutError}
        </div>
      )}

      {/* Main Form wrapped around all content to maintain native submit handling */}
      <form onSubmit={handleSubmitOrder}>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          
          {/* Customer & Delivery Form Inputs */}
          <div className="lg:col-span-7 space-y-6 order-1">
            <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-black pb-2">
                1. Contact Information
              </h2>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="happyhangs45@gmail.com"
                  className="w-full border-2 border-black p-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-black pb-2">
                2. Delivery Address (Pakistan)
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border-2 border-black p-3 font-medium focus:outline-none"
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border-2 border-black p-3 font-medium focus:outline-none"
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, Street name, Sector/Block"
                    className="w-full border-2 border-black p-3 font-medium focus:outline-none"
                  />
                  {validationErrors.address && (
                    <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">City</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none"
                    >
                      {pkCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="03154252433"
                      className="w-full border-2 border-black p-3 font-medium focus:outline-none"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-xs font-bold mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-black pb-2">
                3. Shipping Method
              </h2>
              {loadingShipping ? (
                <p className="text-sm font-bold animate-pulse">Calculating dynamic shipping options...</p>
              ) : shippingOptions.length === 0 ? (
                <p className="text-sm font-semibold text-gray-600">
                  Standard Flat Rate Shipping (Calculated automatically at order placement)
                </p>
              ) : (
                <div className="space-y-3">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => selectShippingMethod(opt.id)}
                      className={`flex items-center justify-between p-3 border-2 border-black cursor-pointer ${
                        selectedShippingOption === opt.id ? 'bg-black text-white' : 'bg-white text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping_option"
                          checked={selectedShippingOption === opt.id}
                          onChange={() => selectShippingMethod(opt.id)}
                          className="accent-black"
                        />
                        <span className="font-bold text-sm">{opt.name}</span>
                      </div>
                      <span className="font-bold text-sm">
                        {opt.amount === 0 ? 'FREE' : `PKR ${opt.amount}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-lg font-bold uppercase mb-4 border-b-2 border-black pb-2">
                4. Payment Method
              </h2>
              <div className="p-4 border-2 border-black bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm uppercase text-black">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-600 font-medium">Pay with cash upon delivery across Pakistan.</p>
                </div>
                <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase">Active</span>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Order Summary + Submit Button */}
          <div className="lg:col-span-5 order-2">
            <div className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] lg:sticky lg:top-6 space-y-6">
              <h2 className="text-lg font-bold uppercase border-b-2 border-black pb-2">Order Summary</h2>
              <p className="text-xs font-bold uppercase">free shipping on orders above pkr 2000</p>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const lineTotal = item.total ?? item.subtotal ?? (item.unit_price * item.quantity)
                  return (
                    <div key={item.id} className="flex gap-3 border-b border-gray-200 pb-3 mb-3">
                      <img
                        src={item.thumbnail || item.variant?.product?.thumbnail || '/images/placeholder.jpeg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover border border-black flex-shrink-0"
                      />
                      <div className="flex-1 text-xs">
                        <h4 className="font-bold text-black">{item.title}</h4>

                        {item.metadata?.pack_type && (
                          <span className="text-[10px] font-black uppercase bg-yellow-200 text-black px-1.5 py-0.5 border border-black inline-block mt-1">
                            {item.metadata.pack_type}
                          </span>
                        )}

                        <div className="flex justify-between items-center mt-2 font-bold">
                          <span>Qty: {item.quantity}</span>
                          <span>PKR {Math.round(lineTotal).toLocaleString('en-PK')}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Promo Code Subsection */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 border-2 border-black p-2 text-xs font-bold uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-black text-white font-bold px-4 text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Apply
                </button>
              </div>

              {promoMessage && (
                <p className={`text-xs font-bold ${promoMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                  {promoMessage.text}
                </p>
              )}

              <div className="space-y-2 border-t-2 border-black pt-4 text-xs font-bold">
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingTotal === 0 ? 'FREE' : `PKR ${Math.round(shippingTotal).toLocaleString('en-PK')}.00`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {Math.round(subtotal).toLocaleString('en-PK')}.00</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>- PKR {Math.round(discountTotal).toLocaleString('en-PK')}.00</span>
                  </div>
                )}

                <div className="flex justify-between border-t-2 border-black pt-3 text-base font-black">
                  <span>Total</span>
                  <span>PKR {Math.round(grandTotal).toLocaleString('en-PK')}.00</span>
                </div>
              </div>

              {/* Complete Order Button now stays directly under Order Summary on all screens */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white font-black py-4 px-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 transition-all text-base uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Processing Order...' : 'Complete Order (COD)'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}