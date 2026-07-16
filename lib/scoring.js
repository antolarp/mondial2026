import fs from 'fs'
import path from 'path'

export function calculerPoints(prono, resultat) {
  if (!resultat) return null
  if (prono.domicile === resultat.domicile && prono.exterieur === resultat.exterieur) return 3
  const vainqueurProno = Math.sign(prono.domicile - prono.exterieur)
  const vainqueurReel = Math.sign(resultat.domicile - resultat.exterieur)
  if (vainqueurProno === vainqueurReel) return 2
  return 0
}

export function chargerMatchs() {
  const filePath = path.join(process.cwd(), 'data', 'matchs.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function chargerResultats() {
  const filePath = path.join(process.cwd(), 'data', 'resultats.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function chargerJoueurs() {
  const dir = path.join(process.cwd(), 'data', 'joueurs')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
    return data
  })
}

export function calculerClassement(joueurs, matchs, resultats) {
  const matchsJoues = matchs
    .filter(m => resultats[m.id])
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Temps passé en 1ère place (nombre de matchs après lesquels le joueur était en tête)
  const enTete = {}
  joueurs.forEach(j => { enTete[j.nom] = 0 })
  const cumul = {}
  joueurs.forEach(j => { cumul[j.nom] = 0 })
  for (const match of matchsJoues) {
    joueurs.forEach(joueur => {
      const prono = joueur.pronos[match.id]
      if (prono) cumul[joueur.nom] += calculerPoints(prono, resultats[match.id])
    })
    if (joueurs.length > 0) {
      const maxPts = Math.max(...joueurs.map(j => cumul[j.nom]))
      joueurs.filter(j => cumul[j.nom] === maxPts).forEach(j => { enTete[j.nom]++ })
    }
  }

  return joueurs
    .map(joueur => {
      let points = 0
      let exacts = 0
      let bons = 0
      let joues = 0
      for (const matchId in joueur.pronos) {
        const resultat = resultats[matchId]
        if (!resultat) continue
        joues++
        const pts = calculerPoints(joueur.pronos[matchId], resultat)
        points += pts
        if (pts === 3) exacts++
        if (pts === 2) bons++
      }
      const pct = joues > 0 ? (exacts + bons) / joues : 0
      return { ...joueur, points, exacts, bons, joues, pct, enTete: enTete[joueur.nom] }
    })
    .sort((a, b) =>
      b.points - a.points ||
      b.pct - a.pct ||
      b.enTete - a.enTete ||
      b.exacts - a.exacts
    )
}
