import { chargerJoueurs, chargerMatchs, chargerResultats, calculerClassement } from '../../lib/scoring'
import { calculerPlaces, calculerPourcentages, calculerExacts } from '../../lib/stats'
import { ExactsChart, PourcentagesChart, PlacesPieCharts, EfficaciteChart } from '../../components/Charts'
import { PLAYER_COLORS } from '../../lib/colors'

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
        <div style={{ ...WRAP, paddingTop: 40 }}>
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

      <div style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>

        {/* RECORDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
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
      </div>
    </>
  )
}
