export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../lib/scoring'
import { calculerEvolution, calculerEvolutionClassement, calculerPourcentages, calculerSeries } from '../lib/stats'
import { computePronoPhases } from '../lib/phases'
import { EvolutionChart, RankEvolutionChart } from '../components/Charts'
import { PLAYER_COLORS } from '../lib/colors'
import Countdown from '../components/Countdown'
import AutoRefresh from '../components/AutoRefresh'
import ConfettiLeader from '../components/ConfettiLeader'
import { CountUp, Typewriter, TiltCard } from '../components/Animations'

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

  // Bandeau fermeture imminente
  const pronoPhases = computePronoPhases(matchs)
  const phaseAlerte = pronoPhases.find(p => {
    if (!p.isOpen || !p.deadlineISO) return false
    const heures = (new Date(p.deadlineISO) - new Date()) / 3_600_000
    return true // toujours afficher si la phase est ouverte
  })
  const heuresAlerte = phaseAlerte
    ? (new Date(phaseAlerte.deadlineISO) - new Date()) / 3_600_000
    : null

  const evolution = calculerEvolution(joueurs, matchs, resultats)
  const evolutionClassement = calculerEvolutionClassement(joueurs, matchs, resultats)
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

  // Stats pronos du prochain match — masquées si la phase est encore ouverte
  const phaseProchain = prochainMatch
    ? pronoPhases.find(p => p.matchs.some(m => m.id === prochainMatch.id))
    : null
  const pronosProchain = prochainMatch && !phaseProchain?.isOpen ? (() => {
    let dom = 0, ext = 0, nul = 0
    for (const j of joueurs) {
      const p = j.pronos[prochainMatch.id]
      if (!p || typeof p.domicile !== 'number') continue
      if (p.domicile > p.exterieur) dom++
      else if (p.exterieur > p.domicile) ext++
      else nul++
    }
    return { dom, ext, nul, total: dom + ext + nul }
  })() : null

  return (
    <>
      <AutoRefresh interval={60000} />
      <ConfettiLeader leader={classement[0]?.nom ?? ''} />

      {/* Bandeau classement défilant sticky */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(12, 30, 82, 0.6)', backdropFilter: 'blur(8px)', overflow: 'hidden', whiteSpace: 'nowrap', padding: '10px 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.2)', borderTop: '1px solid rgba(90, 127, 192, 0.4)' }}>
        <style>{`
          @keyframes ticker-lespotes {
            0%   { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .ticker-lespotes {
            display: inline-block;
            animation: ticker-lespotes 22s linear infinite;
            font-size: 14px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.04em;
          }
        `}</style>
        <span className="ticker-lespotes">
          {[...classement, ...classement].map((j, i) => {
            const rank = i % classement.length
            const medals = ['🥇', '🥈', '🥉']
            const prefix = rank === 0 ? '🏆 CLASSEMENT · ' : ''
            return (
              <span key={i}>
                {prefix}{medals[rank] ?? `${rank + 1}.`} {j.nom} — {j.points} pts{' · '}
              </span>
            )
          })}
        </span>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)',
        paddingBottom: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Lignes de terrain – vue de haut, échelle ~11px/m, centre à (600,160) */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1200 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          {/* Lignes de but (bords gauche/droit du terrain) */}
          <line x1="26"   y1="-250" x2="26"   y2="570" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          <line x1="1174" y1="-250" x2="1174" y2="570" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Ligne médiane */}
          <line x1="600" y1="-250" x2="600" y2="570" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Cercle central */}
          <circle cx="600" cy="160" r="100" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Point central */}
          <circle cx="600" cy="160" r="3.5" fill="white" fillOpacity="0.13" />
          {/* Surface de réparation gauche (16.5m × 40.32m ≈ 180px × 441px) */}
          <rect x="26" y="-60" width="180" height="440" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Petite surface gauche (5.5m × 18.32m ≈ 60px × 200px) */}
          <rect x="26" y="60" width="60" height="200" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Point de penalty gauche */}
          <circle cx="146" cy="160" r="3.5" fill="white" fillOpacity="0.13" />
          {/* Arc de penalty gauche (partie hors surface) */}
          <path d="M206,80 A100,100 0 0,1 206,240" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Surface de réparation droite */}
          <rect x="994" y="-60" width="180" height="440" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Petite surface droite */}
          <rect x="1114" y="60" width="60" height="200" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
          {/* Point de penalty droit */}
          <circle cx="1054" cy="160" r="3.5" fill="white" fillOpacity="0.13" />
          {/* Arc de penalty droit */}
          <path d="M994,80 A100,100 0 0,0 994,240" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.11" />
        </svg>
        <div className="page-wrap" style={{ ...WRAP, paddingTop: 52, paddingBottom: 0 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
            USA · Canada · Mexique · Juin–Juillet 2026
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 0.9, letterSpacing: '-2px', margin: 0 }}>
                <Typewriter text="PRONOS" speed={70} delay={200} /><br />
                <span style={{ color: '#f0b429' }}><Typewriter text="MONDIAL" speed={70} delay={780} /></span>
              </h1>
              <p style={{ color: '#8aaad8', marginTop: 16, fontSize: 15 }}>
                {joueurs.length} joueurs · {matchsJoues} match{matchsJoues > 1 ? 's' : ''} joué{matchsJoues > 1 ? 's' : ''} sur {matchs.length}
              </p>
            </div>
            {/* Countdown prochain match */}
            {prochainMatch && <Countdown match={prochainMatch} pronos={pronosProchain} />}

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
                    <p style={{ color: '#f0b429', fontWeight: 700, fontSize: 15, marginTop: 3 }}><CountUp value={classement[0].points} /> pts</p>
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

      {/* ── BANDEAU FERMETURE ── */}
      {phaseAlerte && heuresAlerte !== null && (() => {
        const urgent = heuresAlerte < 24
        const warning = heuresAlerte < 72
        const jours = Math.floor(heuresAlerte / 24)
        const label = heuresAlerte < 1
          ? "Fermeture dans moins d'1 heure !"
          : heuresAlerte < 24
            ? `Fermeture dans ${Math.floor(heuresAlerte)}h !`
            : `Il reste ${jours} jour${jours > 1 ? 's' : ''} avant la fermeture`
        const bg      = urgent ? '#fef2f2'  : warning ? '#fffbeb'  : '#f0fdf4'
        const border  = urgent ? '#fecaca'  : warning ? '#fde68a'  : '#bbf7d0'
        const txtMain = urgent ? '#dc2626'  : warning ? '#92400e'  : '#15803d'
        const txtSub  = urgent ? '#ef4444'  : warning ? '#b45309'  : '#16a34a'
        const emoji   = urgent ? '🚨'       : warning ? '⚠️'       : '🟢'

        // Comptage des pronos par joueur pour la phase ouverte
        const totalMatchs = phaseAlerte.matchs.length
        const pronosParJoueur = joueurs.map(j => ({
          nom: j.nom,
          count: phaseAlerte.matchs.filter(m => j.pronos[m.id] !== undefined).length,
          total: totalMatchs,
          done: phaseAlerte.matchs.every(m => j.pronos[m.id] !== undefined),
        }))

        return (
          <div style={{
            background: bg,
            borderBottom: `2px solid ${border}`,
            padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: txtMain, marginBottom: 2 }}>
                  {phaseAlerte.label} — {label}
                </p>
                <p style={{ fontSize: 12, color: txtSub, margin: 0 }}>
                  Fermeture le {new Date(phaseAlerte.deadlineISO).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(phaseAlerte.deadlineISO).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}
                </p>
                {/* Compteurs par joueur */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {pronosParJoueur.map(({ nom, count, total, done }) => (
                    <span key={nom} style={{
                      fontSize: 11, fontWeight: 700,
                      background: done ? (urgent ? '#dc2626' : warning ? '#d97706' : '#16a34a') : 'rgba(0,0,0,0.06)',
                      color: done ? '#fff' : txtSub,
                      padding: '2px 8px', borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}>
                      {nom} {count}/{total}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/pronos" style={{
              background: urgent ? '#dc2626' : warning ? '#d97706' : '#16a34a',
              color: '#fff', textDecoration: 'none',
              fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 10,
              flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              Saisir mes pronos →
            </Link>
          </div>
        )
      })()}

      {/* ── CONTENT ── */}
      <div className="page-wrap" style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>

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
          <div className="classement-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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
              const posChange = posChanges[joueur.nom] ?? 0
              const slideDelay = i * 55
              const slideAnim = `slideInCard 0.4s ease ${slideDelay}ms both`
              const glowAnim = i === 0
                ? `leaderPulse 3s ease-in-out ${slideDelay + 500}ms infinite`
                : posChange > 0
                ? `glowRise 1.4s ease ${slideDelay + 450}ms both`
                : posChange < 0
                ? `glowFall 1.4s ease ${slideDelay + 450}ms both`
                : undefined

              const cardBack = (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{joueur.nom}</p>
                  <p style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{joueur.points}<span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}> pts</span></p>
                  <div style={{ display: 'flex', gap: 20, marginTop: 14, justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{joueur.exacts}</p>
                      <p style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>Exacts</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#b8922a', lineHeight: 1 }}>{joueur.bons}</p>
                      <p style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>Bons</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#5a7fc0', lineHeight: 1 }}>{pct}%</p>
                      <p style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>Réussite</p>
                    </div>
                  </div>
                  {serie >= 2 && <p style={{ marginTop: 12, fontSize: 13 }}>🔥 {serie} en série</p>}
                </div>
              )

              return (
                <div key={joueur.nom} style={{ animation: slideAnim }}>
                <TiltCard
                  glowAnim={glowAnim}
                  cardStyle={{
                    background: '#fff',
                    border: isTop3 ? rankStyle.border : '1px solid #e8eaf2',
                    borderRadius: 18,
                    padding: '20px 24px',
                    boxShadow: isTop3 ? '0 4px 24px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                  back={cardBack}
                >
                  {/* Shimmer sweep on leader card */}
                  {i === 0 && (
                    <div aria-hidden="true" style={{
                      position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none', zIndex: 0,
                      background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
                      backgroundSize: '400px 100%',
                      animation: 'leaderShimmer 3.5s linear infinite',
                    }} />
                  )}
                  {/* Giant rank watermark */}
                  <span className="rank-watermark" style={{
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
                      {i === 0 && (
                        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, display: 'block', animation: 'crownBounce 2s ease-in-out infinite' }}>👑</span>
                      )}
                      <div style={{
                        width: 46, height: 46, borderRadius: 14,
                        background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 800, color: '#fff',
                        boxShadow: i === 0 ? `0 4px 20px ${color}77, 0 0 0 3px ${color}33` : `0 4px 12px ${color}44`,
                        animation: i === 0 ? 'leaderAvatarPulse 2.5s ease-in-out infinite' : undefined,
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
                            display: 'inline-block',
                            animation: i === 0 ? 'leaderBadgePop 2.2s ease-in-out infinite' : undefined,
                          }}>
                            {i === 0 ? '🥇 1er' : i === 1 ? '🥈 2e' : '🥉 3e'}
                          </span>
                        )}
                        {serie >= 2 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, background: '#fff7ed',
                            color: '#ea580c', padding: '2px 8px', borderRadius: 20,
                            border: '1px solid #fed7aa',
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                          }}>
                            <span style={{ display: 'inline-block', animation: 'fireWave 0.9s ease-in-out infinite' }}>🔥</span>
                            {serie} en série
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div style={{ background: '#f1f5f9', height: 5, borderRadius: 4, width: '100%', maxWidth: 280 }}>
                        <div style={{
                          height: 5, borderRadius: 4,
                          background: i === 0
                            ? `linear-gradient(90deg, ${color} 0%, ${color}cc 35%, rgba(255,255,255,0.7) 50%, ${color}cc 65%, ${color} 100%)`
                            : `linear-gradient(90deg, ${color}, ${color}bb)`,
                          backgroundSize: i === 0 ? '200% 100%' : undefined,
                          width: `${progress}%`,
                          transition: 'width 0.6s ease',
                          animation: i === 0 ? 'progressShimmer 2s linear infinite' : undefined,
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
                    <div className="player-pts-col" style={{ textAlign: 'right', flexShrink: 0, marginRight: 48 }}>
                      <CountUp value={joueur.points} className="pts-value" style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', lineHeight: 1 }} />
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
                </TiltCard>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lien règles */}
        <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
          <Link href="/regles" style={{
            fontSize: 12, color: '#94a3b8', textDecoration: 'none', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            📋 Voir les règles du jeu →
          </Link>
        </div>

        {/* ÉVOLUTION */}
        {evolution.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #e8eaf2', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Évolution du classement</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Position après chaque match · animé à l'affichage</p>
                </div>
              </div>
              <RankEvolutionChart data={evolutionClassement} joueurs={nomsJoueurs} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 16 }}>
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
