export const dynamic = 'force-dynamic'

import fs from 'fs'
import path from 'path'
import GroupesClient from './GroupesClient'

const WRAP = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' }

const MOBILE_STYLE = `
  @media (max-width: 480px) {
    .col-hide { display: none !important; }
  }
`

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
    const sd = res.domicile, se = res.exterieur
    const dom = groupes[lettre][m.domicile], ext = groupes[lettre][m.exterieur]
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

export default function Groupes() {
  const { matchs, resultats } = chargerDonnees()
  const groupes = calculerGroupes(matchs, resultats)
  const lettres = Object.keys(groupes).sort()

  const matchsR32 = matchs.filter(m => m.phase === 'Seizièmes de finale')
  const matchsR16 = matchs.filter(m => m.phase === 'Huitièmes de finale')

  const totalMatchsJoues = matchs.filter(m => m.phase.startsWith('Groupe') && resultats[m.id]).length
  const totalMatchsGroupe = matchs.filter(m => m.phase.startsWith('Groupe')).length
  const r32Done = matchsR32.filter(m => resultats[m.id]).length

  return (
    <>
      <style>{MOBILE_STYLE}</style>
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
              <p style={{ color: '#5a7fc0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Phase de groupes</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{totalMatchsJoues} <span style={{ color: '#5a7fc0', fontWeight: 400, fontSize: 15 }}>/ {totalMatchsGroupe}</span></p>
            </div>
            <div>
              <p style={{ color: '#5a7fc0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Seizièmes</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{r32Done} <span style={{ color: '#5a7fc0', fontWeight: 400, fontSize: 15 }}>/ 16</span></p>
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

      <div style={{ ...WRAP, paddingTop: 28, paddingBottom: 80 }}>
        <GroupesClient
          groupes={groupes}
          matchsR32={matchsR32}
          matchsR16={matchsR16}
          resultats={resultats}
        />
      </div>
    </>
  )
}
