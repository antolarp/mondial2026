'use client'
import { useState, useEffect } from 'react'

function pad(n) { return String(n).padStart(2, '0') }

export default function Countdown({ match, pronos }) {
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

      {pronos && pronos.total > 0 && (() => {
        const pctDom = Math.round((pronos.dom / pronos.total) * 100)
        const pctExt = Math.round((pronos.ext / pronos.total) * 100)
        const pctNul = 100 - pctDom - pctExt
        return (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: '#5a7fc0', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
              Pronos ({pronos.total} joueur{pronos.total > 1 ? 's' : ''})
            </p>
            {/* Barre */}
            <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8 }}>
              {pctDom > 0 && <div style={{ width: `${pctDom}%`, background: '#3b82f6' }} />}
              {pctNul > 0 && <div style={{ width: `${pctNul}%`, background: 'rgba(255,255,255,0.25)' }} />}
              {pctExt > 0 && <div style={{ width: `${pctExt}%`, background: '#f43f5e' }} />}
            </div>
            {/* Légende */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 10, color: '#93c5fd', fontWeight: 700, maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.domicile} {pctDom}%</span>
              {pctNul > 0 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Nul {pctNul}%</span>}
              <span style={{ fontSize: 10, color: '#fda4af', fontWeight: 700, maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{pctExt}% {match.exterieur}</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
