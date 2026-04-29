import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints, calculerClassement } from '../../../lib/scoring'
import { notFound } from 'next/navigation'
import { PLAYER_COLORS } from '../../../lib/colors'

const CARD = { background: '#11111a', border: '1px solid #1c1c2e', borderRadius: 12 }

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs uppercase tracking-[0.2em] font-medium" style={{ color: '#52526e' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: '#1c1c2e' }} />
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
      <div className="flex items-end gap-6 pb-6" style={{ borderBottom: '1px solid #1c1c2e' }}>
        <div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#52526e' }}>
            #{rang} au classement
          </p>
          <h1 className="text-4xl font-bold text-white tracking-tight">{joueur.nom}</h1>
          <div className="flex items-center gap-5 mt-4 text-sm">
            <span className="font-bold text-white tabular-nums">
              {stats.points}
              <span className="ml-1 text-xs font-normal" style={{ color: '#52526e' }}>pts</span>
            </span>
            <span style={{ color: '#1c1c2e' }}>·</span>
            <span className="tabular-nums" style={{ color: '#4ade80' }}>
              {stats.exacts}
              <span className="ml-1 text-xs" style={{ color: '#52526e' }}>exacts</span>
            </span>
            <span style={{ color: '#1c1c2e' }}>·</span>
            <span className="tabular-nums" style={{ color: '#c8a84b' }}>
              {stats.bons}
              <span className="ml-1 text-xs" style={{ color: '#52526e' }}>bons</span>
            </span>
          </div>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-20 rounded-full" style={{ background: color, opacity: 0.6 }} />
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

            const borderColor = pts === 3 ? '#166534' : pts === 2 ? '#78500a' : pts === 0 ? '#3a3a52' : '#1c1c2e'

            return (
              <div key={match.id} style={{ ...CARD, borderColor }}
                className="px-5 py-3.5 flex items-center gap-6">
                <span className="text-xs tabular-nums w-20 shrink-0" style={{ color: '#3a3a52' }}>
                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: '#3a3a52' }}>{match.phase}</p>
                  <p className="text-sm text-white font-medium truncate">
                    {match.domicile} — {match.exterieur}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0 text-sm tabular-nums">
                  <div className="text-right">
                    <p className="text-xs mb-0.5" style={{ color: '#3a3a52' }}>Prono</p>
                    <p className="font-medium" style={{ color: '#8888a8' }}>{prono.domicile}–{prono.exterieur}</p>
                  </div>
                  {res && (
                    <div className="text-right">
                      <p className="text-xs mb-0.5" style={{ color: '#3a3a52' }}>Résultat</p>
                      <p className="font-medium text-white">{res.domicile}–{res.exterieur}</p>
                    </div>
                  )}
                  <div className="w-8 text-right font-bold">
                    {pts === 3 && <span style={{ color: '#4ade80' }}>+3</span>}
                    {pts === 2 && <span style={{ color: '#c8a84b' }}>+2</span>}
                    {pts === 0 && <span style={{ color: '#3a3a52' }}>0</span>}
                    {pts === null && <span style={{ color: '#1c1c2e' }}>—</span>}
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
