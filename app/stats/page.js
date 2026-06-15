import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../../lib/scoring'
import { calculerPlaces, calculerPourcentages, calculerExacts } from '../../lib/stats'
import { ExactsChart, PourcentagesChart, PlacesPieCharts, EfficaciteChart } from '../../components/Charts'
import { PLAYER_COLORS } from '../../lib/colors'
import fs from 'fs'
import path from 'path'

const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

const CARD = {
  background: '#fff',
  borderRadius: 20,
  border: '1px solid #e8eaf2',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  padding: '28px 24px',
}

export default function Stats() {
  const joueurs = chargerJoueurs()
  const matchs = chargerMatchs()
  const resultats = chargerResultats()
  const classement = calculerClassement(joueurs, matchs, resultats)

  const nomsJoueurs = joueurs.map(j => j.nom)
  const colors = nomsJoueurs.map((_, i) => PLAYER_COLORS[i % PLAYER_COLORS.length])

  const { premiere, derniere } = calculerPlaces(joueurs, matchs, resultats)

  const pourcentages = calculerPourcentages(joueurs, resultats).map(item => ({
    ...item,
    color: PLAYER_COLORS[nomsJoueurs.indexOf(item.nom) % PLAYER_COLORS.length],
  }))

  const exacts = calculerExacts(joueurs, resultats).map(item => ({
    ...item,
    color: PLAYER_COLORS[nomsJoueurs.indexOf(item.nom) % PLAYER_COLORS.length],
  }))

  const efficacite = classement.map((j, i) => ({
    nom: j.nom,
    ppm: j.joues > 0 ? Math.round((j.points / j.joues) * 10) / 10 : 0,
    color: PLAYER_COLORS[nomsJoueurs.indexOf(j.nom) % PLAYER_COLORS.length],
  }))

  // Buteurs
  let scorers = []
  try {
    scorers = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'scorers.json'), 'utf-8'))
  } catch {}

  // Stats CDM
  const matchsJoues = matchs.filter(m => resultats[m.id])
  const totalButs = matchsJoues.reduce((acc, m) => {
    const r = resultats[m.id]
    return acc + r.domicile + r.exterieur
  }, 0)
  const butsPar = {}
  matchsJoues.forEach(m => {
    const r = resultats[m.id]
    butsPar[m.domicile] = (butsPar[m.domicile] || 0) + r.domicile
    butsPar[m.exterieur] = (butsPar[m.exterieur] || 0) + r.exterieur
  })
  const butsParEquipe = Object.entries(butsPar)
    .map(([nom, buts]) => ({ nom, buts }))
    .sort((a, b) => b.buts - a.buts)
  const moyenneButs = matchsJoues.length > 0 ? (totalButs / matchsJoues.length).toFixed(2) : 0
  const plusCleanSheet = Object.entries(butsPar)
    .filter(([, b]) => b === 0).length
  // Meilleure attaque (top 5)
  const top5 = butsParEquipe.slice(0, 5)

  // Records
  const records = [
    { label: 'Meilleur score', value: classement[0]?.points ?? 0, sub: classement[0]?.nom, color: '#f0b429' },
    { label: 'Plus de scores exacts', value: exacts.sort((a,b) => b.exacts - a.exacts)[0]?.exacts ?? 0, sub: exacts[0]?.nom, color: '#10b981' },
    { label: 'Meilleur taux', value: `${pourcentages.sort((a,b) => b.pourcentage - a.pourcentage)[0]?.pourcentage ?? 0}%`, sub: pourcentages[0]?.nom, color: '#3b82f6' },
    { label: 'Moins de points', value: classement[classement.length - 1]?.points ?? 0, sub: classement[classement.length - 1]?.nom, color: '#f43f5e' },
  ]

  return (
    <>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)' }}>
        <div className="page-wrap" style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Données & analyses
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            STATISTIQUES
          </h1>
          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>

        {/* RECORDS */}
        <div className="records-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
          {records.map(r => (
            <div key={r.label} style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px',
              border: '1px solid #e8eaf2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderTop: `3px solid ${r.color}`,
            }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{r.label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{r.value}</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{r.sub}</p>
            </div>
          ))}
        </div>

        {/* CAMEMBERTS */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Domination du classement</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 28 }}>Répartition des passages en tête et en queue de classement après chaque match</p>
          <PlacesPieCharts premiere={premiere} derniere={derniere} joueurs={nomsJoueurs} colors={colors} />
        </div>

        {/* BARRES VERTICALES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={CARD}>
            <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Scores exacts</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Nombre de pronos à 3 points par joueur</p>
            <ExactsChart data={exacts} />
          </div>
          <div style={CARD}>
            <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Taux de réussite</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Pourcentage de pronos à 2 ou 3 pts</p>
            <PourcentagesChart data={pourcentages} />
          </div>
        </div>

        {/* EFFICACITÉ */}
        <div style={CARD}>
          <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Efficacité</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Points moyens par match joué</p>
          <EfficaciteChart data={efficacite} />
        </div>

        {/* BUTEURS */}
        {scorers.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Classements CDM</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: scorers.filter(s => s.assists > 0).length >= 3 ? '1fr 1fr' : '1fr', gap: 16 }}>
              {/* Top buteurs */}
              <div style={{ ...CARD }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>⚽ Meilleurs buteurs</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Buts marqués depuis le début du tournoi</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {scorers.slice(0, 10).map((s, i) => (
                    <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? '#f0b429' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : '#cbd5e1', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                      {s.crest && <img src={s.crest} style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} alt="" />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nom}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8' }}>{s.equipe} · {s.matchs} match{s.matchs > 1 ? 's' : ''}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{s.buts}</span>
                        {s.penaltys > 0 && <span style={{ fontSize: 10, color: '#94a3b8' }}>({s.penaltys}p)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top passeurs — affiché uniquement si données dispo */}
              {scorers.filter(s => s.assists > 0).length >= 3 && (
                <div style={{ ...CARD }}>
                  <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>🎯 Meilleurs passeurs</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Passes décisives depuis le début du tournoi</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[...scorers].sort((a, b) => b.assists - a.assists).filter(s => s.assists > 0).slice(0, 10).map((s, i) => (
                      <div key={s.nom} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? '#f0b429' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : '#cbd5e1', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                        {s.crest && <img src={s.crest} style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} alt="" />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nom}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{s.equipe} · {s.matchs} match{s.matchs > 1 ? 's' : ''}</p>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', flexShrink: 0 }}>{s.assists}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATS CDM */}
        {matchsJoues.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Coupe du Monde 2026</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* Chiffres clés */}
            <div className="records-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Buts marqués', value: totalButs, sub: `en ${matchsJoues.length} match${matchsJoues.length > 1 ? 's' : ''}`, color: '#f0b429' },
                { label: 'Moyenne / match', value: moyenneButs, sub: 'buts par match', color: '#3b82f6' },
                { label: 'Meilleure attaque', value: butsParEquipe[0]?.buts ?? 0, sub: butsParEquipe[0]?.nom, color: '#10b981' },
                { label: 'Matchs sans but', value: matchsJoues.filter(m => resultats[m.id].domicile + resultats[m.id].exterieur === 0).length, sub: 'scores 0-0', color: '#94a3b8' },
              ].map(r => (
                <div key={r.label} style={{
                  background: '#fff', borderRadius: 16, padding: '18px 20px',
                  border: '1px solid #e8eaf2', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderTop: `3px solid ${r.color}`,
                }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{r.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{r.value}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{r.sub}</p>
                </div>
              ))}
            </div>

            {/* Top 5 buteurs */}
            {top5.length > 0 && (
              <div style={{ ...CARD }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 2 }}>Classement des attaques</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Buts marqués par équipe depuis le début du tournoi</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {top5.map((eq, i) => {
                    const pct = Math.round((eq.buts / (butsParEquipe[0]?.buts || 1)) * 100)
                    const colors2 = ['#f0b429', '#94a3b8', '#d97706', '#3b82f6', '#10b981']
                    return (
                      <div key={eq.nom} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: colors2[i], width: 20, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', width: 160, flexShrink: 0 }}>{eq.nom}</span>
                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 8 }}>
                          <div style={{ height: 8, borderRadius: 4, background: colors2[i], width: `${pct}%`, transition: 'width 0.6s' }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', width: 32, textAlign: 'right', flexShrink: 0 }}>{eq.buts}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
