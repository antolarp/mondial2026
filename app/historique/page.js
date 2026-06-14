const WRAP = { maxWidth: 900, margin: '0 auto', padding: '0 24px' }

const COMPETITIONS = [
  {
    id: 'cdm2022',
    titre: 'Coupe du Monde',
    annee: '2022',
    pays: 'Qatar',
    emoji: '🏆',
    couleur: '#7c3aed',
    podium: [
      { place: 1, noms: ['Hugo'], medaille: '#f0b429' },
      { place: 2, noms: ['?'], medaille: '#94a3b8', inconnu: true },
      { place: 3, noms: ['?'], medaille: '#d97706', inconnu: true },
    ],
  },
  {
    id: 'euro2021',
    titre: 'Euro',
    annee: '2021',
    pays: 'Europe',
    emoji: '⭐',
    couleur: '#0c1e52',
    podium: [
      { place: 1, noms: ['Aurélie'], medaille: '#f0b429' },
      { place: 2, noms: ['Lucas', 'Antonin'], medaille: '#94a3b8' },
      { place: 3, noms: ['Alix'], medaille: '#d97706' },
    ],
  },
  {
    id: 'cdm2018',
    titre: 'Coupe du Monde',
    annee: '2018',
    pays: 'Russie',
    emoji: '🏆',
    couleur: '#c0392b',
    podium: [
      { place: 1, noms: ['Antonin'], medaille: '#f0b429' },
      { place: 2, noms: ['?'], medaille: '#94a3b8', inconnu: true },
      { place: 3, noms: ['?'], medaille: '#d97706', inconnu: true },
    ],
  },
]

function Podium({ podium }) {
  const p1 = podium.find(p => p.place === 1)
  const p2 = podium.find(p => p.place === 2)
  const p3 = podium.find(p => p.place === 3)

  const HEIGHTS = { 1: 110, 2: 80, 3: 60 }
  const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

  const PodiumStep = ({ entry }) => {
    if (!entry) return null
    const h = HEIGHTS[entry.place]
    const isInconnu = entry.inconnu
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {/* Noms au-dessus */}
        <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {entry.noms.map((nom, i) => (
            <span key={i} style={{
              fontSize: isInconnu ? 13 : 15,
              fontWeight: isInconnu ? 400 : 800,
              color: isInconnu ? '#cbd5e1' : '#0f172a',
              fontStyle: isInconnu ? 'italic' : 'normal',
              background: isInconnu ? 'transparent' : entry.place === 1 ? 'rgba(240,180,41,0.12)' : 'transparent',
              padding: isInconnu ? 0 : '2px 10px',
              borderRadius: 20,
            }}>
              {nom}
            </span>
          ))}
          <span style={{ fontSize: 20 }}>{MEDALS[entry.place]}</span>
        </div>
        {/* Socle */}
        <div style={{
          width: '100%',
          height: h,
          background: isInconnu
            ? 'linear-gradient(180deg, #e2e8f0, #cbd5e1)'
            : entry.place === 1
              ? 'linear-gradient(180deg, #fcd34d, #f0b429)'
              : entry.place === 2
                ? 'linear-gradient(180deg, #e2e8f0, #94a3b8)'
                : 'linear-gradient(180deg, #fbbf24, #d97706)',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isInconnu ? 'none' : `0 -4px 20px ${entry.medaille}40`,
        }}>
          <span style={{
            fontSize: 22,
            fontWeight: 900,
            color: isInconnu ? '#94a3b8' : '#fff',
            textShadow: isInconnu ? 'none' : '0 1px 4px rgba(0,0,0,0.3)',
          }}>
            {entry.place}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 8px' }}>
      <PodiumStep entry={p2} />
      <PodiumStep entry={p1} />
      <PodiumStep entry={p3} />
    </div>
  )
}

export default function Historique() {
  return (
    <>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)' }}>
        <div className="page-wrap" style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Palmarès du concours
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            HISTORIQUE
          </h1>
          <div style={{ marginTop: 32, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ ...WRAP, paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {COMPETITIONS.map(comp => (
            <div key={comp.id} style={{
              background: '#fff',
              borderRadius: 24,
              border: '1px solid #e8eaf2',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}>
              {/* Header compétition */}
              <div style={{
                background: `linear-gradient(135deg, ${comp.couleur}ee, ${comp.couleur}bb)`,
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 36 }}>{comp.emoji}</span>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                      {comp.pays}
                    </p>
                    <p style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>
                      {comp.titre} <span style={{ opacity: 0.85 }}>{comp.annee}</span>
                    </p>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: '6px 14px',
                  backdropFilter: 'blur(4px)',
                }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{comp.annee}</span>
                </div>
              </div>

              {/* Podium */}
              <div style={{ padding: '28px 24px 0' }}>
                <Podium podium={comp.podium} />
              </div>

              {/* Base / sol */}
              <div style={{ height: 6, background: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)', margin: '0 24px', borderRadius: '0 0 4px 4px' }} />

              {/* Liste détaillée */}
              <div style={{ padding: '16px 28px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...comp.podium].sort((a, b) => a.place - b.place).map(entry => {
                  const LABELS = { 1: '1er / 1ère', 2: '2ème', 3: '3ème' }
                  const COLORS = { 1: '#f0b429', 2: '#94a3b8', 3: '#d97706' }
                  return (
                    <div key={entry.place} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px',
                      background: entry.inconnu ? '#f8fafc' : `${COLORS[entry.place]}10`,
                      borderRadius: 10,
                      border: `1px solid ${entry.inconnu ? '#e8eaf2' : COLORS[entry.place]}30`,
                    }}>
                      <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>
                        {['🥇','🥈','🥉'][entry.place - 1]}
                      </span>
                      <span style={{ fontSize: 12, color: COLORS[entry.place], fontWeight: 700, width: 54, flexShrink: 0 }}>
                        {LABELS[entry.place]}
                      </span>
                      <span style={{
                        fontSize: 14,
                        fontWeight: entry.inconnu ? 400 : 700,
                        color: entry.inconnu ? '#94a3b8' : '#0f172a',
                        fontStyle: entry.inconnu ? 'italic' : 'normal',
                      }}>
                        {entry.noms.join(' & ')}
                      </span>
                      {entry.noms.length > 1 && (
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>ex-aequo</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#cbd5e1' }}>
          Tu te souviens des places manquantes ? Dis-le à l'admin pour compléter !
        </p>
      </div>
    </>
  )
}
