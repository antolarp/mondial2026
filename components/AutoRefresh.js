'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({ interval = 60000 }) {
  const router = useRouter()
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh()
      setLastRefresh(new Date())
    }, interval)
    return () => clearInterval(id)
  }, [router, interval])

  // Petite pastille discrète en bas à droite pour confirmer le live
  return (
    <div style={{
      position: 'fixed', bottom: 14, right: 14, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'rgba(12,30,82,0.85)', backdropFilter: 'blur(6px)',
      borderRadius: 20, padding: '5px 10px',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#4ade80',
        boxShadow: '0 0 0 2px rgba(74,222,128,0.3)',
        animation: 'pulse 2s infinite',
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <span style={{ color: '#8aaad8', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
        {lastRefresh
          ? `Mis à jour ${lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Live · rafraîchit auto'}
      </span>
    </div>
  )
}
