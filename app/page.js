import Link from 'next/link'
import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../lib/scoring'
import { calculerEvolution, calculerPlaces, calculerPourcentages, calculerExacts } from '../lib/stats'
import { EvolutionChart, ExactsChart, PourcentagesChart, PlacesChart } from '../components/Charts'
import { PLAYER_COLORS } from '../lib/colors'

const MEDAILLES = ['🥇', '🥈', '🥉']

function StatCard({ label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-900/60 to-blue-800/30 border-blue-700/40',
    gold: 'from-yellow-900/60 to-yellow-800/30 border-yellow-700/40',
    green: 'from-emerald-900/60 to-emerald-800/30 border-emerald-700/40',
    purple: 'from-purple-900/60 to-purple-800/30 border-purple-700/40',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl px-5 py-4`}>
      <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function Podium({ classement }) {
  const top3 = classement.slice(0, 3)
  const order = [1, 0, 2]
  const heights = ['h-20', 'h-28', 'h-14']
  const sizes = ['text-4xl', 'text-5xl', 'text-3xl']

  return (
    <div className="flex items-end justify-center gap-2 pt-6 pb-2">
      {order.map((idx, col) => {
        const joueur = top3[idx]
        if (!joueur) return null
        return (
          <Link key={joueur.nom} href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
            className="flex flex-col items-center gap-2 group w-32">
            <span className={`${sizes[col]} transition-transform group-hover:scale-110`}>
              {MEDAILLES[idx]}
            </span>
            <p className="font-bold text-sm text-white">{joueur.nom}</p>
            <p className="text-xs text-zinc-400">{joueur.points} pts</p>
            <div className={`${heights[col]} w-full rounded-t-xl flex items-center justify-center
              ${idx === 0 ? 'bg-gradient-to-b from-yellow-500 to-yellow-700' :
                idx === 1 ? 'bg-gradient-to-b from-zinc-400 to-zinc-600' :
                'bg-gradient-to-b from-amber-700 to-amber-900'}
              text-white font-black text-xl`}>
              {idx + 1}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default function Home() {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const classement = calculerClassement(joueurs, matchs, resultats)

  const matchsJoues = matchs.filter(m => resultats[m.id]).length
  const evolution = calculerEvolution(joueurs, matchs, resultats)
  const { premiere, derniere } = calculerPlaces(joueurs, matchs, resultats)
  const pourcentages = calculerPourcentages(joueurs, resultats)
  const exacts = calculerExacts(joueurs, resultats)
  const nomsJoueurs = joueurs.map(j => j.nom)

  return (
    <div className="space-y-10">

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Matchs joués" value={matchsJoues} sub={`sur ${matchs.length}`} color="blue" />
        <StatCard label="Leader" value={classement[0]?.nom ?? '—'} sub={`${classement[0]?.points ?? 0} pts`} color="gold" />
        <StatCard label="Participants" value={joueurs.length} sub="joueurs" color="purple" />
        <StatCard
          label="Meilleur %"
          value={`${Math.max(...pourcentages.map(p => p.pourcentage))}%`}
          sub={pourcentages.sort((a,b) => b.pourcentage - a.pourcentage)[0]?.nom}
          color="green"
        />
      </div>

      {/* PODIUM */}
      <section>
        <h2 className="text-xl font-bold text-zinc-300 mb-2 text-center tracking-wide uppercase text-sm">Podium</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <Podium classement={classement} />
        </div>
      </section>

      {/* CLASSEMENT COMPLET */}
      <section>
        <h2 className="text-2xl font-black mb-4">🏆 Classement</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Joueur</th>
                <th className="px-4 py-3 text-center">Pts</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">🎯 Exacts</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">✓ Bons</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">% réussite</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Joués</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {classement.map((joueur, i) => {
                const pct = pourcentages.find(p => p.nom === joueur.nom)?.pourcentage ?? 0
                const couleur = PLAYER_COLORS[nomsJoueurs.indexOf(joueur.nom) % PLAYER_COLORS.length]
                return (
                  <tr key={joueur.nom}
                    className={`border-t border-zinc-800/60 hover:bg-zinc-800/50 transition-colors ${i === 0 ? 'bg-yellow-950/20' : ''}`}>
                    <td className="px-4 py-3.5 text-lg w-10">
                      {i < 3 ? MEDAILLES[i] : <span className="text-zinc-600 text-sm font-bold">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: couleur }} />
                        <span className="font-bold text-white">{joueur.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="bg-blue-600 text-white font-black px-3 py-1 rounded-full text-sm tabular-nums">
                        {joueur.points}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-emerald-400 font-bold">{joueur.exacts}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-yellow-400 font-bold">{joueur.bons}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden md:table-cell">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 bg-zinc-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-zinc-400 text-xs tabular-nums">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center text-zinc-500 hidden md:table-cell text-sm">{joueur.joues}</td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                        Voir →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* GRAPHIQUES */}
      {evolution.length > 0 && (
        <>
          <section>
            <h2 className="text-2xl font-black mb-1">📈 Évolution des points</h2>
            <p className="text-zinc-500 text-sm mb-4">Points cumulés après chaque match joué</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <EvolutionChart data={evolution} joueurs={nomsJoueurs} />
            </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <section>
              <h2 className="text-xl font-black mb-1">🎯 Scores exacts (3 pts)</h2>
              <p className="text-zinc-500 text-sm mb-4">Nombre de scores devinés parfaitement</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <ExactsChart data={exacts} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black mb-1">✅ % de bons pronos</h2>
              <p className="text-zinc-500 text-sm mb-4">Score ≥ 2pts sur matchs joués</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <PourcentagesChart data={pourcentages} />
              </div>
            </section>
          </div>

          <section>
            <h2 className="text-2xl font-black mb-1">👑 Passages en tête / lanterne rouge</h2>
            <p className="text-zinc-500 text-sm mb-4">Nombre de fois 1er ou dernier après chaque match</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <PlacesChart premiere={premiere} derniere={derniere} joueurs={nomsJoueurs} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
