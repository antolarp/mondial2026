import Link from 'next/link'
import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../lib/scoring'
import { calculerEvolution, calculerPlaces, calculerPourcentages, calculerExacts } from '../lib/stats'
import { EvolutionChart, ExactsChart, PourcentagesChart, PlacesChart } from '../components/Charts'
import { PLAYER_COLORS } from '../lib/colors'

const CARD = { background: '#11111a', border: '1px solid #1c1c2e', borderRadius: 16 }
const CARD_SM = { background: '#11111a', border: '1px solid #1c1c2e', borderRadius: 12 }

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#52526e' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#1c1c2e' }} />
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={CARD_SM} className="px-5 py-4">
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#52526e' }}>{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: '#52526e' }}>{sub}</p>}
    </div>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-sm font-bold" style={{ color: '#c8a84b' }}>01</span>
  if (rank === 2) return <span className="text-sm font-bold" style={{ color: '#9aa0a6' }}>02</span>
  if (rank === 3) return <span className="text-sm font-bold" style={{ color: '#a07050' }}>03</span>
  return <span className="text-sm font-bold" style={{ color: '#3a3a52' }}>0{rank > 9 ? rank : `${rank}`}</span>
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
  const meilleurPct = [...pourcentages].sort((a, b) => b.pourcentage - a.pourcentage)[0]

  return (
    <div className="space-y-12">

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Matchs joués" value={matchsJoues} sub={`sur ${matchs.length} au programme`} />
        <StatCard label="En tête" value={classement[0]?.nom ?? '—'} sub={`${classement[0]?.points ?? 0} points`} />
        <StatCard label="Participants" value={joueurs.length} sub="joueurs en compétition" />
        <StatCard label="Meilleur taux" value={`${meilleurPct?.pourcentage ?? 0}%`} sub={meilleurPct?.nom} />
      </div>

      {/* CLASSEMENT */}
      <section>
        <SectionLabel>Classement général</SectionLabel>
        <div style={CARD} className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c2e' }}>
                {['#', 'Joueur', 'Points', 'Exacts', 'Bons', 'Taux', 'Joués', ''].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-3.5 text-left text-xs uppercase tracking-widest font-medium
                      ${i >= 4 ? 'hidden md:table-cell' : i === 3 ? 'hidden sm:table-cell' : ''}
                      ${i === 2 ? 'text-center' : ''}
                      ${i >= 3 ? 'text-center' : ''}`}
                    style={{ color: '#3a3a52' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classement.map((joueur, i) => {
                const pct = pourcentages.find(p => p.nom === joueur.nom)?.pourcentage ?? 0
                const color = PLAYER_COLORS[nomsJoueurs.indexOf(joueur.nom) % PLAYER_COLORS.length]
                return (
                  <tr key={joueur.nom}
                    style={{ borderTop: '1px solid #1c1c2e' }}
                    className="transition-colors duration-100 hover:bg-white/[0.02]">
                    <td className="px-5 py-4 w-12">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color, opacity: 0.9 }} />
                        <span className="font-medium text-white text-sm">{joueur.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-white font-bold tabular-nums">{joueur.points}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className="tabular-nums text-sm font-medium" style={{ color: '#4ade80' }}>{joueur.exacts}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className="tabular-nums text-sm" style={{ color: '#c8a84b' }}>{joueur.bons}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2.5 justify-center">
                        <div className="w-16 h-0.5 rounded-full" style={{ background: '#1c1c2e' }}>
                          <div className="h-0.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-xs tabular-nums" style={{ color: '#52526e' }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className="text-xs tabular-nums" style={{ color: '#3a3a52' }}>{joueur.joues}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
                        className="text-xs tracking-wide transition-colors duration-150"
                        style={{ color: '#3a3a52' }}
                        onMouseOver={e => e.target.style.color = '#e2e2ee'}
                        onMouseOut={e => e.target.style.color = '#3a3a52'}>
                        Détail →
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
            <SectionLabel>Évolution des points</SectionLabel>
            <div style={CARD} className="p-6">
              <EvolutionChart data={evolution} joueurs={nomsJoueurs} />
            </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <section>
              <SectionLabel>Scores exacts</SectionLabel>
              <div style={CARD} className="p-6">
                <ExactsChart data={exacts} />
              </div>
            </section>
            <section>
              <SectionLabel>Taux de réussite</SectionLabel>
              <div style={CARD} className="p-6">
                <PourcentagesChart data={pourcentages} />
              </div>
            </section>
          </div>

          <section>
            <SectionLabel>Passages en tête / lanterne rouge</SectionLabel>
            <div style={CARD} className="p-6">
              <PlacesChart premiere={premiere} derniere={derniere} joueurs={nomsJoueurs} />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
