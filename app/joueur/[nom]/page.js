import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints, calculerClassement } from '../../../lib/scoring'
import { notFound } from 'next/navigation'

export default function PageJoueur({ params }) {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()

  const joueur = joueurs.find(j => j.nom.toLowerCase() === decodeURIComponent(params.nom))
  if (!joueur) notFound()

  const classement = calculerClassement(joueurs, matchs, resultats)
  const stats = classement.find(j => j.nom === joueur.nom)
  const rang = classement.findIndex(j => j.nom === joueur.nom) + 1

  const matchsAvecProno = matchs.filter(m => joueur.pronos[m.id])

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 flex items-center gap-6">
        <div className="text-6xl">
          {rang === 1 ? '🥇' : rang === 2 ? '🥈' : rang === 3 ? '🥉' : '⚽'}
        </div>
        <div>
          <h2 className="text-3xl font-black">{joueur.nom}</h2>
          <p className="text-blue-300">#{rang} au classement</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full">{stats.points} pts</span>
            <span className="text-green-400">🎯 {stats.exacts} exacts</span>
            <span className="text-yellow-400">✓ {stats.bons} bons</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Ses pronos</h3>
        <div className="space-y-3">
          {matchsAvecProno.map(match => {
            const prono = joueur.pronos[match.id]
            const res = resultats[match.id]
            const pts = res ? calculerPoints(prono, res) : null
            const date = new Date(match.date)
            return (
              <div
                key={match.id}
                className={`bg-gray-900 rounded-xl p-4 border flex items-center gap-4 ${
                  pts === 3 ? 'border-green-600' : pts === 2 ? 'border-yellow-600' : pts === 0 ? 'border-red-900' : 'border-gray-800'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    {match.phase} · {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{match.domicile}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="truncate">{match.exterieur}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 mb-1">Prono</p>
                  <span className="font-bold text-white">{prono.domicile}-{prono.exterieur}</span>
                </div>
                {res && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Résultat</p>
                    <span className="font-bold text-green-400">{res.domicile}-{res.exterieur}</span>
                  </div>
                )}
                <div className="shrink-0 w-12 text-center">
                  {pts === 3 && <span className="text-green-400 font-black text-lg">+3</span>}
                  {pts === 2 && <span className="text-yellow-400 font-black text-lg">+2</span>}
                  {pts === 0 && <span className="text-red-500 font-black text-lg">0</span>}
                  {pts === null && <span className="text-gray-600 text-sm">?</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
