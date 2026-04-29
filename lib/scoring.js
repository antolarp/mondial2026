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
      return { ...joueur, points, exacts, bons, joues }
    })
    .sort((a, b) => b.points - a.points || b.exacts - a.exacts)
}
