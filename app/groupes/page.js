export const dynamic = 'force-dynamic'

import fs from 'fs'
import path from 'path'

const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

function chargerDonnees() {
  const matchs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'matchs.json'), 'utf-8'))
  let resultats = {}
  try { resultats = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'resultats.json'), 'utf-8')) } catch {}
  return { matchs, resultats }
}

function calculerGroupes(matchs, resultats) {
  const groupes = {}

  for (const m of matchs) {
    if (!m.phase.startsWith('Groupe')) continue
    const lettre = m.phase.split(' ')[1]
    if (!groupes[lettre]) groupes[lettre] = {}

    for (const equipe of [m.domicile, m.exterieur]) {
      if (!groupes[lettre][equipe]) {
        groupes[lettre][equipe] = { mj: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, pts: 0 }
      }
    }

    const res = resultats[m.id]
    if (!res) continue

    const sd = res.domicile
    const se = res.exterieur
    const dom = groupes[lettre][m.domicile]
    const ext = groupes[lettre][m.exterieur]

    dom.mj++; dom.bp += sd; dom.bc += se
    ext.mj++; ext.bp += se; ext.bc += sd

    if (sd > se) { dom.v++; dom.pts += 3; ext.d++ }
    else if (sd < se) { ext.v++; ext.pts += 3; dom.d++ }
    else { dom.n++; dom.pts++; ext.n++; ext.pts++ }
  }

  const result = {}
  for (const [lettre, equipes] of Object.entries(groupes)) {
    result[lettre] = Object.entries(equipes)
      .map(([nom, s]) => ({ nom, ...s, diff: s.bp - s.bc }))
      .sort((a, b) => b.pts - a.pts || b.diff - a.diff || b.bp - a.bp || a.nom.localeCompare(b.nom))
  }
  return result
}

// ISO 2-letter codes pour flagcdn.com
const FLAG_MAP = {
  'Mexique': 'mx', 'Afrique du Sud': 'za', 'République de Corée': 'kr', 'Tchéquie': 'cz',
  'Canada': 'ca', 'Bosnie-et-Herzégovine': 'ba', 'États-Unis': 'us', 'Paraguay': 'py',
  'Qatar': 'qa', 'Suisse': 'ch', 'Brésil': 'br', 'Maroc': 'ma', 'Haïti': 'ht',
  'Écosse': 'gb-sct', 'Australie': 'au', 'Turquie': 'tr', 'Allemagne': 'de',
  'Curaçao': 'cw', 'Pays-Bas': 'nl', 'Japon': 'jp', "Côte d'Ivoire": 'ci',
  'Équateur': 'ec', 'Suède': 'se', 'Tunisie': 'tn', 'Espagne': 'es', 'Cap-Vert': 'cv',
  'Belgique': 'be', 'Égypte': 'eg', 'Arabie saoudite': 'sa', 'Uruguay': 'uy',
  'RI Iran': 'ir', 'Nouvelle-Zélande': 'nz', 'France': 'fr', 'Sénégal': 'sn',
  'Irak': 'iq', 'Norvège': 'no', 'Argentine': 'ar', 'Algérie': 'dz',
  'Autriche': 'at', 'Jordanie': 'jo', 'Portugal': 'pt', 'RD Congo': 'cd',
  'Angleterre': 'gb-eng', 'Croatie': 'hr', 'Ghana': 'gh', 'Panamá': 'pa',
  'Ouzbékistan': 'uz', 'Colombie': 'co',
}

function Flag({ equipe }) {
  const code = FLAG_MAP[equipe]
  if (!code) return <span style={{ width: 24, display: 'inline-block' }} />
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={equipe}
      style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, display: 'inline-block', verticalAlign: 'middle' }}
    />
  )
}

const GROUP_COLORS = {
  A: '#e74c3c', B: '#e67e22', C: '#f1c40f', D: '#2ecc71',
  E: '#1abc9c', F: '#3498db', G: '#9b59b6', H: '#e91e63',
  I: '#00bcd4', J: '#ff5722', K: '#8bc34a', L: '#607d8b',
}

