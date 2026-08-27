// src/pages/ContactPage.jsx
import React, { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire this up to EmailJS or a backend endpoint, same pattern as checkout notifications
    setSubmitted(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="border-4 border-black bg-[#F9CD97] p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-black mb-2">
          Contact Us
        </h1>
        <p className="text-black font-medium">
          Questions about an order, a product, or anything else? Send us a message.
        </p>
      </div>

      {submitted ? (
        <div className="border-4 border-black bg-white p-8 text-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Thanks — we've received your message and will get back to you soon.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border-4 border-black bg-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <div>
            <label htmlFor="name" className="font-bold text-sm uppercase block mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-black p-2 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="font-bold text-sm uppercase block mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-black p-2 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="message" className="font-bold text-sm uppercase block mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full border-2 border-black p-2 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white font-bold uppercase px-6 py-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:opacity-90 transition-all"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  )
}