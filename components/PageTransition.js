'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function PageTransition({ children }) {
  const pathname = usePathname()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = 'pageFadeIn 0.32s ease both'
  }, [pathname])

  return (
    <div ref={ref} style={{ animation: 'pageFadeIn 0.32s ease both' }}>
      {children}
    </div>
  )
}
