import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints } from '../../lib/scoring'

const PHASES_ORDER = [
  'Groupe A', 'Groupe B', 'Groupe C', 'Groupe D', 'Groupe E', 'Groupe F',
  'Groupe G', 'Groupe H', 'Groupe I', 'Groupe J', 'Groupe K', 'Groupe L',
  'Huitièmes', 'Quarts', 'Demi-finales', 'Finale',
]

function badgePoints(pts) {
  if (pts === 3) return <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">+3</span>
  if (pts === 2) return <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">+2</span>
  if (pts === 0) return <span className="bg-red-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">0</span>
  return <span className="text-gray-500 text-xs">?</span>
}

export default function Matchs() {
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const joueurs = chargerJoueurs()

  const phases = [...new Set(matchs.map(m => m.phase))]
    .sort((a, b) => {
      const ia = PHASES_ORDER.indexOf(a)
      const ib = PHASES_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold">📅 Tous les matchs</h2>

      {phases.map(phase => (
        <section key={phase}>
          <h3 className="text-lg font-semibold text-blue-400 mb-3 border-b border-gray-800 pb-2">{phase}</h3>
          <div className="space-y-3">
            {matchs.filter(m => m.phase === phase).map(match => {
              const res = resultats[match.id]
              const date = new Date(match.date)
              return (
                <div
                  key={match.id}
                  className={`bg-gray-900 rounded-xl p-4 border ${res ? 'border-gray-700' : 'border-gray-800'}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                      {' · '}
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!res && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full ml-auto">À jouer</span>}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-base flex-1">{match.domicile}</span>
                    {res ? (
                      <span className="bg-green-700 text-white font-black px-4 py-1.5 rounded-xl text-xl tracking-widest">
                        {res.domicile} – {res.exterieur}
                      </span>
                    ) : (
                      <span className="text-gray-600 font-bold text-xl">vs</span>
                    )}
                    <span className="font-bold text-base flex-1 text-right">{match.exterieur}</span>
                  </div>

                  {/* Pronos des joueurs */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {joueurs.map(joueur => {
                      const prono = joueur.pronos[match.id]
                      const pts = prono && res ? calculerPoints(prono, res) : null
                      return (
                        <div key={joueur.nom} className="bg-gray-800 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                          <span className="text-gray-400">{joueur.nom}</span>
                          <span className="flex items-center gap-1.5">
                            {prono ? (
                              <>
                                <span className="font-bold text-white">{prono.domicile}-{prono.exterieur}</span>
                                {pts !== null && badgePoints(pts)}
                              </>
                            ) : (
                              <span className="text-gray-600 italic text-xs">–</span>
                            )}
                          </span>
                        </div>
                      )
                    })}
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
