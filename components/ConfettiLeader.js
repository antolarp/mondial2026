'use client'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiLeader({ leader }) {
  useEffect(() => {
    if (!leader) return
    try {
      const stored = localStorage.getItem('mondialLeader')
      if (stored !== null && stored !== leader) {
        // Nouveau leader ! On fête ça
        const fire = (opts) => confetti({
          particleCount: 120,
          spread: 80,
          colors: ['#f0b429', '#0c1e52', '#ffffff', '#16a34a', '#ef4444'],
          ...opts,
        })
        fire({ origin: { y: 0.6, x: 0.5 } })
        setTimeout(() => fire({ origin: { y: 0.55, x: 0.2 }, particleCount: 80 }), 250)
        setTimeout(() => fire({ origin: { y: 0.55, x: 0.8 }, particleCount: 80 }), 400)
      }
      localStorage.setItem('mondialLeader', leader)
    } catch {
      // localStorage indisponible (SSR ou navigation privée), on ignore
    }
  }, [leader])

  return null
}
