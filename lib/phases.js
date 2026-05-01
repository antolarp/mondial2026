// lib/phases.js — Définit les phases de pronostic et leurs deadlines

export const PRONO_PHASES_CONFIG = [
  {
    id: 'groupes',
    label: 'Phase de groupes',
    shortLabel: 'Groupes',
    test: p => p.startsWith('Groupe'),
  },
  {
    id: 'seiziemes',
    label: 'Seizièmes de finale',
    shortLabel: '1/16',
    test: p => p === 'Seizièmes de finale',
  },
  {
    id: 'huitiemes',
    label: 'Huitièmes de finale',
    shortLabel: '1/8',
    test: p => p === 'Huitièmes de finale',
  },
  {
    id: 'quarts',
    label: 'Quarts de finale',
    shortLabel: 'Quarts',
    test: p => p === 'Quarts de finale',
  },
  {
    id: 'demis',
    label: 'Demi-finales',
    shortLabel: 'Demis',
    test: p => p === 'Demi-finales',
  },
  {
    id: 'finale',
    label: 'Finale & 3e place',
    shortLabel: 'Finale',
    test: p => p === 'Finale' || p === 'Troisième place',
  },
]

// Calcule la deadline d'une phase = veille du 1er match à 23:59:59
export function computePhaseDeadline(phaseMatchs) {
  if (!phaseMatchs.length) return null
  const firstDate = [...phaseMatchs]
    .map(m => new Date(m.date))
    .sort((a, b) => a - b)[0]
  const d = new Date(firstDate)
  d.setDate(d.getDate() - 1)
  d.setHours(23, 59, 59, 0)
  return d
}

// Retourne toutes les phases avec leur statut (pour SSR + API)
export function computePronoPhases(matchs) {
  const now = new Date()
  return PRONO_PHASES_CONFIG
    .map(config => {
      const phaseMatchs = matchs.filter(m => config.test(m.phase))
      if (!phaseMatchs.length) return null
      const deadline = computePhaseDeadline(phaseMatchs)
      return {
        id: config.id,
        label: config.label,
        shortLabel: config.shortLabel,
        matchs: phaseMatchs,
        deadlineISO: deadline?.toISOString() ?? null,
        isOpen: deadline ? now < deadline : false,
      }
    })
    .filter(Boolean)
}
