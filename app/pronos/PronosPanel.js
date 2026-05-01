'use client'
import { useState } from 'react'

export default function PronosPanel({ phases, joueurs }) {
  const [step, setStep]             = useState('login')
  const [nomSelected, setNomSelected] = useState('')
  const [code, setCode]             = useState('')
  const [codeError, setCodeError]   = useState('')
  const [checking, setChecking]     = useState(false)
  const [activePhaseId, setActivePhaseId] = useState(
    () => (phases.find(p => p.isOpen) ?? phases[0])?.id ?? ''
  )
  const [localPronos, setLocalPronos] = useState({})
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState(null)
  const [savedPhases, setSavedPhases] = useState(new Set())
  const [showChangeCode, setShowChangeCode] = useState(false)
  const [newCode, setNewCode]       = useState('')
  const [newCode2, setNewCode2]     = useState('')
  const [changingCode, setChangingCode] = useState(false)
  const [changeCodeError, setChangeCodeError] = useState('')

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 5000)
  }

  // ── Login ──────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!nomSelected || !code) return
    setChecking(true)
    setCodeError('')
    try {
      const res = await fetch('/api/pronos/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: nomSelected, code }),
      })
      if (res.ok) {
        const joueur = joueurs.find(j => j.nom === nomSelected)
        if (joueur?.pronos) setLocalPronos({ ...joueur.pronos })
        setStep('pronos')
      } else {
        const data = await res.json()
        setCodeError(data.error || 'Erreur de connexion')
      }
    } catch {
      setCodeError('Erreur réseau')
    }
    setChecking(false)
  }

  // ── Score helpers ──────────────────────────────────────────────
  const setScore = (matchId, side, value) => {
    const raw = value.replace(/[^0-9]/g, '')
    if (raw === '') {
      setLocalPronos(prev => {
        const next = { ...prev }
        if (next[matchId]) {
          next[matchId] = { ...next[matchId] }
          delete next[matchId][side]
          if (Object.keys(next[matchId]).length === 0) delete next[matchId]
        }
        return next
      })
      return
    }
    const num = Math.min(parseInt(raw, 10), 20)
    setLocalPronos(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] ?? {}), [side]: num },
    }))
  }

  const hasPrno = (matchId) => {
    const p = localPronos[matchId]
    return p && typeof p.domicile === 'number' && typeof p.exterieur === 'number'
  }

  const countFilled = (phase) => phase?.matchs.filter(m => hasPrno(m.id)).length ?? 0

  // ── Changement de code ────────────────────────────────────────
  const handleChangeCode = async () => {
    if (!newCode || !newCode2) return
    if (newCode !== newCode2) { setChangeCodeError('Les codes ne correspondent pas'); return }
    if (newCode.length < 4)   { setChangeCodeError('4 caractères minimum'); return }
    setChangingCode(true)
    setChangeCodeError('')
    try {
      const res = await fetch('/api/pronos/change-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: nomSelected, currentCode: code, newCode }),
      })
      const data = await res.json()
      if (res.ok) {
        setCode(newCode)
        setShowChangeCode(false)
        setNewCode(''); setNewCode2('')
        showToast('✅ Code mis à jour !')
      } else {
        setChangeCodeError(data.error || 'Erreur')
      }
    } catch {
      setChangeCodeError('Erreur réseau')
    }
    setChangingCode(false)
  }

  // ── Submit ─────────────────────────────────────────────────────
  const activePhase = phases.find(p => p.id === activePhaseId)
  const isOpen = activePhase?.deadlineISO
    ? new Date() < new Date(activePhase.deadlineISO)
    : false
  const filledCount = countFilled(activePhase)
  const totalCount  = activePhase?.matchs.length ?? 0

  const handleSubmit = async () => {
    if (!activePhase || !isOpen) return
    if (filledCount < totalCount) {
      showToast(`⚠️ Remplis tous les scores (${filledCount}/${totalCount})`, false)
      return
    }
    setSaving(true)
    const matchIds  = activePhase.matchs.map(m => m.id)
    const pronosData = {}
    matchIds.forEach(id => { if (localPronos[id]) pronosData[id] = localPronos[id] })

    try {
      const res = await fetch('/api/pronos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: nomSelected, code, pronos: pronosData, matchIds }),
      })
      const data = await res.json()
      if (res.ok) {
        setSavedPhases(prev => new Set([...prev, activePhaseId]))
        showToast(`✅ Pronos sauvegardés ! Site à jour dans ~45s`)
      } else {
        showToast(`❌ ${data.error || 'Erreur'}`, false)
      }
    } catch {
      showToast('❌ Erreur réseau', false)
    }
    setSaving(false)
  }

  // ── ÉCRAN LOGIN ────────────────────────────────────────────────
  if (step === 'login') return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 100%)', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 32px',
        width: '100%', maxWidth: 380, boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 44 }}>🎯</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0c1e52', margin: '12px 0 4px' }}>
            Mes Pronos
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Mondial 2026</p>
        </div>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Ton nom
        </label>
        <select
          value={nomSelected}
          onChange={e => setNomSelected(e.target.value)}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 15,
            border: '2px solid #e2e8f0', outline: 'none', boxSizing: 'border-box',
            marginBottom: 20, background: '#fff', color: nomSelected ? '#0f172a' : '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <option value="">— Choisir —</option>
          {joueurs.map(j => (
            <option key={j.nom} value={j.nom}>{j.nom}</option>
          ))}
        </select>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Ton code PIN
        </label>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="• • • •"
          maxLength={8}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/[^0-9]/g, '')); setCodeError('') }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 24,
            letterSpacing: '0.3em', textAlign: 'center',
            border: codeError ? '2px solid #ef4444' : '2px solid #e2e8f0',
            outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
          autoFocus={false}
        />
        {codeError && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
            {codeError}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={!nomSelected || !code || checking}
          style={{
            width: '100%', padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 800,
            background: (!nomSelected || !code || checking)
              ? '#e2e8f0'
              : 'linear-gradient(135deg, #0c1e52, #1a3a7a)',
            color: (!nomSelected || !code || checking) ? '#94a3b8' : '#fff',
            border: 'none',
            cursor: (!nomSelected || !code || checking) ? 'default' : 'pointer',
            marginTop: 8,
          }}
        >
          {checking ? 'Vérification…' : 'Accéder à mes pronos →'}
        </button>
      </div>
    </div>
  )

  // ── ÉCRAN PRONOS ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#f0f2f8', paddingBottom: isOpen ? 100 : 40 }}>

      {/* Sous-header sticky */}
      <div style={{
        background: '#0c1e52', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 56, zIndex: 10,
      }}>
        <div>
          <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
            Mes pronos
          </p>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>
            {nomSelected}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => { setShowChangeCode(v => !v); setNewCode(''); setNewCode2(''); setChangeCodeError('') }}
            style={{ color: showChangeCode ? '#f0b429' : '#8aaad8', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            🔑 Mon code
          </button>
          <button
            onClick={() => { setStep('login'); setCode(''); setCodeError('') }}
            style={{ color: '#8aaad8', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Quitter ↗
          </button>
        </div>
      </div>

      {/* Panneau changement de code */}
      {showChangeCode && (
        <div style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '20px 20px', maxWidth: 560, margin: '0 auto',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0c1e52', marginBottom: 4 }}>
            🔑 Choisir mon code PIN
          </p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>4 à 8 chiffres</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Nouveau PIN"
              maxLength={8}
              value={newCode}
              onChange={e => { setNewCode(e.target.value.replace(/[^0-9]/g, '')); setChangeCodeError('') }}
              style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 22,
                letterSpacing: '0.3em', textAlign: 'center',
                border: '2px solid #e2e8f0', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Confirmer le PIN"
              maxLength={8}
              value={newCode2}
              onChange={e => { setNewCode2(e.target.value.replace(/[^0-9]/g, '')); setChangeCodeError('') }}
              onKeyDown={e => e.key === 'Enter' && handleChangeCode()}
              style={{
                padding: '12px 14px', borderRadius: 10, fontSize: 22,
                letterSpacing: '0.3em', textAlign: 'center',
                border: changeCodeError ? '2px solid #ef4444' : '2px solid #e2e8f0',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
            {changeCodeError && (
              <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>{changeCodeError}</p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleChangeCode}
                disabled={!newCode || !newCode2 || changingCode}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: (!newCode || !newCode2 || changingCode) ? '#e2e8f0' : '#0c1e52',
                  color: (!newCode || !newCode2 || changingCode) ? '#94a3b8' : '#fff',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {changingCode ? '…' : 'Valider'}
              </button>
              <button
                onClick={() => { setShowChangeCode(false); setNewCode(''); setNewCode2(''); setChangeCodeError('') }}
                style={{
                  padding: '12px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onglets phases */}
      <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e8eaf2' }}>
        {phases.map(p => {
          const isActive = p.id === activePhaseId
          const isSaved  = savedPhases.has(p.id)
          const phaseOpen = p.deadlineISO ? new Date() < new Date(p.deadlineISO) : false

          return (
            <button key={p.id} onClick={() => setActivePhaseId(p.id)} style={{
              display: 'inline-block', marginRight: 6, padding: '7px 14px', borderRadius: 20,
              background: isActive ? '#0c1e52' : isSaved ? '#f0fdf4' : phaseOpen ? '#eff6ff' : '#f8fafc',
              color: isActive ? '#fff' : isSaved ? '#16a34a' : phaseOpen ? '#1d4ed8' : '#94a3b8',
              border: isActive ? 'none' : isSaved ? '1px solid #bbf7d0' : phaseOpen ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {isSaved && '✓ '}
              {p.shortLabel}
              {phaseOpen && !isSaved && (
                <span style={{ fontSize: 9, marginLeft: 4, background: '#dbeafe', color: '#1d4ed8', padding: '1px 5px', borderRadius: 4, verticalAlign: 'middle' }}>
                  OUVERT
                </span>
              )}
              {!phaseOpen && (
                <span style={{ marginLeft: 4, fontSize: 11 }}>🔒</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Barre info phase */}
      {activePhase && (
        <div style={{
          padding: '10px 16px',
          background: isOpen ? '#eff6ff' : '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: isOpen ? '#1e40af' : '#64748b', marginBottom: 2 }}>
              {isOpen ? '🟢 Phase ouverte' : '🔒 Phase verrouillée'}
            </p>
            {activePhase.deadlineISO && (
              <p style={{ fontSize: 11, color: '#94a3b8' }}>
                {isOpen ? 'Fermeture le ' : 'Fermée le '}
                {new Date(activePhase.deadlineISO).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
                {' à 23h59'}
              </p>
            )}
          </div>
          <span style={{
            fontSize: 15, fontWeight: 800,
            color: filledCount === totalCount ? '#16a34a' : isOpen ? '#1d4ed8' : '#94a3b8',
          }}>
            {filledCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Liste des matchs */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '12px 12px 0' }}>
        {activePhase?.matchs.map(match => {
          const prono = localPronos[match.id]
          const dom   = prono?.domicile
          const ext   = prono?.exterieur
          const done  = typeof dom === 'number' && typeof ext === 'number'
          const date  = new Date(match.date)

          return (
            <div key={match.id} style={{
              background: '#fff', borderRadius: 16, marginBottom: 8,
              border: done ? '1.5px solid #0c1e52' : '1px solid #e8eaf2',
              boxShadow: done ? '0 2px 8px rgba(12,30,82,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
              padding: '12px 14px',
              opacity: !isOpen && !done ? 0.6 : 1,
            }}>
              <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>
                {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' · '}
                {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Équipe domicile */}
                <span style={{
                  flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a',
                  textAlign: 'right', lineHeight: 1.3, minWidth: 0,
                }}>
                  {match.domicile}
                </span>

                {isOpen ? (
                  /* Inputs éditables */
                  <>
                    <input
                      type="number" inputMode="numeric" min="0" max="20"
                      value={typeof dom === 'number' ? dom : ''}
                      onChange={e => setScore(match.id, 'domicile', e.target.value)}
                      placeholder="–"
                      style={{
                        width: 52, height: 50, textAlign: 'center', fontSize: 22,
                        fontWeight: 900, borderRadius: 10, flexShrink: 0,
                        border: typeof dom === 'number' ? '2px solid #0c1e52' : '2px solid #e2e8f0',
                        outline: 'none', color: '#0c1e52',
                      }}
                    />
                    <span style={{ fontSize: 18, color: '#cbd5e1', fontWeight: 700, flexShrink: 0 }}>–</span>
                    <input
                      type="number" inputMode="numeric" min="0" max="20"
                      value={typeof ext === 'number' ? ext : ''}
                      onChange={e => setScore(match.id, 'exterieur', e.target.value)}
                      placeholder="–"
                      style={{
                        width: 52, height: 50, textAlign: 'center', fontSize: 22,
                        fontWeight: 900, borderRadius: 10, flexShrink: 0,
                        border: typeof ext === 'number' ? '2px solid #0c1e52' : '2px solid #e2e8f0',
                        outline: 'none', color: '#0c1e52',
                      }}
                    />
                  </>
                ) : (
                  /* Lecture seule */
                  <span style={{
                    background: done ? '#0c1e52' : '#e2e8f0',
                    color: done ? '#fff' : '#94a3b8',
                    fontWeight: 800, fontSize: 15,
                    padding: '7px 16px', borderRadius: 10, flexShrink: 0,
                  }}>
                    {done ? `${dom} – ${ext}` : '? – ?'}
                  </span>
                )}

                {/* Équipe extérieure */}
                <span style={{
                  flex: 1, fontSize: 13, fontWeight: 700, color: '#0f172a',
                  textAlign: 'left', lineHeight: 1.3, minWidth: 0,
                }}>
                  {match.exterieur}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barre de validation sticky en bas */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e2e8f0',
          padding: '14px 20px', zIndex: 20,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              width: '100%', maxWidth: 560, display: 'block', margin: '0 auto',
              padding: 16, borderRadius: 14, fontSize: 15, fontWeight: 800,
              background: saving
                ? '#94a3b8'
                : filledCount === totalCount
                  ? 'linear-gradient(135deg, #16a34a, #15803d)'
                  : 'linear-gradient(135deg, #0c1e52, #1a3a7a)',
              color: '#fff', border: 'none',
              cursor: saving ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving
              ? 'Enregistrement…'
              : filledCount === totalCount
                ? `✅ Valider mes ${totalCount} pronos`
                : `Valider (${filledCount}/${totalCount} remplis)`}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: isOpen ? 90 : 28,
          left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#0c1e52' : '#ef4444',
          color: '#fff', padding: '14px 22px', borderRadius: 14,
          fontWeight: 700, fontSize: 14, zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          whiteSpace: 'pre-line', maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
