// src/components/CustomCursor.tsx
'use client'

import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const posRef = useRef({ x: -100, y: -100 })
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('.interactive-hover') !== null
      ) {
        setIsHovered(true)
      } else {
        setIsHovered(false)
      }
    }

    // Smooth render loop using requestAnimationFrame
    const loop = () => {
      setPosition((prev) => {
        // Linear interpolation for ultra-smooth tracking
        const dx = posRef.current.x - prev.x
        const dy = posRef.current.y - prev.y
        return {
          x: prev.x + dx * 0.35,
          y: prev.y + dy * 0.35,
        }
      })
      requestRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', updateCursor, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    requestRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#FFC0CB',
        boxShadow: '0 0 12px #ffd769, 0 0 20px #ffd769',
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform',
        transform: `translate3d(${position.x - 8}px, ${position.y - 8}px, 0) scale(${isHovered ? 1.5 : 1})`,
        transition: 'transform 0.05s linear, opacity 0.15s ease-out',
        opacity: isHovered ? 0.8 : 1,
      }}
    />
  )
}