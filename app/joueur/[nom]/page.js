import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints, calculerClassement } from '../../../lib/scoring'
import { notFound } from 'next/navigation'
import { PLAYER_COLORS } from '../../../lib/colors'

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

export default function PageJoueur({ params }) {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()

  const joueur = joueurs.find(j => j.nom.toLowerCase() === decodeURIComponent(params.nom))
  if (!joueur) notFound()

  const classement = calculerClassement(joueurs, matchs, resultats)
  const stats = classement.find(j => j.nom === joueur.nom)
  const rang = classement.findIndex(j => j.nom === joueur.nom) + 1
  const color = PLAYER_COLORS[joueurs.findIndex(j => j.nom === joueur.nom) % PLAYER_COLORS.length]
  const matchsAvecProno = matchs.filter(m => joueur.pronos[m.id])

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div className="bg-white rounded-2xl px-8 py-7" style={{ border: '1px solid #e4e4ec', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: '#aaaabc' }}>
              #{rang} au classement
            </p>
            <h1 className="text-4xl font-bold tracking-tight mb-4" style={{ color: '#111118' }}>{joueur.nom}</h1>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-bold text-xl" style={{ color: '#111118' }}>{stats.points}</span>
                <span className="ml-1 text-xs" style={{ color: '#aaaabc' }}>points</span>
              </div>
              <div style={{ width: 1, height: 20, background: '#e4e4ec' }} />
              <div>
                <span className="font-semibold" style={{ color: '#16a34a' }}>{stats.exacts}</span>
                <span className="ml-1 text-xs" style={{ color: '#aaaabc' }}>exacts</span>
              </div>
              <div style={{ width: 1, height: 20, background: '#e4e4ec' }} />
              <div>
                <span className="font-semibold" style={{ color: '#b8922a' }}>{stats.bons}</span>
                <span className="ml-1 text-xs" style={{ color: '#aaaabc' }}>bons</span>
              </div>
            </div>
          </div>
          <div className="w-1.5 h-24 rounded-full" style={{ background: color, opacity: 0.7 }} />
        </div>
      </div>

      {/* PRONOS */}
      <section>
        <SectionLabel>Pronos</SectionLabel>
        <div className="space-y-1.5">
          {matchsAvecProno.map(match => {
            const prono = joueur.pronos[match.id]
            const res = resultats[match.id]
            const pts = res ? calculerPoints(prono, res) : null
            const date = new Date(match.date)

            const leftBorder =
              pts === 3 ? '3px solid #16a34a' :
              pts === 2 ? '3px solid #b8922a' :
              pts === 0 ? '3px solid #e4e4ec' :
              '3px solid transparent'

            return (
              <div key={match.id} style={{ ...CARD, borderLeft: leftBorder }}
                className="px-5 py-3.5 flex items-center gap-6">
                <span className="text-xs tabular-nums w-20 shrink-0" style={{ color: '#ccccda' }}>
                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: '#aaaabc' }}>{match.phase}</p>
                  <p className="text-sm font-semibold truncate" style={{ color: '#111118' }}>
                    {match.domicile} — {match.exterieur}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-sm tabular-nums">
                  <div className="text-right">
                    <p className="text-xs mb-0.5" style={{ color: '#aaaabc' }}>Prono</p>
                    <p className="font-medium" style={{ color: '#6b6b88' }}>{prono.domicile}–{prono.exterieur}</p>
                  </div>
                  {res && (
                    <div className="text-right">
                      <p className="text-xs mb-0.5" style={{ color: '#aaaabc' }}>Résultat</p>
                      <p className="font-semibold" style={{ color: '#111118' }}>{res.domicile}–{res.exterieur}</p>
                    </div>
                  )}
                  <div className="w-8 text-right font-bold text-sm">
                    {pts === 3 && <span style={{ color: '#16a34a' }}>+3</span>}
                    {pts === 2 && <span style={{ color: '#b8922a' }}>+2</span>}
                    {pts === 0 && <span style={{ color: '#ccccda' }}>0</span>}
                    {pts === null && <span style={{ color: '#e4e4ec' }}>—</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
