import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints } from '../../lib/scoring'
import { getFlagUrl } from '../../lib/flags'
import { computePronoPhases } from '../../lib/phases'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Seizièmes de finale','Huitièmes de finale','Quarts de finale',
  'Demi-finales','Troisième place','Finale',
]
const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }
const WRAP_CLS = 'page-wrap'

export default function Matchs() {
  const matchs    = chargerMatchs()
  const resultats = chargerResultats()
  const joueurs   = chargerJoueurs()

  // Pour chaque match, savoir si sa phase de pronos est encore ouverte
  const pronoPhases = computePronoPhases(matchs)
  const pronosOuverts = new Set(
    pronoPhases
      .filter(p => p.isOpen)
      .flatMap(p => p.matchs.map(m => m.id))
  )

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a), ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)', paddingBottom: 0 }}>
        <div className={WRAP_CLS} style={{ ...WRAP, paddingTop: 40 }}>
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

      <div className={WRAP_CLS} style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>
        {phases.map(phase => (
          <div key={phase} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>{phase}</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {matchs.filter(m => m.phase === phase).map(match => {
                const res             = resultats[match.id]
                const date            = new Date(match.date)
                const pronosOpen      = pronosOuverts.has(match.id)
                const teamsUnknown    = !match.domicile && !match.exterieur

                return (
                  <div key={match.id} className="match-card-outer" style={{
                    background: '#fff', borderRadius: 14,
                    border: res ? '1px solid #e8eaf2' : '1px solid #eef0f8',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    padding: '12px 18px',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
                  }}>

                    {/* Ligne principale : date + équipes + score */}
                    <div className="match-main-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, color: '#cbd5e1', width: 66, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
                        {/* Équipe domicile */}
                        <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', flex: 1, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minWidth: 0 }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{match.domicile}</span>
                          {getFlagUrl(match.domicile) && <img src={getFlagUrl(match.domicile)} style={{ width: 20, height: 'auto', borderRadius: 2, flexShrink: 0 }} alt="" />}
                        </span>

                        {/* Score */}
                        {res ? (
                          <span style={{
                            background: '#0c1e52', color: '#fff',
                            fontWeight: 800, fontSize: 13, padding: '5px 11px', borderRadius: 9,
                            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em', flexShrink: 0,
                          }}>
                            {res.domicile} – {res.exterieur}
                          </span>
                        ) : (
                          <span style={{
                            background: '#f1f5f9', color: '#cbd5e1',
                            fontSize: 11, padding: '5px 10px', borderRadius: 9, flexShrink: 0,
                          }}>
                            vs
                          </span>
                        )}

                        {/* Équipe extérieure */}
                        <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                          {getFlagUrl(match.exterieur) && <img src={getFlagUrl(match.exterieur)} style={{ width: 20, height: 'auto', borderRadius: 2, flexShrink: 0 }} alt="" />}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{match.exterieur}</span>
                        </span>
                      </div>
                    </div>

                    {/* Pronos joueurs — wrappent en dessous sur mobile */}
                    <div className="match-pronos-row" style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
                      {teamsUnknown ? null : pronosOpen ? (
                        <span style={{
                          fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          🔒 <span>Pronos cachés</span>
                        </span>
                      ) : (
                        joueurs.map(joueur => {
                          const prono = joueur.pronos[match.id]
                          const pts   = prono && res ? calculerPoints(prono, res) : null
                          return (
                            <div key={joueur.nom} style={{ textAlign: 'center', minWidth: 34 }}>
                              <p style={{ fontSize: 9, color: '#cbd5e1', marginBottom: 1 }}>{joueur.nom.slice(0, 3)}</p>
                              <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                {prono ? `${prono.domicile}-${prono.exterieur}` : '—'}
                              </p>
                              {pts === 3 && <p style={{ fontSize: 9, fontWeight: 700, color: '#16a34a' }}>+3</p>}
                              {pts === 2 && <p style={{ fontSize: 9, fontWeight: 700, color: '#b8922a' }}>+2</p>}
                              {pts === 0 && <p style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0' }}>0</p>}
                            </div>
                          )
                        })
                      )}
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
