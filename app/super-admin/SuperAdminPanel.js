'use client'
import { useState } from 'react'
import { getFlagUrl } from '../../lib/flags'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Seizièmes de finale','Huitièmes de finale','Quarts de finale',
  'Demi-finales','Troisième place','Finale',
]
const KNOCKOUT_PHASES = ['Seizièmes de finale','Huitièmes de finale','Quarts de finale','Demi-finales','Troisième place','Finale']
const CONCOURS = ['LesMoches','Famille','Hesias','Bros']

export default function SuperAdminPanel({ matchs, resultats: initRes }) {
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
  const [editingTeams, setEditingTeams] = useState(null)
  const [teamH, setTeamH]     = useState('')
  const [teamA, setTeamA]     = useState('')
  // Mode saisie multiple
  const [batchMode, setBatchMode] = useState(false)
  const [batchScores, setBatchScores] = useState({})
  const [batchSaving, setBatchSaving] = useState(false)
  const [batchProgress, setBatchProgress] = useState(null)

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
    setEditingTeams(null)
    setScoreH(res !== undefined ? String(res.domicile) : '')
    setScoreA(res !== undefined ? String(res.exterieur) : '')
  }

  const openEditTeams = (match) => {
    setEditingTeams(match.id)
    setEditing(null)
    setTeamH(match.domicile || '')
    setTeamA(match.exterieur || '')
  }

  const saveTeams = async (matchId) => {
    if (!teamH.trim() || !teamA.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, matchId, domicile: teamH.trim(), exterieur: teamA.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      const m = matchs.find(x => x.id === matchId)
      if (m) { m.domicile = teamH.trim(); m.exterieur = teamA.trim() }
      setEditingTeams(null)
      showToast(`✅ Équipes mises à jour sur ${data.repos?.length ?? 4} concours`)
    } else {
      showToast(`❌ ${data.error || 'Erreur'}`, false)
    }
    setSaving(false)
  }

  const save = async (matchId) => {
    if (scoreH === '' || scoreA === '') return
    setSaving(true)
    const res = await fetch('/api/admin/multi-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, matchId, domicile: parseInt(scoreH), exterieur: parseInt(scoreA) }),
    })
    const data = await res.json()
    if (res.ok) {
      setResultats(prev => ({ ...prev, [matchId]: { domicile: parseInt(scoreH), exterieur: parseInt(scoreA) } }))
      setEditing(null); setScoreH(''); setScoreA('')
      const m = matchs.find(x => x.id === matchId)
      showToast(`✅ ${m?.domicile} ${scoreH}–${scoreA} ${m?.exterieur} — ${data.repos?.length ?? 4} concours`)
    } else {
      showToast(`❌ ${data.error || 'Erreur'}`, false)
    }
    setSaving(false)
  }

  const del = async (matchId) => {
    if (!confirm('Supprimer ce résultat sur tous les concours ?')) return
    setSaving(true)
    const res = await fetch('/api/admin/multi-result', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, matchId }),
    })
    if (res.ok) {
      setResultats(prev => { const n = { ...prev }; delete n[matchId]; return n })
      setEditing(null)
      showToast('🗑️ Résultat supprimé sur tous les concours')
    }
    setSaving(false)
  }

  // ── Saisie multiple ──
  const setBatch = (matchId, field, val) => {
    setBatchScores(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || {}), [field]: val },
    }))
  }

  const getBatchVal = (matchId, field) => {
    const existing = resultats[matchId]
    const b = batchScores[matchId]
    if (b?.[field] !== undefined) return b[field]
    if (existing !== undefined) return String(existing[field === 'h' ? 'domicile' : 'exterieur'])
    return ''
  }

  const saveAll = async () => {
    const phaseMatchs = matchs.filter(m => m.phase === phase)
    const toSave = phaseMatchs.filter(m => {
      const h = getBatchVal(m.id, 'h')
      const a = getBatchVal(m.id, 'a')
      return h !== '' && a !== ''
    })
    if (!toSave.length) { showToast('Aucun score à enregistrer', false); return }
    setBatchSaving(true)
    let done = 0, errors = 0
    for (const match of toSave) {
      const h = parseInt(getBatchVal(match.id, 'h'))
      const a = parseInt(getBatchVal(match.id, 'a'))
      setBatchProgress(`${match.id} (${done + 1}/${toSave.length})`)
      const res = await fetch('/api/admin/multi-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, matchId: match.id, domicile: h, exterieur: a }),
      })
      if (res.ok) {
        setResultats(prev => ({ ...prev, [match.id]: { domicile: h, exterieur: a } }))
        done++
      } else errors++
    }
    setBatchSaving(false)
    setBatchProgress(null)
    setBatchScores({})
    showToast(errors ? `⚠️ ${done} ok, ${errors} erreurs` : `✅ ${done} score${done > 1 ? 's' : ''} enregistrés`)
  }

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a), ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  /* ── CONNEXION ── */
  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 100%)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 44 }}>🌍</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c1e52', margin: '12px 0 4px' }}>Super Admin</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Scores sur tous les concours</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CONCOURS.map(c => (
              <span key={c} style={{ fontSize: 11, fontWeight: 700, background: '#f0f4ff', color: '#0c1e52', padding: '3px 10px', borderRadius: 20 }}>{c}</span>
            ))}
          </div>
        </div>
        <input
          type="password" placeholder="Mot de passe admin" value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkAuth()}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 16, border: authErr ? '2px solid #ef4444' : '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
          autoFocus
        />
        {authErr && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>Mot de passe incorrect</p>}
        <button onClick={checkAuth} style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #0c1e52, #1a3a7a)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Connexion
        </button>
      </div>
    </div>
  )

  /* ── PANEL ── */
  const phaseMatchs = matchs.filter(m => m.phase === phase)
  const isKnockout = KNOCKOUT_PHASES.includes(phase)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: '#0c1e52', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Super Admin</p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>
            Scores → <span style={{ color: '#f0b429' }}>{CONCOURS.join(' · ')}</span>
          </p>
        </div>
        <a href="/" style={{ color: '#8aaad8', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>← Retour</a>
      </div>

      {/* Onglets phases */}
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e8eaf2' }}>
        {phases.map(p => {
          const label = p.replace('Groupe ', 'Gr.').replace('Seizièmes de finale', '1/16').replace('Huitièmes de finale', '1/8').replace('Quarts de finale', 'Quarts').replace('Troisième place', '3e place')
          const done  = matchs.filter(m => m.phase === p && resultats[m.id] !== undefined).length
          const total = matchs.filter(m => m.phase === p).length
          const full  = done === total
          return (
            <button key={p} onClick={() => { setPhase(p); setEditing(null); setBatchMode(false); setBatchScores({}) }} style={{
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

      {/* Barre actions */}
      <div style={{ padding: '10px 12px', maxWidth: 560, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={() => { setBatchMode(v => !v); setBatchScores({}); setEditing(null) }}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: batchMode ? '#0c1e52' : '#e0e7ff', color: batchMode ? '#fff' : '#0c1e52',
          }}
        >
          {batchMode ? '✕ Saisie individuelle' : '⚡ Saisie multiple'}
        </button>
        {batchMode && (
          <button
            onClick={saveAll}
            disabled={batchSaving}
            style={{
              padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 800, cursor: batchSaving ? 'wait' : 'pointer',
              background: batchSaving ? '#e2e8f0' : '#16a34a', color: batchSaving ? '#94a3b8' : '#fff',
            }}
          >
            {batchSaving ? (batchProgress || '…') : `✓ Enregistrer tout (${CONCOURS.length} concours)`}
          </button>
        )}
      </div>

      {/* Matchs */}
      <div style={{ padding: '0 12px 14px', maxWidth: 560, margin: '0 auto' }}>
        {phaseMatchs.map(match => {
          const res = resultats[match.id]
          const isEditing = editing === match.id
          const isEditingTeams = editingTeams === match.id
          const teamsEmpty = !match.domicile && !match.exterieur
          const date = new Date(match.date)

          if (batchMode) {
            const bh = getBatchVal(match.id, 'h')
            const ba = getBatchVal(match.id, 'a')
            const hasVal = bh !== '' && ba !== ''
            return (
              <div key={match.id} style={{ background: '#fff', borderRadius: 14, marginBottom: 8, border: '1px solid #e8eaf2', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>
                    {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · {match.id}
                  </p>
                  {teamsEmpty ? (
                    <p style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>Équipes non définies</p>
                  ) : (
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {match.domicile} <span style={{ color: '#94a3b8', fontWeight: 400 }}>vs</span> {match.exterieur}
                    </p>
                  )}
                </div>
                <input
                  type="number" min="0" max="20" value={bh}
                  onChange={e => setBatch(match.id, 'h', e.target.value)}
                  placeholder={res !== undefined ? String(res.domicile) : '–'}
                  disabled={teamsEmpty}
                  style={{ width: 46, height: 42, textAlign: 'center', fontSize: 20, fontWeight: 900, borderRadius: 8, border: `2px solid ${hasVal ? '#16a34a' : '#e2e8f0'}`, outline: 'none', flexShrink: 0, background: teamsEmpty ? '#f8fafc' : '#fff' }}
                />
                <span style={{ color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>–</span>
                <input
                  type="number" min="0" max="20" value={ba}
                  onChange={e => setBatch(match.id, 'a', e.target.value)}
                  placeholder={res !== undefined ? String(res.exterieur) : '–'}
                  disabled={teamsEmpty}
                  style={{ width: 46, height: 42, textAlign: 'center', fontSize: 20, fontWeight: 900, borderRadius: 8, border: `2px solid ${hasVal ? '#16a34a' : '#e2e8f0'}`, outline: 'none', flexShrink: 0, background: teamsEmpty ? '#f8fafc' : '#fff' }}
                />
              </div>
            )
          }

          return (
            <div key={match.id} style={{ background: '#fff', borderRadius: 16, marginBottom: 8, border: res !== undefined ? '1px solid #e8eaf2' : '1px solid #eef0f8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{ flex: 1, minWidth: 0, cursor: teamsEmpty ? 'default' : 'pointer' }}
                  onClick={() => { if (!teamsEmpty) isEditing ? setEditing(null) : openEdit(match) }}
                >
                  <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>
                    {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}{date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {teamsEmpty ? (
                    <p style={{ fontSize: 13, color: '#cbd5e1', fontStyle: 'italic' }}>Équipes non définies</p>
                  ) : (
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {match.domicile}
                      {getFlagUrl(match.domicile) && <img src={getFlagUrl(match.domicile)} style={{ width: 20, height: 'auto', borderRadius: 2 }} alt="" />}
                      <span style={{ color: '#cbd5e1', fontWeight: 400, margin: '0 2px' }}>vs</span>
                      {getFlagUrl(match.exterieur) && <img src={getFlagUrl(match.exterieur)} style={{ width: 20, height: 'auto', borderRadius: 2 }} alt="" />}
                      {match.exterieur}
                    </p>
                  )}
                </div>

                {/* Bouton équipes : toujours visible en phase éliminatoire */}
                {(teamsEmpty || isKnockout) && (
                  <button onClick={() => isEditingTeams ? setEditingTeams(null) : openEditTeams(match)} style={{
                    padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: isEditingTeams ? '#0c1e52' : '#f8fafc',
                    color: isEditingTeams ? '#fff' : '#64748b',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  }}>
                    ✏️
                  </button>
                )}

                {/* Score */}
                {!teamsEmpty && (res !== undefined ? (
                  <span
                    onClick={() => isEditing ? setEditing(null) : openEdit(match)}
                    style={{ background: '#0c1e52', color: '#fff', fontWeight: 800, fontSize: 15, padding: '5px 14px', borderRadius: 8, fontVariantNumeric: 'tabular-nums', flexShrink: 0, cursor: 'pointer' }}
                  >
                    {res.domicile} – {res.exterieur}
                  </span>
                ) : (
                  <span onClick={() => openEdit(match)} style={{ fontSize: 20, color: '#cbd5e1', fontWeight: 300, flexShrink: 0, cursor: 'pointer' }}>＋</span>
                ))}
              </div>

              {/* Saisie équipes */}
              {isEditingTeams && (
                <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbff', padding: '14px 16px' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>Définir les équipes</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="text" value={teamH} onChange={e => setTeamH(e.target.value)} placeholder="Équipe domicile" autoFocus
                      style={{ flex: 1, height: 44, padding: '0 12px', fontSize: 14, fontWeight: 600, borderRadius: 10, border: '2px solid #e2e8f0', outline: 'none' }} />
                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>vs</span>
                    <input type="text" value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="Équipe extérieur"
                      onKeyDown={e => e.key === 'Enter' && saveTeams(match.id)}
                      style={{ flex: 1, height: 44, padding: '0 12px', fontSize: 14, fontWeight: 600, borderRadius: 10, border: '2px solid #e2e8f0', outline: 'none' }} />
                    <button onClick={() => saveTeams(match.id)} disabled={saving || !teamH.trim() || !teamA.trim()}
                      style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: (saving || !teamH.trim() || !teamA.trim()) ? '#e2e8f0' : '#0c1e52', color: (saving || !teamH.trim() || !teamA.trim()) ? '#94a3b8' : '#fff', fontWeight: 800, fontSize: 14, cursor: saving ? 'wait' : 'pointer', flexShrink: 0 }}>
                      {saving ? '…' : '✓'}
                    </button>
                  </div>
                </div>
              )}

              {/* Saisie score */}
              {isEditing && (
                <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbff', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="number" min="0" max="20" value={scoreH} onChange={e => setScoreH(e.target.value)} onKeyDown={e => e.key === 'Enter' && save(match.id)} placeholder="0" autoFocus
                      style={{ width: 60, height: 54, textAlign: 'center', fontSize: 26, fontWeight: 900, borderRadius: 12, border: '2px solid #e2e8f0', outline: 'none', flexShrink: 0 }} />
                    <span style={{ fontSize: 20, color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>–</span>
                    <input type="number" min="0" max="20" value={scoreA} onChange={e => setScoreA(e.target.value)} onKeyDown={e => e.key === 'Enter' && save(match.id)} placeholder="0"
                      style={{ width: 60, height: 54, textAlign: 'center', fontSize: 26, fontWeight: 900, borderRadius: 12, border: '2px solid #e2e8f0', outline: 'none', flexShrink: 0 }} />
                    <button onClick={() => save(match.id)} disabled={saving || scoreH === '' || scoreA === ''}
                      style={{ flex: 1, height: 54, borderRadius: 12, border: 'none', background: (saving || scoreH === '' || scoreA === '') ? '#e2e8f0' : '#16a34a', color: (saving || scoreH === '' || scoreA === '') ? '#94a3b8' : '#fff', fontWeight: 800, fontSize: 15, cursor: saving ? 'wait' : 'pointer' }}>
                      {saving ? '…' : `✓ Tous (${CONCOURS.length})`}
                    </button>
                    {res !== undefined && (
                      <button onClick={() => del(match.id)} disabled={saving}
                        style={{ width: 54, height: 54, borderRadius: 12, border: 'none', background: '#fef2f2', color: '#ef4444', fontSize: 20, cursor: 'pointer', flexShrink: 0, fontWeight: 700 }}>×</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: toast.ok ? '#0c1e52' : '#ef4444', color: '#fff', padding: '14px 22px', borderRadius: 14, fontWeight: 700, fontSize: 14, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
