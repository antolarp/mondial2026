import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement, calculerPoints } from '../lib/scoring'
import Link from 'next/link'

const MEDAILLES = ['🥇', '🥈', '🥉']

export default function Home() {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const classement = calculerClassement(joueurs, matchs, resultats)

  const matchsJoues = matchs.filter(m => resultats[m.id])
  const dernierMatchs = matchsJoues.slice(-3).reverse()

  return (
    <div className="space-y-10">

      {/* CLASSEMENT */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🏆 <span>Classement général</span>
        </h2>
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl border border-gray-800">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-center">Pts</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Exacts</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Bons</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Joués</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {classement.map((joueur, i) => (
                <tr
                  key={joueur.nom}
                  className={`border-t border-gray-800 hover:bg-gray-800 transition-colors ${i === 0 ? 'bg-yellow-900/20' : ''}`}
                >
                  <td className="px-4 py-4 text-lg">
                    {MEDAILLES[i] ?? <span className="text-gray-500 text-sm">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-4 font-semibold text-lg">{joueur.nom}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                      {joueur.points}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center hidden sm:table-cell">
                    <span className="text-green-400 font-bold">{joueur.exacts}</span>
                    <span className="text-gray-500 text-xs ml-1">× 3pts</span>
                  </td>
                  <td className="px-4 py-4 text-center hidden sm:table-cell">
                    <span className="text-yellow-400 font-bold">{joueur.bons}</span>
                    <span className="text-gray-500 text-xs ml-1">× 2pts</span>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-400 hidden sm:table-cell">{joueur.joues}</td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* DERNIERS RÉSULTATS */}
      {dernierMatchs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">📊 Derniers résultats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dernierMatchs.map(match => {
              const res = resultats[match.id]
              return (
                <div key={match.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-2">{match.phase}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm flex-1">{match.domicile}</span>
                    <span className="bg-green-600 text-white font-bold px-3 py-1 rounded-lg text-lg tracking-widest">
                      {res.domicile} - {res.exterieur}
                    </span>
                    <span className="font-semibold text-sm flex-1 text-right">{match.exterieur}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {classement.map(joueur => {
                      const prono = joueur.pronos[match.id]
                      if (!prono) return null
                      const pts = calculerPoints(prono, res)
                      return (
                        <div key={joueur.nom} className="flex items-center justify-between text-xs text-gray-400">
                          <span>{joueur.nom}</span>
                          <span>
                            {prono.domicile}-{prono.exterieur}
                            <span className={`ml-2 font-bold ${pts === 3 ? 'text-green-400' : pts === 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                              +{pts}pt{pts !== 1 ? 's' : ''}
                            </span>
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
      )}
    </div>
  )
}
