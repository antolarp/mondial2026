import Link from 'next/link'
import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../lib/scoring'
import { calculerEvolution, calculerPourcentages, calculerSeries } from '../lib/stats'
import { EvolutionChart } from '../components/Charts'
import { PLAYER_COLORS } from '../lib/colors'
import Countdown from '../components/Countdown'
import AutoRefresh from '../components/AutoRefresh'

function calculerChangements(joueurs, matchs, resultats, classementActuel) {
  const matchsJoues = matchs.filter(m => resultats[m.id]).sort((a, b) => new Date(b.date) - new Date(a.date))
  if (matchsJoues.length === 0) return {}
  const dernierMatch = matchsJoues[0]
  const resultatsAvant = { ...resultats }
  delete resultatsAvant[dernierMatch.id]
  const classementAvant = calculerClassement(joueurs, matchs, resultatsAvant)
  const changes = {}
  classementActuel.forEach((j, i) => {
    const ancienRang = classementAvant.findIndex(c => c.nom === j.nom)
    changes[j.nom] = ancienRang - i // >0 = monté, <0 = descendu, 0 = stable
  })
  return changes
}

const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

const RANK_STYLES = [
  { color: '#b8820a', bg: '#fef8ec', border: '2px solid #f0c040' },
  { color: '#6b7280', bg: '#f9fafb', border: '2px solid #d1d5db' },
  { color: '#92400e', bg: '#fdf6f0', border: '2px solid #d97706' },
]

