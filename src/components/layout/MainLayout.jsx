import React from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'
import CustomCursor from "../CustomCursor";
import PromoBanner from '../home/PromoBanner'

export default function MainLayout({ children, categories }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <CustomCursor />
      <PromoBanner />
      <Header categories={categories} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}