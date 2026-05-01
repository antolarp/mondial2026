'use client'
import { useState, useEffect } from 'react'

function pad(n) { return String(n).padStart(2, '0') }

export default function Countdown({ match }) {
  const [left, setLeft] = useState(null)

  useEffect(() => {
    const target = new Date(match.date)
    const update = () => {
      const diff = target - Date.now()
      if (diff <= 0) { setLeft(null); return }
      setLeft({
        j: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [match.date])

  if (!left) return null

  const units = left.j > 0
    ? [{ v: left.j, l: 'jours' }, { v: left.h, l: 'heures' }, { v: left.m, l: 'min' }]
    : [{ v: left.h, l: 'heures' }, { v: left.m, l: 'min' }, { v: left.s, l: 'sec' }]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '16px 20px',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
        Prochain match
      </p>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
        {match.domicile} <span style={{ color: '#5a7fc0' }}>vs</span> {match.exterieur}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {units.map(({ v, l }) => (
          <div key={l} style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '8px 12px', textAlign: 'center', minWidth: 52,
          }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {pad(v)}
            </p>
            <p style={{ color: '#5a7fc0', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
              {l}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
