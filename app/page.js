import Link from 'next/link'
import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../lib/scoring'
import { calculerEvolution, calculerPlaces, calculerPourcentages, calculerExacts } from '../lib/stats'
import { EvolutionChart, ExactsChart, PourcentagesChart, PlacesChart } from '../components/Charts'
import { PLAYER_COLORS } from '../lib/colors'

const CARD = {
  background: '#ffffff',
  border: '1px solid #e4e4ec',
  borderRadius: 16,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}
const CARD_SM = {
  background: '#ffffff',
  border: '1px solid #e4e4ec',
  borderRadius: 12,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: '#aaaabc' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#e4e4ec' }} />
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={CARD_SM} className="px-5 py-4">
      <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: '#aaaabc' }}>{label}</p>
      <p className="text-2xl font-bold leading-none" style={{ color: '#111118' }}>{value}</p>
      {sub && <p className="text-xs mt-1.5" style={{ color: '#aaaabc' }}>{sub}</p>}
    </div>
  )
}

function RankNumber({ rank }) {
  const gold = { color: '#b8922a', fontWeight: 700, fontSize: 13 }
  const silver = { color: '#8c9198', fontWeight: 700, fontSize: 13 }
  const bronze = { color: '#a0714a', fontWeight: 700, fontSize: 13 }
  const normal = { color: '#ccccda', fontWeight: 600, fontSize: 13 }
  const style = rank === 1 ? gold : rank === 2 ? silver : rank === 3 ? bronze : normal
  return <span style={style}>{String(rank).padStart(2, '0')}</span>
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
    <div className="space-y-10">

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Matchs joués" value={matchsJoues} sub={`sur ${matchs.length} au programme`} />
        <StatCard label="En tête" value={classement[0]?.nom ?? '—'} sub={`${classement[0]?.points ?? 0} points`} />
        <StatCard label="Participants" value={joueurs.length} sub="joueurs" />
        <StatCard label="Meilleur taux" value={`${meilleurPct?.pourcentage ?? 0}%`} sub={meilleurPct?.nom} />
      </div>

      {/* CLASSEMENT */}
      <section>
        <SectionLabel>Classement général</SectionLabel>
        <div style={CARD} className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f6' }}>
                {['#', 'Joueur', 'Points', 'Exacts', 'Bons', 'Taux', 'Joués', ''].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-3 text-left text-xs uppercase tracking-widest font-semibold
                      ${i >= 5 ? 'hidden md:table-cell' : i === 4 ? 'hidden sm:table-cell' : i === 3 ? 'hidden sm:table-cell' : ''}
                      ${i >= 2 ? 'text-center' : ''}`}
                    style={{ color: '#aaaabc' }}>
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
                    style={{ borderTop: '1px solid #f0f0f6' }}
                    className="transition-colors hover:bg-gray-50">
                    <td className="px-5 py-4 w-12"><RankNumber rank={i + 1} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="font-semibold text-sm" style={{ color: '#111118' }}>{joueur.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold tabular-nums" style={{ color: '#111118' }}>{joueur.points}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className="tabular-nums text-sm font-semibold" style={{ color: '#16a34a' }}>{joueur.exacts}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className="tabular-nums text-sm font-medium" style={{ color: '#b8922a' }}>{joueur.bons}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1 rounded-full" style={{ background: '#f0f0f6' }}>
                          <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-xs tabular-nums" style={{ color: '#aaaabc' }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className="text-xs tabular-nums" style={{ color: '#ccccda' }}>{joueur.joues}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
                        className="text-xs font-medium tracking-wide transition-colors hover:text-gray-900"
                        style={{ color: '#ccccda' }}>
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
