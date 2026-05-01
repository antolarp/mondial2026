'use client'
import { useState } from 'react'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Seizièmes de finale','Huitièmes de finale','Quarts de finale',
  'Demi-finales','Troisième place','Finale',
]

export default function AdminPanel({ matchs, resultats: initRes }) {
  const [pwd, setPwd]         = useState('')
  const [authed, setAuthed]   = useState(false)
  const [authErr, setAuthErr] = useState(false)
  const [resultats, setResultats] = useState(initRes)
  const [phase, setPhase]     = useState('Groupe A')
  const [editing, setEditing] = useState(null)
  const [scoreH, setScoreH]   = useState('')
  const [scoreA, setScoreA]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const checkAuth = async () => {
    const res = await fetch('/api/admin/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    })
    if (res.ok) { setAuthed(true); setAuthErr(false) }
    else setAuthErr(true)
  }

  const openEdit = (match) => {
    const res = resultats[match.id]
    setEditing(match.id)
    setScoreH(res !== undefined ? String(res.domicile) : '')
    setScoreA(res !== undefined ? String(res.exterieur) : '')
  }

  const save = async (matchId) => {
    if (scoreH === '' || scoreA === '') return
    setSaving(true)
    const res = await fetch('/api/admin/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, matchId, domicile: parseInt(scoreH), exterieur: parseInt(scoreA) }),
    })
    const data = await res.json()
    if (res.ok) {
      setResultats(prev => ({ ...prev, [matchId]: { domicile: parseInt(scoreH), exterieur: parseInt(scoreA) } }))
      setEditing(null); setScoreH(''); setScoreA('')
      const m = matchs.find(x => x.id === matchId)
      showToast(`✅ ${m.domicile} ${scoreH}–${scoreA} ${m.exterieur} — site mis à jour dans ~45s`)
    } else {
      showToast(`❌ ${data.error || 'Erreur'}`, false)
    }
    setSaving(false)
  }

  const del = async (matchId) => {
    if (!confirm('Supprimer ce résultat ?')) return
    setSaving(true)
    const res = await fetch('/api/admin/result', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, matchId }),
    })
    if (res.ok) {
      setResultats(prev => { const n = { ...prev }; delete n[matchId]; return n })
      setEditing(null)
      showToast('🗑️ Résultat supprimé')
    }
    setSaving(false)
  }

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a), ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  /* ── ÉCRAN DE CONNEXION ─────────────────────────────────────── */
  if (!authed) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 100%)', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 32px',
        width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 44 }}>⚽</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c1e52', margin: '12px 0 4px' }}>
            Admin Pronos
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Saisie des résultats</p>
        </div>
        <input
          type="password" placeholder="Mot de passe" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkAuth()}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 16,
            border: authErr ? '2px solid #ef4444' : '2px solid #e2e8f0',
            outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
          autoFocus
        />
        {authErr && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>Mot de passe incorrect</p>}
        <button onClick={checkAuth} style={{
          width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg, #0c1e52, #1a3a7a)',
          color: '#fff', border: 'none', cursor: 'pointer',
        }}>
          Connexion
        </button>
      </div>
    </div>
  )

  /* ── PANNEAU ADMIN ──────────────────────────────────────────── */
  const phaseMatchs = matchs.filter(m => m.phase === phase)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: '#0c1e52', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Administration</p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>Saisie des scores</p>
        </div>
        <a href="/" style={{ color: '#8aaad8', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>← Retour au site</a>
      </div>

      {/* Onglets phases */}
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e8eaf2' }}>
        {phases.map(p => {
          const label = p
            .replace('Groupe ', 'Gr.')
            .replace('Seizièmes de finale', '1/16')
            .replace('Huitièmes de finale', '1/8')
            .replace('Quarts de finale', 'Quarts')
            .replace('Troisième place', '3e place')
          const done  = matchs.filter(m => m.phase === p && resultats[m.id] !== undefined).length
          const total = matchs.filter(m => m.phase === p).length
          const full  = done === total
          return (
            <button key={p} onClick={() => { setPhase(p); setEditing(null) }} style={{
              display: 'inline-block', marginRight: 6, padding: '6px 14px', borderRadius: 20,
              background: phase === p ? '#0c1e52' : full ? '#f0fdf4' : '#f1f5f9',
              color: phase === p ? '#fff' : full ? '#16a34a' : '#64748b',
              border: phase === p ? 'none' : full ? '1px solid #bbf7d0' : '1px solid transparent',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {label} <span style={{ opacity: 0.65, fontSize: 10 }}>{done}/{total}</span>
            </button>
          )
        })}
      </div>

      {/* Liste des matchs */}
      <div style={{ padding: '14px 12px', maxWidth: 560, margin: '0 auto' }}>
        {phaseMatchs.map(match => {
          const res = resultats[match.id]
          const isEditing = editing === match.id
          const date = new Date(match.date)

          return (
            <div key={match.id} style={{
              background: '#fff', borderRadius: 16, marginBottom: 8,
              border: res !== undefined ? '1px solid #e8eaf2' : '1px solid #eef0f8',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
            }}>
              {/* Ligne match */}
              <div onClick={() => isEditing ? setEditing(null) : openEdit(match)}
                style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>
                    {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}
                    {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {match.domicile}
                    <span style={{ color: '#cbd5e1', fontWeight: 400, margin: '0 6px' }}>vs</span>
                    {match.exterieur}
                  </p>
                </div>
                {res !== undefined ? (
                  <span style={{
                    background: '#0c1e52', color: '#fff',
                    fontWeight: 800, fontSize: 15, padding: '5px 14px', borderRadius: 8,
                    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                  }}>
                    {res.domicile} – {res.exterieur}
                  </span>
                ) : (
                  <span style={{ fontSize: 20, color: '#cbd5e1', fontWeight: 300, flexShrink: 0 }}>＋</span>
                )}
              </div>

              {/* Zone de saisie */}
              {isEditing && (
                <div style={{
                  borderTop: '1px solid #f1f5f9', padding: '14px 16px',
                  background: '#fafbff', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <input
                    type="number" min="0" max="20" value={scoreH}
                    onChange={e => setScoreH(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save(match.id)}
                    placeholder="0" autoFocus
                    style={{
                      width: 60, height: 54, textAlign: 'center', fontSize: 26,
                      fontWeight: 900, borderRadius: 12, border: '2px solid #e2e8f0',
                      outline: 'none', flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>–</span>
                  <input
                    type="number" min="0" max="20" value={scoreA}
                    onChange={e => setScoreA(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && save(match.id)}
                    placeholder="0"
                    style={{
                      width: 60, height: 54, textAlign: 'center', fontSize: 26,
                      fontWeight: 900, borderRadius: 12, border: '2px solid #e2e8f0',
                      outline: 'none', flexShrink: 0,
                    }}
                  />
                  <button
                    onClick={() => save(match.id)}
                    disabled={saving || scoreH === '' || scoreA === ''}
                    style={{
                      flex: 1, height: 54, borderRadius: 12, border: 'none',
                      background: (saving || scoreH === '' || scoreA === '') ? '#e2e8f0' : '#16a34a',
                      color: (saving || scoreH === '' || scoreA === '') ? '#94a3b8' : '#fff',
                      fontWeight: 800, fontSize: 15, cursor: saving ? 'wait' : 'pointer',
                    }}
                  >
                    {saving ? '…' : '✓ Valider'}
                  </button>
                  {res !== undefined && (
                    <button onClick={() => del(match.id)} disabled={saving} style={{
                      width: 54, height: 54, borderRadius: 12, border: 'none',
                      background: '#fef2f2', color: '#ef4444', fontSize: 20,
                      cursor: 'pointer', flexShrink: 0, fontWeight: 700,
                    }}>×</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#0c1e52' : '#ef4444',
          color: '#fff', padding: '14px 22px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', maxWidth: '90vw',
          textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
