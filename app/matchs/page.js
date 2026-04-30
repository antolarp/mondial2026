import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints } from '../../lib/scoring'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Huitièmes','Quarts','Demi-finales','Finale',
]
const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

export default function Matchs() {
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const joueurs = chargerJoueurs()

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a), ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)', paddingBottom: 0 }}>
        <div style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Programme
          </p>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            MATCHS
          </h1>
          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>
        {phases.map(phase => (
          <div key={phase} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>{phase}</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {matchs.filter(m => m.phase === phase).map(match => {
                const res = resultats[match.id]
                const date = new Date(match.date)
                return (
                  <div key={match.id} style={{
                    background: '#fff', borderRadius: 14,
                    border: res ? '1px solid #e8eaf2' : '1px solid #eef0f8',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    padding: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: 20,
                  }}>
                    <span style={{ fontSize: 11, color: '#cbd5e1', width: 80, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', flex: 1, color: '#0f172a' }}>{match.domicile}</span>
                      {res ? (
                        <span style={{
                          background: '#0c1e52', color: '#fff',
                          fontWeight: 800, fontSize: 15, padding: '6px 16px', borderRadius: 10,
                          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em', flexShrink: 0,
                        }}>
                          {res.domicile} – {res.exterieur}
                        </span>
                      ) : (
                        <span style={{
                          background: '#f1f5f9', color: '#cbd5e1',
                          fontSize: 12, padding: '6px 16px', borderRadius: 10, flexShrink: 0,
                        }}>
                          à venir
                        </span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: 14, flex: 1, color: '#0f172a' }}>{match.exterieur}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                      {joueurs.map(joueur => {
                        const prono = joueur.pronos[match.id]
                        const pts = prono && res ? calculerPoints(prono, res) : null
                        return (
                          <div key={joueur.nom} style={{ textAlign: 'center', minWidth: 38 }}>
                            <p style={{ fontSize: 10, color: '#cbd5e1', marginBottom: 2 }}>{joueur.nom.slice(0, 3)}</p>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                              {prono ? `${prono.domicile}-${prono.exterieur}` : '—'}
                            </p>
                            {pts === 3 && <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>+3</p>}
                            {pts === 2 && <p style={{ fontSize: 10, fontWeight: 700, color: '#b8922a' }}>+2</p>}
                            {pts === 0 && <p style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>0</p>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