function TableauGroupe({ lettre, equipes }) {
  const couleur = GROUP_COLORS[lettre] || '#3498db'
  const matchsJoues = equipes.some(e => e.mj > 0)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e8eaf2',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}>
      {/* Header groupe */}
      <div style={{
        background: `linear-gradient(135deg, ${couleur}dd, ${couleur}99)`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 18, color: '#fff',
        }}>
          {lettre}
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Groupe {lettre}</span>
        {!matchsJoues && (
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
            pas encore commencé
          </span>
        )}
      </div>

      {/* Tableau */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f2f8' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 28 }}>#</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>Équipe</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 32 }}>MJ</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 32 }}>V</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 32 }}>N</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 32 }}>D</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 40 }}>BP</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 40 }}>BC</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: 11, width: 40 }}>Diff</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontWeight: 700, fontSize: 12, width: 44 }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {equipes.map((eq, i) => {
              const qualifie = i < 2
              const troisieme = i === 2
              const rowBg = qualifie
                ? `${couleur}08`
                : troisieme ? '#fffbf0' : '#fff'
              const borderLeft = qualifie
                ? `3px solid ${couleur}`
                : troisieme ? '3px solid #f0b429' : '3px solid transparent'

              return (
                <tr key={eq.nom} style={{
                  borderBottom: i < equipes.length - 1 ? '1px solid #f4f6fb' : 'none',
                  background: rowBg,
                  borderLeft,
                }}>
                  <td style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 12 }}>
                    {qualifie ? (
                      <span style={{ color: couleur, fontWeight: 800 }}>{i + 1}</span>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Flag equipe={eq.nom} />
                      <span style={{ fontWeight: qualifie ? 700 : 500, color: '#0f172a', fontSize: 13 }}>
                        {eq.nom}
                      </span>
                      {qualifie && (
                        <span style={{ fontSize: 10, color: couleur, fontWeight: 700, background: `${couleur}15`, padding: '1px 6px', borderRadius: 10 }}>
                          Q
                        </span>
                      )}
                      {troisieme && eq.mj > 0 && (
                        <span style={{ fontSize: 10, color: '#f0b429', fontWeight: 700, background: '#fef9e7', padding: '1px 6px', borderRadius: 10 }}>
                          ?
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{eq.mj}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#22c55e', fontWeight: eq.v > 0 ? 700 : 400 }}>{eq.v}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#94a3b8' }}>{eq.n}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#ef4444', fontWeight: eq.d > 0 ? 700 : 400 }}>{eq.d}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{eq.bp}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b' }}>{eq.bc}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: eq.diff > 0 ? '#22c55e' : eq.diff < 0 ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
                    {eq.diff > 0 ? `+${eq.diff}` : eq.diff}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 900, fontSize: 15,
                      color: qualifie ? couleur : '#0f172a',
                    }}>
                      {eq.pts}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Groupes() {
  const { matchs, resultats } = chargerDonnees()
  const groupes = calculerGroupes(matchs, resultats)
  const lettres = Object.keys(groupes).sort()

  const totalMatchsJoues = matchs.filter(m => m.phase.startsWith('Groupe') && resultats[m.id]).length
  const totalMatchsGroupe = matchs.filter(m => m.phase.startsWith('Groupe')).length

  return (
    <>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0c1e52 0%, #16357a 55%, #0c2c60 100%)' }}>
        <div style={{ ...WRAP, paddingTop: 40 }}>
          <p style={{ color: '#5a7fc0', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Coupe du Monde 2026
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>
            GROUPES
          </h1>
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            <div>
              <p style={{ color: '#5a7fc0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Matchs joués</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{totalMatchsJoues} <span style={{ color: '#5a7fc0', fontWeight: 400, fontSize: 15 }}>/ {totalMatchsGroupe}</span></p>
            </div>
            <div>
              <p style={{ color: '#5a7fc0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Groupes</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{lettres.length}</p>
            </div>
          </div>
          <div style={{ marginTop: 28, height: 28, position: 'relative' }}>
            <svg viewBox="0 0 1200 28" preserveAspectRatio="none"
              style={{ position: 'absolute', bottom: 0, left: -24, width: 'calc(100% + 48px)', height: 28 }}>
              <path d="M0,0 C300,28 900,0 1200,20 L1200,28 L0,28 Z" fill="#f0f2f8" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ ...WRAP, paddingTop: 32, paddingBottom: 60 }}>
        {/* Légende */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#3498db' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>Qualifié direct (top 2)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#f0b429' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>Possible meilleur 3ème</span>
          </div>
        </div>

        {/* Grille des groupes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
          gap: 20,
        }}>
          {lettres.map(lettre => (
            <TableauGroupe key={lettre} lettre={lettre} equipes={groupes[lettre]} />
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#cbd5e1' }}>
          Les 2 premiers de chaque groupe + les 8 meilleurs 3èmes se qualifient pour les huitièmes de finale.
        </p>
      </div>
    </>
  )
}
