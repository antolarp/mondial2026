import { calculerPoints } from './scoring'

export function calculerEvolution(joueurs, matchs, resultats) {
  const matchsJoues = matchs
    .filter(m => resultats[m.id])
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (matchsJoues.length === 0) return []

  const cumul = {}
  joueurs.forEach(j => (cumul[j.nom] = 0))

  return matchsJoues.map((match, idx) => {
    joueurs.forEach(joueur => {
      const prono = joueur.pronos[match.id]
      if (prono) cumul[joueur.nom] += calculerPoints(prono, resultats[match.id])
    })
    const point = { match: `J${idx + 1}` }
    joueurs.forEach(j => (point[j.nom] = cumul[j.nom]))
    return point
  })
}

export function calculerPlaces(joueurs, matchs, resultats) {
  const matchsJoues = matchs
    .filter(m => resultats[m.id])
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const premiere = {}
  const derniere = {}
  joueurs.forEach(j => { premiere[j.nom] = 0; derniere[j.nom] = 0 })

  const cumul = {}
  joueurs.forEach(j => (cumul[j.nom] = 0))

  matchsJoues.forEach(match => {
    joueurs.forEach(joueur => {
      const prono = joueur.pronos[match.id]
      if (prono) cumul[joueur.nom] += calculerPoints(prono, resultats[match.id])
    })
    const sorted = [...joueurs].sort((a, b) => cumul[b.nom] - cumul[a.nom])
    premiere[sorted[0].nom]++
    derniere[sorted[sorted.length - 1].nom]++
  })

  return { premiere, derniere }
}

export function calculerPourcentages(joueurs, resultats) {
  return joueurs.map(joueur => {
    let corrects = 0
    let total = 0
    for (const matchId in joueur.pronos) {
      if (!resultats[matchId]) continue
      total++
      if (calculerPoints(joueur.pronos[matchId], resultats[matchId]) > 0) corrects++
    }
    return {
      nom: joueur.nom,
      pourcentage: total > 0 ? Math.round((corrects / total) * 100) : 0,
    }
  })
}

export function calculerExacts(joueurs, resultats) {
  return joueurs.map(joueur => {
    let exacts = 0
    for (const matchId in joueur.pronos) {
      if (!resultats[matchId]) continue
      if (calculerPoints(joueur.pronos[matchId], resultats[matchId]) === 3) exacts++
    }
    return { nom: joueur.nom, exacts }
  })
}
