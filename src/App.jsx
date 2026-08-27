import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import { CartProvider } from './context/CartContext'
import { homepageSections } from './config/sectionsConfig'

// Page Imports
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ContactInformation from './pages/ContactInformation'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import TermsPage from './pages/TermPage'
import ContactUsPage from './pages/ContactUsPage'
import ShippingPolicy from './pages/ShippingPolicy'
import LegalNotice from './pages/LegalNotice'
export default function App() {
  // Dynamically derive header categories straight from sectionsConfig.js
  const categories = homepageSections.map((s, index) => {
    const title = s?.heading || s?.title || s?.name || 'Collection'
    const colId = s?.collectionId || s?.filter?.collection_id || ''
    const link = s?.viewAllLink || (colId ? `/catalog?collection=${colId}` : '/catalog')

    return {
      id: s?.id || `section-${index}`,
      name: title,
      heading: title,
      subheading: s?.subheading || '',
      collectionName: colId,
      viewAllLink: link,
      path: link,
    }
  })

  return (
    <CartProvider>
      <MainLayout categories={categories}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/products/:handle" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/confirmed/:id" element={<OrderSuccessPage />} />
          <Route path="/policies/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/policies/refund" element={<RefundPolicyPage />} />
          <Route path="/policies/terms" element={<TermsPage />} />
           <Route path="/policies/contactinformation" element={<ContactInformation />} />
          <Route path="/policies/shipping" element={<ShippingPolicy />} />
          <Route path="/policies/legal" element={<LegalNotice />} />
        </Routes>
      </MainLayout>
    </CartProvider>
  )
}