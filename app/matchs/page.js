import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints } from '../../lib/scoring'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Huitièmes','Quarts','Demi-finales','Finale',
]

const CARD = { background: '#11111a', border: '1px solid #1c1c2e', borderRadius: 12 }

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#52526e' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#1c1c2e' }} />
    </div>
  )
}

function PtsBadge({ pts }) {
  if (pts === 3) return <span className="text-xs font-bold tabular-nums" style={{ color: '#4ade80' }}>+3</span>
  if (pts === 2) return <span className="text-xs font-bold tabular-nums" style={{ color: '#c8a84b' }}>+2</span>
  if (pts === 0) return <span className="text-xs font-bold tabular-nums" style={{ color: '#3a3a52' }}>0</span>
  return null
}

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
    <div className="space-y-12">
      <h1 className="text-2xl font-bold text-white tracking-tight">Matchs</h1>

      {phases.map(phase => (
        <section key={phase}>
          <SectionLabel>{phase}</SectionLabel>
          <div className="space-y-2">
            {matchs.filter(m => m.phase === phase).map(match => {
              const res = resultats[match.id]
              const date = new Date(match.date)
              return (
                <div key={match.id} style={CARD} className="px-5 py-4">
                  <div className="flex items-center gap-6">
                    <span className="text-xs tabular-nums w-24 shrink-0" style={{ color: '#3a3a52' }}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-medium text-sm text-white text-right flex-1 truncate">{match.domicile}</span>

                      {res ? (
                        <span className="shrink-0 tabular-nums font-bold text-base px-3 py-0.5 rounded"
                          style={{ background: '#1c1c2e', color: '#e2e2ee', minWidth: 56, textAlign: 'center' }}>
                          {res.domicile} — {res.exterieur}
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs px-3 py-0.5 rounded"
                          style={{ background: '#1c1c2e', color: '#3a3a52', minWidth: 56, textAlign: 'center' }}>
                          à venir
                        </span>
                      )}

                      <span className="font-medium text-sm text-white flex-1 truncate">{match.exterieur}</span>
                    </div>

                    {/* Pronos */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      {joueurs.map(joueur => {
                        const prono = joueur.pronos[match.id]
                        const pts = prono && res ? calculerPoints(prono, res) : null
                        return (
                          <div key={joueur.nom} className="text-center" style={{ minWidth: 44 }}>
                            <p className="text-xs mb-0.5" style={{ color: '#3a3a52' }}>{joueur.nom.slice(0, 3)}</p>
                            {prono ? (
                              <p className="text-xs tabular-nums" style={{ color: '#8888a8' }}>
                                {prono.domicile}-{prono.exterieur}
                              </p>
                            ) : (
                              <p className="text-xs" style={{ color: '#1c1c2e' }}>—</p>
                            )}
                            {pts !== null && <PtsBadge pts={pts} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
