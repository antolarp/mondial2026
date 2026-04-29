import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints } from '../../lib/scoring'

const PHASES_ORDER = [
  'Groupe A','Groupe B','Groupe C','Groupe D','Groupe E','Groupe F',
  'Groupe G','Groupe H','Groupe I','Groupe J','Groupe K','Groupe L',
  'Huitièmes','Quarts','Demi-finales','Finale',
]

const CARD = {
  background: '#ffffff',
  border: '1px solid #e4e4ec',
  borderRadius: 10,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: '#aaaabc' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#e4e4ec' }} />
    </div>
  )
}

function PtsBadge({ pts }) {
  if (pts === 3) return <span className="text-xs font-bold tabular-nums" style={{ color: '#16a34a' }}>+3</span>
  if (pts === 2) return <span className="text-xs font-bold tabular-nums" style={{ color: '#b8922a' }}>+2</span>
  if (pts === 0) return <span className="text-xs font-bold tabular-nums" style={{ color: '#ccccda' }}>0</span>
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
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#111118' }}>Matchs</h1>

      {phases.map(phase => (
        <section key={phase}>
          <SectionLabel>{phase}</SectionLabel>
          <div className="space-y-2">
            {matchs.filter(m => m.phase === phase).map(match => {
              const res = resultats[match.id]
              const date = new Date(match.date)
              return (
                <div key={match.id} style={CARD} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-xs tabular-nums w-24 shrink-0" style={{ color: '#ccccda' }}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' · '}
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="font-semibold text-sm text-right flex-1 truncate" style={{ color: '#111118' }}>
                        {match.domicile}
                      </span>
                      {res ? (
                        <span className="shrink-0 tabular-nums font-bold text-sm px-3 py-1 rounded-lg"
                          style={{ background: '#f0f0f6', color: '#111118', minWidth: 60, textAlign: 'center' }}>
                          {res.domicile} — {res.exterieur}
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs px-3 py-1 rounded-lg"
                          style={{ background: '#f4f4f8', color: '#ccccda', minWidth: 60, textAlign: 'center' }}>
                          à venir
                        </span>
                      )}
                      <span className="font-semibold text-sm flex-1 truncate" style={{ color: '#111118' }}>
                        {match.exterieur}
                      </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      {joueurs.map(joueur => {
                        const prono = joueur.pronos[match.id]
                        const pts = prono && res ? calculerPoints(prono, res) : null
                        return (
                          <div key={joueur.nom} className="text-center" style={{ minWidth: 44 }}>
                            <p className="text-xs mb-0.5" style={{ color: '#ccccda' }}>{joueur.nom.slice(0, 3)}</p>
                            {prono ? (
                              <p className="text-xs tabular-nums font-medium" style={{ color: '#6666888' }}>
                                {prono.domicile}-{prono.exterieur}
                              </p>
                            ) : (
                              <p className="text-xs" style={{ color: '#e4e4ec' }}>—</p>
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