export default function Home() {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const classement = calculerClassement(joueurs, matchs, resultats)

  const matchsJoues = matchs.filter(m => resultats[m.id]).length
  const evolution = calculerEvolution(joueurs, matchs, resultats)
  const pourcentages = calculerPourcentages(joueurs, resultats)
  const series = calculerSeries(joueurs, matchs, resultats)
  const nomsJoueurs = joueurs.map(j => j.nom)
  const maxPoints = classement[0]?.points || 1
  const meilleurPct = [...pourcentages].sort((a, b) => b.pourcentage - a.pourcentage)[0]
  const posChanges = calculerChangements(joueurs, matchs, resultats, classement)

  // Prochain match sans résultat
  const prochainMatch = matchs
    .filter(m => !resultats[m.id])
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null

  return (
    <>
      <AutoRefresh interval={60000} />
      <div style={{
        background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)',
        paddingBottom: 0,
      }}>
        <div style={{ ...WRAP, paddingTop: 52, paddingBottom: 0 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
            USA · Canada · Mexique · Juin–Juillet 2026
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 0.9, letterSpacing: '-2px', margin: 0 }}>
                PRONOS<br />
                <span style={{ color: '#f0b429' }}>MONDIAL</span>
              </h1>
              <p style={{ color: '#8aaad8', marginTop: 16, fontSize: 15 }}>
                {joueurs.length} joueurs · {matchsJoues} match{matchsJoues > 1 ? 's' : ''} joué{matchsJoues > 1 ? 's' : ''} sur {matchs.length}
              </p>
            </div>
            {/* Countdown prochain match */}
            {prochainMatch && <Countdown match={prochainMatch} />}

            {/* Leader card in hero */}
            {classement[0] && (
              <div style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '20px 28px',
                backdropFilter: 'blur(8px)',
                marginBottom: 0,
              }}>
                <p style={{ color: '#5a7fc0', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>En tête</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: PLAYER_COLORS[nomsJoueurs.indexOf(classement[0].nom) % PLAYER_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 900, color: '#fff',
                  }}>
                    {classement[0].nom[0]}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{classement[0].nom}</p>
                    <p style={{ color: '#f0b429', fontWeight: 700, fontSize: 15, marginTop: 3 }}>{classement[0].points} pts</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wave separator */}
          <div style={{ marginTop: 40, height: 32, position: 'relative' }}>
            <svg viewBox="0 0 1200 32" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, right: -24, width: 'calc(100% + 48px)', height: 32 }}>
              <path d="M0,0 C300,32 900,0 1200,24 L1200,32 L0,32 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Matchs joués', value: matchsJoues, sub: `/ ${matchs.length}` },
            { label: 'Leader actuel', value: classement[0]?.nom, sub: `${classement[0]?.points ?? 0} points` },
            { label: 'Meilleur taux', value: `${meilleurPct?.pourcentage ?? 0}%`, sub: meilleurPct?.nom },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
              border: '1px solid #e8eaf2',
            }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* LEADERBOARD */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
              Classement général
            </p>
            <Link href="/stats" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #0c1e52, #1a3a7a)',
              color: '#fff', textDecoration: 'none',
              fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 12,
              letterSpacing: '0.04em', boxShadow: '0 4px 14px rgba(12,30,82,0.25)',
            }}>
              <span style={{ fontSize: 14 }}>📊</span> Statistiques détaillées →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {classement.map((joueur, i) => {
              const pct = pourcentages.find(p => p.nom === joueur.nom)?.pourcentage ?? 0
              const serie = series.find(s => s.nom === joueur.nom)?.serie ?? 0
              const color = PLAYER_COLORS[nomsJoueurs.indexOf(joueur.nom) % PLAYER_COLORS.length]
              const rankStyle = RANK_STYLES[i] ?? { color: '#cbd5e1', bg: '#fff', border: '1px solid #e8eaf2' }
              const progress = Math.round((joueur.points / (maxPoints || 1)) * 100)
              const isTop3 = i < 3

              return (
                <div key={joueur.nom} style={{
                  background: '#fff',
                  border: isTop3 ? rankStyle.border : '1px solid #e8eaf2',
                  borderRadius: 18,
                  padding: '20px 24px',
                  boxShadow: isTop3
                    ? '0 4px 24px rgba(0,0,0,0.08)'
                    : '0 1px 4px rgba(0,0,0,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}>
                  {/* Giant rank watermark */}
                  <span style={{
                    position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 96, fontWeight: 900, lineHeight: 1,
                    color: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fdf6f0' : '#f8fafc',
                    userSelect: 'none', pointerEvents: 'none',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Avatar + flèche évolution */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 14,
                        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, color: '#fff',
                        boxShadow: `0 4px 12px ${color}44`,
                      }}>
                        {joueur.nom[0]}
                      </div>
                      {posChanges[joueur.nom] > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>↑{posChanges[joueur.nom]}</span>
                      )}
                      {posChanges[joueur.nom] < 0 && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>↓{Math.abs(posChanges[joueur.nom])}</span>
                      )}
                      {posChanges[joueur.nom] === 0 && (
                        <span style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1 }}>—</span>
                      )}
                    </div>

                    {/* Name + stats */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>{joueur.nom}</span>
                        {isTop3 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                            background: rankStyle.bg, color: rankStyle.color, padding: '2px 8px', borderRadius: 20,
                          }}>
                            {i === 0 ? '🥇 1er' : i === 1 ? '🥈 2e' : '🥉 3e'}
                          </span>
                        )}
                        {serie >= 2 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, background: '#fff7ed',
                            color: '#ea580c', padding: '2px 8px', borderRadius: 20,
                            border: '1px solid #fed7aa',
                          }}>
                            🔥 {serie} en série
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div style={{ background: '#f1f5f9', height: 5, borderRadius: 4, width: '100%', maxWidth: 280 }}>
                        <div style={{
                          height: 5, borderRadius: 4,
                          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
                          width: `${progress}%`,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>{joueur.exacts} exacts</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
                        <span style={{ fontSize: 11, color: '#b8922a', fontWeight: 600 }}>{joueur.bons} bons</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{pct}% réussite</span>
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 48 }}>
                      <span style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{joueur.points}</span>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>points</p>
                    </div>

                    {/* Link */}
                    <Link href={`/joueur/${encodeURIComponent(joueur.nom.toLowerCase())}`}
                      style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 12, color: '#cbd5e1', textDecoration: 'none', fontWeight: 600,
                        zIndex: 2,
                      }}
                      className="hover:text-blue-500 transition-colors">
                      →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ÉVOLUTION */}
        {evolution.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #e8eaf2', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Évolution des points</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Points cumulés après chaque match</p>
                </div>
                <Link href="/stats" style={{
                  background: '#0c1e52', color: '#fff', textDecoration: 'none',
                  fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 10,
                  letterSpacing: '0.05em', flexShrink: 0,
                }}>
                  Toutes les stats →
                </Link>
              </div>
              <EvolutionChart data={evolution} joueurs={nomsJoueurs} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
