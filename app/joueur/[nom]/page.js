import { chargerMatchs, chargerResultats, chargerJoueurs, calculerPoints, calculerClassement } from '../../../lib/scoring'
import { notFound } from 'next/navigation'
import { PLAYER_COLORS } from '../../../lib/colors'
import Link from 'next/link'

const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

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
  const maxPoints = classement[0]?.points || 1
  const matchsAvecProno = matchs.filter(m => joueur.pronos[m.id])
  const matchsJoues = matchsAvecProno.filter(m => resultats[m.id])
  const pct = matchsJoues.length > 0
    ? Math.round(matchsJoues.filter(m => calculerPoints(joueur.pronos[m.id], resultats[m.id]) > 0).length / matchsJoues.length * 100)
    : 0

  return (
    <>
      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, #0c1e52 0%, ${color}44 100%)`, paddingBottom: 0 }}>
        <div style={{ ...WRAP, paddingTop: 40 }}>
          <Link href="/" style={{ color: '#5a7fc0', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
            ← Classement
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 900, color: '#fff',
              boxShadow: `0 8px 24px ${color}55`,
              flexShrink: 0,
            }}>
              {joueur.nom[0]}
            </div>
            <div>
              <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>
                #{rang} au classement
              </p>
              <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
                {joueur.nom.toUpperCase()}
              </h1>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 32, marginTop: 28 }}>
            {[
              { label: 'Points', value: stats.points, color: '#fff' },
              { label: 'Exacts', value: stats.exacts, color: '#4ade80' },
              { label: 'Bons', value: stats.bons, color: '#f0b429' },
              { label: 'Réussite', value: `${pct}%`, color: '#a5c4f5' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 24, marginBottom: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: 6, borderRadius: 4, maxWidth: 400 }}>
              <div style={{
                height: 6, borderRadius: 4,
                background: `linear-gradient(90deg, ${color}, #fff)`,
                width: `${Math.round((stats.points / maxPoints) * 100)}%`,
              }} />
            </div>
            <p style={{ color: '#5a7fc0', fontSize: 11, marginTop: 6 }}>{stats.points} / {maxPoints} pts (leader)</p>
          </div>

          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      {/* PRONOS */}
      <div style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 16 }}>
          Pronos
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {matchsAvecProno.map(match => {
            const prono = joueur.pronos[match.id]
            const res = resultats[match.id]
            const pts = res ? calculerPoints(prono, res) : null
            const date = new Date(match.date)
            const leftColor = pts === 3 ? '#16a34a' : pts === 2 ? '#b8922a' : pts === 0 ? '#e2e8f0' : 'transparent'

            return (
              <div key={match.id} style={{
                background: '#fff', borderRadius: 14,
                border: '1px solid #e8eaf2',
                borderLeft: `4px solid ${leftColor}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <span style={{ fontSize: 11, color: '#cbd5e1', width: 72, flexShrink: 0 }}>
                  {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{match.phase}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {match.domicile} — {match.exterieur}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Prono</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                      {prono.domicile}–{prono.exterieur}
                    </p>
                  </div>
                  {res && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Score</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        {res.domicile}–{res.exterieur}
                      </p>
                    </div>
                  )}
                  <div style={{ width: 36, textAlign: 'right' }}>
                    {pts === 3 && <span style={{ fontSize: 16, fontWeight: 900, color: '#16a34a' }}>+3</span>}
                    {pts === 2 && <span style={{ fontSize: 16, fontWeight: 900, color: '#b8922a' }}>+2</span>}
                    {pts === 0 && <span style={{ fontSize: 16, fontWeight: 900, color: '#e2e8f0' }}>0</span>}
                    {pts === null && <span style={{ fontSize: 16, color: '#e2e8f0' }}>—</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
